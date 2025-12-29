from flask import Flask, request, jsonify
from flask_cors import CORS
from analyzer import MentalHealthAnalyzer
from models import db, User, AnalysisResult, Notification
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
import os
import json
from datetime import datetime, timedelta

from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__)
CORS(app)

# Database Configuration
# For now, we use SQLite. To switch to PostgreSQL, just change this URI.
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mental_health_v3.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'dev-secret-key' # Required for Flask-Admin
app.config['JWT_SECRET_KEY'] = 'jwt-secret-key-change-this-in-prod'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['UPLOAD_FOLDER'] = 'static/uploads'

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db.init_app(app)
jwt = JWTManager(app)

# Initialize Analyzer
API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyDXOvQP-uX5971zzbKHLhPW8-PgGV91UvI") 
analyzer = MentalHealthAnalyzer(api_key=API_KEY)

# Setup Flask-Admin
admin = Admin(app, name='Mental Health Admin')
admin.add_view(ModelView(User, db.session))
admin.add_view(ModelView(AnalysisResult, db.session))
admin.add_view(ModelView(Notification, db.session))

# Create DB tables if they don't exist
with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return "Mental Health Detector API is running (with Database & Admin)!", 200

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "ai_ready": analyzer.model is not None, "db": "connected"})

# --- AUTH ENDPOINTS ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    user_id = data.get('user_id')
    password = data.get('password')
    
    if not user_id or not password:
        return jsonify({"error": "User ID and Password are required"}), 400
        
    if User.query.get(user_id):
        return jsonify({"error": "User ID already exists"}), 400
        
    new_user = User(
        id=user_id,
        name=data.get('name'),
        age=data.get('age'),
        gender=data.get('gender'),
        medical_history=data.get('medical_history'),
        social_media_handle=data.get('social_media_handle')
    )
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "User registered successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user_id = data.get('user_id')
    password = data.get('password')
    
    user = User.query.get(user_id)
    
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401
        
    access_token = create_access_token(identity=user_id)
    return jsonify({"access_token": access_token, "user": user.to_dict()}), 200

# --- PROTECTED ENDPOINTS ---

@app.route('/api/debug/reset/<user_id>', methods=['GET'])
def debug_reset(user_id):
    user = User.query.get(user_id)
    if user:
        user.set_password('admin')
        db.session.commit()
        return jsonify({"message": f"Password for {user_id} reset to 'admin'"})
    return jsonify({"error": "User not found"}), 404

@app.route('/api/analyze', methods=['POST'])
@jwt_required(optional=True) # Optional because we might want to allow anonymous analysis for demo
def analyze_message():
    data = request.json
    message = data.get('message', '')
    
    # If logged in, use the identity from token, otherwise check payload or default to anonymous
    current_user_id = get_jwt_identity()
    user_id = current_user_id if current_user_id else data.get('user_id', 'anonymous')
    
    if not message:
        return jsonify({"error": "No message provided"}), 400

    # 1. Check for URLs
    urls = analyzer.check_url_in_text(message)
    content_type = 'text'
    if urls:
        content_type = 'link'
    
    # 2. Analyze Text
    result = analyzer.analyze_text(message)
    
    # 3. Analyze URLs (if any)
    url_results = []
    for url in urls:
        if 'youtube.com' in url or 'youtu.be' in url:
            yt_result = analyzer.analyze_youtube_url(url)
            url_results.append({
                'url': url,
                'analysis': yt_result
            })
            
            if yt_result.get('level') == 'RED':
                result['level'] = 'RED'
                result['reason'] += f" [จากลิงก์: {yt_result.get('reason')}]"
            elif yt_result.get('level') == 'YELLOW' and result.get('level') == 'GREEN':
                result['level'] = 'YELLOW'
                result['reason'] += f" [จากลิงก์: {yt_result.get('reason')}]"

    result['url_analyses'] = url_results
    result['user_id'] = user_id
    
    # Save to Database
    try:
        # Check if user exists, if not create a temporary one (or link if registered)
        user = User.query.get(user_id)
        if not user:
            # If user doesn't exist (e.g. from simulation), create a placeholder
            user = User(id=user_id, name=f"Guest {user_id}", age=0, gender="Unknown")
            db.session.add(user)
            db.session.commit()

        # Create Analysis Record
        analysis_record = AnalysisResult(
            user_id=user_id,
            content=message,
            result_level=result.get('level'),
            score=result.get('score', 0),
            reason=result.get('reason', ''),
            keywords=','.join(result.get('keywords', [])),
            recommendation=result.get('recommendation', '')
        )
        db.session.add(analysis_record)
        
        # --- NOTIFICATION TRIGGER ---
        if result.get('level') == 'RED':
            notification = Notification(
                user_id=user_id,
                message=f"CRITICAL: High risk detected for patient {user.name} ({user_id}). Score: {result.get('score')}",
                content_preview=message,
                content_type=content_type
            )
            db.session.add(notification)
            
        db.session.commit()
        
    except Exception as e:
        print(f"Database Error: {e}")
        # Don't fail the request if DB fails, just log it
    
    return jsonify(result)

