import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Simulation Data
const SAMPLE_POSTS = [
    "วันนี้อากาศดีจัง อยากไปเที่ยวทะเล 🌊",
    "รู้สึกเหนื่อยกับทุกอย่าง ไม่ไหวแล้ว...",
    "เพิ่งดูหนังเรื่องนี้จบ สนุกมาก! 🎬",
    "ทำไมชีวิตมันยากแบบนี้ อยากหายไปเลย",
    "กินข้าวกันครับทุกคน 🍛",
    "เบื่อโลก เบื่อผู้คน ไม่อยากตื่นมาเจอใคร",
    "วันนี้ทำงานเสร็จเร็ว ดีใจจัง",
    "ใครก็ได้ช่วยด้วย ไม่ไหวแล้วจริงๆ",
    "ฟังเพลงนี้แล้วคิดถึงแฟนเก่า 🎵 https://www.youtube.com/watch?v=cW8VLC9nnTo"
];

const PatientDashboard = ({ userId, onLogout }) => {
    const [postText, setPostText] = useState('');
    const [posts, setPosts] = useState([]);
    const [isPosting, setIsPosting] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = React.useRef(null);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
        }
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if (!postText.trim() && !selectedImage) return;

        setIsPosting(true);

        const newPost = {
            id: Date.now(),
            content: postText,
            image: selectedImage ? URL.createObjectURL(selectedImage) : null,
            timestamp: new Date().toISOString(),
            analyzing: true
        };
        setPosts([newPost, ...posts]);
        setPostText('');
        setSelectedImage(null);

        try {
            let res;
            if (selectedImage) {
                // Upload Image
                const formData = new FormData();
                formData.append('image', selectedImage);
                formData.append('user_id', userId);
                if (postText) formData.append('message', postText); // Optional context

                res = await axios.post(`${API_BASE}/analyze-image`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Text Only
                res = await axios.post(`${API_BASE}/analyze`, {
                    message: newPost.content,
                    user_id: userId
                });
            }

            setPosts(currentPosts =>
                currentPosts.map(p =>
                    p.id === newPost.id ? {
                        ...p,
                        analyzing: false,
                        result: res.data
                    } : p
                )
            );

        } catch (err) {
            console.error("Error posting:", err);
            setPosts(currentPosts =>
                currentPosts.map(p =>
                    p.id === newPost.id ? { ...p, analyzing: false } : p
                )
            );
        } finally {
            setIsPosting(false);
        }
    };

    const [isSimulating, setIsSimulating] = useState(false);

    const simulatePost = React.useCallback(async (text) => {
        const newPost = {
            id: Date.now(),
            content: text,
            timestamp: new Date().toISOString(),
            analyzing: true,
            isSimulated: true
        };

        // Add to top of feed
        setPosts(prev => [newPost, ...prev]);

        try {
            const res = await axios.post(`${API_BASE}/analyze`, {
                message: newPost.content,
                user_id: userId
            });

            setPosts(prev =>
                prev.map(p =>
                    p.id === newPost.id ? {
                        ...p,
                        analyzing: false,
                        result: res.data
                    } : p
                )
            );
        } catch (err) {
            console.error("Error analyzing simulated post:", err);
            setPosts(prev =>
                prev.map(p => p.id === newPost.id ? { ...p, analyzing: false } : p)
            );
        }
    }, [userId]);

    React.useEffect(() => {
        let interval;
        if (isSimulating) {
            interval = setInterval(() => {
                const randomText = SAMPLE_POSTS[Math.floor(Math.random() * SAMPLE_POSTS.length)];
                simulatePost(randomText);
            }, 3001); // New post every 3 seconds
        }
        return () => clearInterval(interval);
    }, [isSimulating, simulatePost]);

    const getBorderColor = (level) => {
        switch (level) {
            case 'RED': return 'border-red-500 ring-4 ring-red-500/10';
            case 'YELLOW': return 'border-yellow-500 ring-4 ring-yellow-500/10';
            case 'GREEN': return 'border-green-500 ring-4 ring-green-500/10';
            default: return 'border-white/60';
        }
    };

    return (
        <div className="min-h-screen bg-mesh font-sans pb-20 selection:bg-indigo-500 selection:text-white">
            {/* Navbar */}
            <div className="glass sticky top-0 z-50 shadow-sm backdrop-blur-xl border-b border-white/40">
                <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/30 text-xl transform hover:rotate-12 transition-transform duration-300">
                            M
                        </div>
                        <div className="font-black text-slate-800 text-2xl tracking-tighter">MySpace</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSimulating(!isSimulating)}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${isSimulating
                                ? 'bg-red-50 text-red-600 ring-2 ring-red-200 animate-pulse-soft shadow-red-200'
                                : 'bg-white text-indigo-600 hover:bg-indigo-50 ring-2 ring-indigo-50 shadow-indigo-100 hover:shadow-indigo-200'
                                }`}
                        >
                            {isSimulating ? '⏹ Stop Sim' : '▶ Simulate'}
                        </button>

                        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/60 shadow-sm hover:shadow-md transition-all">
                            <div className="w-7 h-7 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center text-sm text-white shadow-md">
                                👤
                            </div>
                            <span className="text-slate-700 text-sm font-bold">{userId}</span>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95"
                            title="Logout"
                        >
                            <span className="text-lg">➔</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Feed Content */}
            <div className="max-w-2xl mx-auto px-4 py-10">

                {/* Create Post Box */}
                <div className="glass-card rounded-[2rem] p-6 mb-10 animate-fade-in-up transform transition-all hover:shadow-2xl hover:shadow-indigo-500/10">
                    <div className="flex gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border border-white/50">
                            👤
                        </div>
                        <form onSubmit={handlePost} className="flex-1">
                            <textarea
                                value={postText}
                                onChange={(e) => setPostText(e.target.value)}
                                placeholder={`What's on your mind, ${userId}?`}
                                className="w-full bg-white/40 p-5 rounded-2xl border border-white/60 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white/60 resize-none text-lg placeholder-slate-400/80 transition-all shadow-inner backdrop-blur-sm"
                                rows="3"
                            />
                            <div className="flex justify-between items-center mt-5">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-3 hover:bg-green-50 text-green-500 rounded-2xl transition-all hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-green-500/20"
                                    >
                                        📷 <span className="text-sm font-bold ml-2">Photo</span>
                                    </button>
                                    <button type="button" className="p-3 hover:bg-red-50 text-red-500 rounded-2xl transition-all hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-red-500/20">
                                        🎥 <span className="text-sm font-bold ml-2">Video</span>
                                    </button>
                                    <button type="button" className="p-3 hover:bg-amber-50 text-amber-500 rounded-2xl transition-all hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-amber-500/20">
                                        😊 <span className="text-sm font-bold ml-2">Feeling</span>
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageSelect}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={(!postText.trim() && !selectedImage) || isPosting}
                                    className="btn-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform active:scale-95 hover:shadow-xl hover:shadow-indigo-500/30"
                                >
                                    {isPosting ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                    {selectedImage && (
                        <div className="mt-6 relative group inline-block">
                            <img
                                src={URL.createObjectURL(selectedImage)}
                                alt="Preview"
                                className="w-full h-80 object-cover rounded-3xl border-4 border-white shadow-lg"
                            />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500 transition-all backdrop-blur-md shadow-lg transform hover:rotate-90"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>

                {/* Feed Stream */}
                <div className="space-y-8">
                    {posts.map((post, index) => (
                        <div
                            key={post.id}
                            className={`glass-card rounded-[2.5rem] shadow-sm p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/5 ${post.result ? getBorderColor(post.result.level) : 'border-white/60'
                                } animate-fade-in-up`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 text-3xl shadow-sm border border-white/60">
                                        👤
                                    </div>
                                    <div>
                                        <div className="font-black text-slate-800 text-xl tracking-tight">
                                            {post.isSimulated ? 'Anonymous User' : userId}
                                        </div>
                                        <div className="text-xs text-slate-400 flex items-center gap-2 font-bold mt-1 uppercase tracking-wide">
                                            {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •
                                            <span className="text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-md">🌎 Public</span>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Badge */}
                                {post.result && (
                                    <div className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 shadow-sm border ${post.result.level === 'RED' ? 'bg-red-50 text-red-600 border-red-100' :
                                        post.result.level === 'YELLOW' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                            'bg-green-50 text-green-600 border-green-100'
                                        }`}>
                                        <span className="text-lg">{post.result.level === 'RED' ? '🚨' : post.result.level === 'YELLOW' ? '⚠️' : '✅'}</span>
                                        {post.result.level} RISK
                                    </div>
                                )}
                            </div>

                            <p className="text-slate-700 text-xl mb-6 leading-relaxed whitespace-pre-wrap font-medium tracking-tight">{post.content}</p>

                            {/* Image Display in Feed */}
                            {post.image && (
                                <div className="mb-6 relative group overflow-hidden rounded-3xl border-4 border-white shadow-md">
                                    <img
                                        src={post.image}
                                        alt="Post content"
                                        className={`w-full h-auto max-h-[500px] object-cover transition-all duration-700 transform group-hover:scale-105 ${post.result && (post.result.level === 'RED' || post.result.level === 'YELLOW')
                                            ? 'blur-2xl hover:blur-none cursor-pointer grayscale hover:grayscale-0'
                                            : ''
                                            }`}
                                    />
                                    {post.result && (post.result.level === 'RED' || post.result.level === 'YELLOW') && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:hidden transition-opacity duration-300">
                                            <div className="bg-black/70 text-white px-6 py-3 rounded-2xl text-base font-bold backdrop-blur-xl shadow-2xl border border-white/20 flex items-center gap-3">
                                                <span>⚠️</span> Sensitive Content
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {post.analyzing && (
                                <div className="flex items-center gap-3 text-sm text-indigo-600 bg-indigo-50/50 px-5 py-3 rounded-2xl w-fit mb-6 border border-indigo-100/50 animate-pulse">
                                    <span className="animate-spin text-xl">⏳</span>
                                    <span className="font-bold tracking-tight">AI is analyzing content...</span>
                                </div>
                            )}

                            {post.result && post.result.level !== 'GREEN' && (
                                <div className="mb-6 p-5 bg-gradient-to-br from-slate-50 to-white rounded-3xl text-sm text-slate-600 border border-slate-200/60 shadow-inner relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-600"></div>
                                    <div className="flex items-center gap-2 mb-3 pl-2">
                                        <div className="font-black text-slate-800 text-base">AI Analysis Results</div>
                                    </div>
                                    <div className="mb-3 pl-2 text-slate-600 leading-relaxed font-medium">{post.result.reason}</div>

                                    {/* Advanced Context Display */}
                                    {(post.result.content_type || post.result.media_context) && (
                                        <div className="mt-4 pt-4 border-t border-slate-200/50 text-xs pl-2">
                                            {post.result.content_type && (
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Content Type</span>
                                                    <span className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-slate-700 font-bold shadow-sm uppercase">{post.result.content_type}</span>
                                                </div>
                                            )}
                                            {post.result.media_context && (
                                                <div className="text-slate-500 italic bg-white/50 p-3 rounded-xl border border-slate-100 mt-2">
                                                    "{post.result.media_context}"
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Social Interactions */}
                            <div className="flex gap-4 pt-6 border-t border-slate-200/40">
                                <button
                                    onClick={() => alert("Liked! (Simulation)")}
                                    className="flex-1 py-3 text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all font-bold text-sm flex items-center justify-center gap-2 active:scale-95 group hover:shadow-lg hover:shadow-red-500/10"
                                >
                                    <span className="group-hover:scale-125 transition-transform text-lg">❤️</span> Like
                                </button>
                                <button
                                    onClick={() => alert("Comments feature coming soon!")}
                                    className="flex-1 py-3 text-slate-500 hover:bg-blue-50 hover:text-blue-500 rounded-2xl transition-all font-bold text-sm flex items-center justify-center gap-2 active:scale-95 group hover:shadow-lg hover:shadow-blue-500/10"
                                >
                                    <span className="group-hover:scale-125 transition-transform text-lg">💬</span> Comment
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(post.content);
                                        alert("Post content copied to clipboard!");
                                    }}
                                    className="flex-1 py-3 text-slate-500 hover:bg-green-50 hover:text-green-500 rounded-2xl transition-all font-bold text-sm flex items-center justify-center gap-2 active:scale-95 group hover:shadow-lg hover:shadow-green-500/10"
                                >
                                    <span className="group-hover:scale-125 transition-transform text-lg">↗</span> Share
                                </button>
                            </div>
                        </div>
                    ))}

                    {posts.length === 0 && (
                        <div className="text-center py-32 animate-fade-in-up">
                            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-6xl mx-auto mb-8 text-slate-200 shadow-xl border-4 border-white/50">
                                📝
                            </div>
                            <h3 className="text-slate-800 font-black text-2xl mb-3">No posts yet</h3>
                            <p className="text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">Share what's on your mind or click "Simulate Feed" using the button above.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
