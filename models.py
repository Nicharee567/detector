from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.String(50), primary_key=True)  # User ID (e.g., P-001)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(20))
    medical_history = db.Column(db.Text)
    social_media_handle = db.Column(db.String(100))
    registered_at = db.Column(db.DateTime, default=datetime.now)
    password_hash = db.Column(db.String(128)) # Store hashed password

    # Relationship to analyses
    analyses = db.relationship('AnalysisResult', backref='user', lazy=True)

    def set_password(self, password):
        from flask_bcrypt import generate_password_hash
        self.password_hash = generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        from flask_bcrypt import check_password_hash
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        # Helper to convert to JSON-friendly dict
        latest_status = 'UNKNOWN'
        last_update = None
        
        if self.analyses:
            # Sort by timestamp desc
            sorted_analyses = sorted(self.analyses, key=lambda x: x.timestamp, reverse=True)
            latest_status = sorted_analyses[0].result_level
            last_update = sorted_analyses[0].timestamp.isoformat()

        return {
            'id': self.id,
            'name': self.name,
            'age': self.age,
            'gender': self.gender,
            'medical_history': self.medical_history,
            'social_media_handle': self.social_media_handle,
            'status': latest_status,
            'last_update': last_update
        }

class AnalysisResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    result_level = db.Column(db.String(20)) # RED, YELLOW, GREEN
    score = db.Column(db.Integer)
    reason = db.Column(db.Text)
    keywords = db.Column(db.String(200)) # Store as comma-separated string
    recommendation = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.now)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'content': self.content,
            'result_level': self.result_level,
            'score': self.score,
            'reason': self.reason,
            'keywords': self.keywords.split(',') if self.keywords else [],
            'recommendation': self.recommendation,
            'timestamp': self.timestamp.isoformat()
        }

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), nullable=False) # Patient ID related to the alert
    message = db.Column(db.String(255), nullable=False)
    content_preview = db.Column(db.Text) # Text content, or Image URL
    content_type = db.Column(db.String(20)) # 'text', 'image', 'link'
    is_read = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.now)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'message': self.message,
            'content_preview': self.content_preview,
            'content_type': self.content_type,
            'is_read': self.is_read,
            'timestamp': self.timestamp.isoformat()
        }
