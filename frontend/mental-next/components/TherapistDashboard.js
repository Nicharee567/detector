import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PatientHistory from './PatientHistory';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const TherapistDashboard = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('list'); // 'register' or 'list'
    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        age: '',
        gender: 'Male',
        medical_history: '',
        social_media_handle: ''
    });
    const [status, setStatus] = useState(null);

    useEffect(() => {
        if (activeTab === 'list') {
            fetchPatients();
        }
    }, [activeTab]);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/patients`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(res.data);
        } catch (err) {
            console.error("Error fetching patients:", err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('saving');
        try {
            await axios.post(`${API_BASE}/patients`, {
                user_id: formData.id,
                ...formData
            });
            setStatus('success');
            setTimeout(() => {
                setStatus(null);
                setActiveTab('list'); // Switch to list view after success
            }, 2000);
            setFormData({ id: '', name: '', age: '', gender: 'Male', medical_history: '', social_media_handle: '' });
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    const getStatusColor = (level) => {
        switch (level) {
            case 'GREEN': return 'bg-emerald-100 text-emerald-700';
            case 'YELLOW': return 'bg-amber-100 text-amber-700';
            case 'RED': return 'bg-rose-100 text-rose-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    // Stats
    const totalPatients = patients.length;
    const criticalPatients = patients.filter(p => p.status === 'RED').length;

    return (
        <div className="min-h-screen bg-emerald-50 bg-pattern p-6 lg:p-10 font-sans">
            {selectedPatientId && (
                <PatientHistory
                    userId={selectedPatientId}
                    onBack={() => setSelectedPatientId(null)}
                />
            )}

            <div className="max-w-7xl mx-auto animate-fade-in">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <button onClick={onBack} className="text-red-500 hover:text-red-700 font-bold mb-2 flex items-center gap-2 transition-colors">
                            <span>➔</span> Logout
                        </button>
                        <h1 className="text-4xl font-extrabold text-slate-800 flex items-center gap-3 tracking-tight">
                            <span className="text-5xl">🌿</span>
                            <span>Therapist <span className="text-gradient">Dashboard</span></span>
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg">Manage patients and monitor their mental health status</p>
                    </div>

                    <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-emerald-100">
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'list'
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                                : 'text-slate-500 hover:bg-emerald-50'
                                }`}
                        >
                            Patient List
                        </button>
                        <button
                            onClick={() => setActiveTab('register')}
                            className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'register'
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                                : 'text-slate-500 hover:bg-emerald-50'
                                }`}
                        >
                            + Register New
                        </button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-fade-in-up">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-50 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl text-emerald-600">
                            👥
                        </div>
                        <div>
                            <div className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total Patients</div>
                            <div className="text-4xl font-extrabold text-slate-800">{totalPatients}</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-50 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-3xl text-red-600">
                            🚨
                        </div>
                        <div>
                            <div className="text-slate-500 font-bold text-sm uppercase tracking-wider">Critical Cases</div>
                            <div className="text-4xl font-extrabold text-slate-800">{criticalPatients}</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-50 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-3xl text-blue-600">
                            📅
                        </div>
                        <div>
                            <div className="text-slate-500 font-bold text-sm uppercase tracking-wider">Appointments</div>
                            <div className="text-4xl font-extrabold text-slate-800">12</div>
                        </div>
                    </div>
                </div>

                {activeTab === 'list' ? (
                    <div className="glass-card rounded-3xl overflow-hidden shadow-xl border border-emerald-100 p-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-800">All Patients ({patients.length})</h2>
                            <button onClick={fetchPatients} className="text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-xl transition-colors font-bold flex items-center gap-2">
                                🔄 Refresh List
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {patients.length === 0 ? (
                                <div className="col-span-full text-center py-20 text-slate-400">
                                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 text-emerald-300 shadow-inner">
                                        📭
                                    </div>
                                    <p className="text-xl font-bold text-slate-600">No patients registered yet.</p>
                                    <p className="text-slate-400 mt-2">Click "Register New" to add your first patient.</p>
                                </div>
                            ) : (
                                patients.map((patient, index) => (
                                    <div
                                        key={patient.id}
                                        className="bg-white p-6 rounded-3xl border border-emerald-50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 flex items-center justify-center font-bold text-xl shadow-sm group-hover:scale-110 transition-transform">
                                                    {patient.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-lg">{patient.name}</h3>
                                                    <p className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded w-fit mt-1">{patient.id}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusColor(patient.status)}`}>
                                                {patient.status}
                                            </span>
                                        </div>

                                        <div className="space-y-3 mb-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                            <div className="text-sm text-slate-600 flex justify-between border-b border-slate-100 pb-2">
                                                <span className="text-slate-400">Age/Gender</span>
                                                <span className="font-bold text-slate-700">{patient.age} / {patient.gender}</span>
                                            </div>
                                            <div className="text-sm text-slate-600">
                                                <span className="block mb-1 text-slate-400 text-xs uppercase tracking-wider font-bold">Medical History</span>
                                                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                                    {patient.medical_history || 'No history provided'}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setSelectedPatientId(patient.id)}
                                            className="w-full py-3 border border-emerald-200 text-emerald-600 rounded-xl font-bold hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                                        >
                                            <span>📜</span> View History
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto glass-card p-10 rounded-3xl shadow-2xl animate-fade-in-up">
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 text-emerald-600 shadow-sm">
                                📝
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Register New Patient</h2>
                            <p className="text-slate-500">Enter patient details to begin monitoring</p>
                        </div>

                        {status === 'success' && (
                            <div className="mb-8 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-4 animate-fade-in shadow-sm">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-xl">✅</div>
                                <div>
                                    <div className="font-bold text-lg">Success!</div>
                                    <div className="text-sm opacity-90">Patient registered successfully. Redirecting...</div>
                                </div>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="mb-8 bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center gap-4 animate-fade-in shadow-sm">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-xl">❌</div>
                                <div>
                                    <div className="font-bold text-lg">Error</div>
                                    <div className="text-sm opacity-90">Could not register patient. ID might already exist.</div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="group">
                                    <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-emerald-600 transition-colors">Patient ID *</label>
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            ▼
                                        </div>
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
                                    rows="4"
                                    placeholder="Brief history of mental health issues..."
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
                                disabled={status === 'saving'}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                            >
                                {status === 'saving' ? 'Registering...' : 'Register Patient'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TherapistDashboard;
