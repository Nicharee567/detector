import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const RegisterPage = ({ onRegisterSuccess, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        id: '',
        password: '',
        name: '',
        age: '',
        gender: 'Male',
        medical_history: '',
        social_media_handle: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post(`${API_BASE}/register`, {
                user_id: formData.id,
                password: formData.password,
                name: formData.name,
                age: formData.age,
                gender: formData.gender,
                medical_history: formData.medical_history,
                social_media_handle: formData.social_media_handle
            });

            // Success
            onRegisterSuccess();

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Registration failed. ID might already exist.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 bg-pattern flex items-center justify-center p-6 font-sans">
            <div className="max-w-2xl w-full glass-card p-10 rounded-3xl shadow-2xl animate-fade-in-up">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-emerald-500/30 transform -rotate-3 hover:-rotate-6 transition-transform">
                        📝
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Create Account</h1>
                    <p className="text-slate-500">Join us to monitor your mental well-being</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-pulse-soft">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-emerald-600 transition-colors">User ID *</label>
                            <input
                                name="id"
                                value={formData.id}
                                onChange={handleChange}
                                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white/50 font-mono"
                                placeholder="e.g. P-001"
                                required
                            />
                        </div>
                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-emerald-600 transition-colors">Password *</label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white/50"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-emerald-600 transition-colors">Full Name *</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white/50"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-emerald-600 transition-colors">Age</label>
                            <input
                                name="age"
                                type="number"
                                value={formData.age}
                                onChange={handleChange}
                                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white/50"
                                placeholder="25"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-emerald-600 transition-colors">Gender</label>
                            <div className="relative">
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full p-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white/50 appearance-none"
                                >
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-emerald-600 transition-colors">Medical History</label>
                        <textarea
                            name="medical_history"
                            value={formData.medical_history}
                            onChange={handleChange}
                            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white/50 resize-none"
                            rows="3"
                            placeholder="Brief history..."
                        ></textarea>
                    </div>

                    <div className="group">
                        <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-emerald-600 transition-colors">Social Media Handle</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                            <input
                                name="social_media_handle"
                                value={formData.social_media_handle}
                                onChange={handleChange}
                                className="w-full p-4 pl-10 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white/50"
                                placeholder="username"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        Already have an account?{' '}
                        <button
                            onClick={onSwitchToLogin}
                            className="text-emerald-600 font-bold hover:underline"
                        >
                            Sign in here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