@app.route('/api/analyze-image', methods=['POST'])
@jwt_required(optional=True)
def analyze_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    try:
        # Read file content
        image_data = file.read()
        
        # Analyze
        result = analyzer.analyze_image(image_data)
        
        current_user_id = get_jwt_identity()
        user_id = current_user_id if current_user_id else request.form.get('user_id', 'anonymous')
        
        # Determine image path for generic saving or specific alert saving
        # Ideally we only save if needed, but for 'context' we might need to serve it.
        # Let's save if RED or YELLOW to save space, or just save all for now (prototype).
        
        filename = f"{user_id}_{int(datetime.now().timestamp())}_{file.filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # We read the file, so we need to seek back or write bytes
        with open(file_path, 'wb') as f:
            f.write(image_data)
            
        image_url = f"/static/uploads/{filename}"

        # Save to DB
        user = User.query.get(user_id)
        if not user:
             user = User(id=user_id, name=f"Guest {user_id}", age=0, gender="Unknown")
             db.session.add(user)
             db.session.commit()
             
        analysis_record = AnalysisResult(
            user_id=user_id,
            content=f"[Image Analysis] {image_url}",
            result_level=result.get('level'),
            score=result.get('score', 0),
            reason=result.get('reason', ''),
            keywords=','.join(result.get('keywords', [])),
            recommendation=result.get('recommendation', '')
        )
        db.session.add(analysis_record)

        if result.get('level') == 'RED':
             notification = Notification(
                user_id=user_id,
                message=f"CRITICAL IMAGE: High risk detected for patient {user.name} ({user_id}).",
                content_preview=image_url,
                content_type='image'
            )
             db.session.add(notification)

        db.session.commit()
        
        result['image_url'] = image_url
        return jsonify(result)

    except Exception as e:
        print(f"Image Analysis Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/patients', methods=['GET', 'POST'])
@jwt_required()
def handle_patients():
    if request.method == 'POST':
        # Therapist registering a new patient
        data = request.json
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
            
        if User.query.get(user_id):
            return jsonify({"error": "User ID already exists"}), 400
            
        new_user = User(
            id=user_id,
            name=data.get('name'),
            age=data.get('age'),
            gender=data.get('gender'),
            medical_history=data.get('medical_history'),
            social_media_handle=data.get('social_media_handle')
        )
        # If created by therapist, set a default password (e.g., user_id)
        new_user.set_password(user_id) 
        
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Patient registered successfully", "user_id": user_id})

    # GET: Return list of users
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])

@app.route('/api/export/red-cases', methods=['GET'])
@jwt_required()
def export_red_cases():
    # Find all users who have at least one RED analysis
    users = User.query.all()
    red_cases = []
    
    for user in users:
        user_data = user.to_dict()
        if user_data['status'] == 'RED':
            # Get latest reason
            latest_reason = "N/A"
            if user.analyses:
                sorted_analyses = sorted(user.analyses, key=lambda x: x.timestamp, reverse=True)
                latest_reason = sorted_analyses[0].reason
                
            red_cases.append({
                'ID': user.id,
                'Name': user.name,
                'Age': user.age,
                'Status': 'RED',
                'Last_Update': user_data['last_update'],
                'Risk_Reason': latest_reason
            })
            
    return jsonify(red_cases)

@app.route('/api/history/<user_id>', methods=['GET'])
@jwt_required()
def get_history(user_id):
    # Optional: Check if current_user is allowed to view this history
    # current_user = get_jwt_identity()
    # if current_user != user_id and not is_therapist(current_user): return 403
    
    analyses = AnalysisResult.query.filter_by(user_id=user_id).order_by(AnalysisResult.timestamp.desc()).all()
    return jsonify([a.to_dict() for a in analyses])

# --- NOTIFICATION & ANALYTICS ENDPOINTS ---

@app.route('/api/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    # In a real app, filter by recipient (e.g. only psychiatrists see alerts)
    notifications = Notification.query.filter_by(is_read=False).order_by(Notification.timestamp.desc()).all()
    return jsonify([n.to_dict() for n in notifications])

@app.route('/api/notifications/<int:id>/read', methods=['POST'])
@jwt_required()
def mark_notification_read(id):
    notification = Notification.query.get(id)
    if notification:
        notification.is_read = True
        db.session.commit()
        return jsonify({"message": "Marked as read"})
    return jsonify({"error": "Notification not found"}), 404

@app.route('/api/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    # 1. Risk Distribution
    users = User.query.all()
    risk_counts = {'RED': 0, 'YELLOW': 0, 'GREEN': 0, 'UNKNOWN': 0}
    
    for user in users:
        status = user.to_dict().get('status', 'UNKNOWN')
        if status in risk_counts:
            risk_counts[status] += 1
        else:
            risk_counts['UNKNOWN'] += 1
            
    # 2. Trend Data (Last 7 days avg score)
    # This is a simplified mock-up. Real implementation would aggregate by date.
    trend_data = [
        {'date': 'Mon', 'avgScore': 4.5},
        {'date': 'Tue', 'avgScore': 5.2},
        {'date': 'Wed', 'avgScore': 4.8},
        {'date': 'Thu', 'avgScore': 6.1},
        {'date': 'Fri', 'avgScore': 5.5},
        {'date': 'Sat', 'avgScore': 4.2},
        {'date': 'Sun', 'avgScore': 4.9},
    ]
    
    return jsonify({
        "risk_distribution": [
            {"name": "High Risk (Red)", "value": risk_counts['RED'], "color": "#EF4444"},
            {"name": "Moderate (Yellow)", "value": risk_counts['YELLOW'], "color": "#F59E0B"},
            {"name": "Low Risk (Green)", "value": risk_counts['GREEN'], "color": "#10B981"},
        ],
        "trend_data": trend_data
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)