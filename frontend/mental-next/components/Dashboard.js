import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PatientHistory from './PatientHistory';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const Dashboard = ({ onLogout }) => {
  const [patients, setPatients] = useState([]);
  const [message, setMessage] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  useEffect(() => {
    fetchPatients();
    const interval = setInterval(fetchPatients, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setAnalyzing(true);
    setLastResult(null);
    try {
      const res = await axios.post(`${API_BASE}/analyze`, {
        message,
        user_id: 'demo_user'
      });
      setLastResult(res.data);
      fetchPatients();
      setMessage('');
    } catch (err) {
      console.error("Error analyzing:", err);
      alert("Analysis failed. Check console.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getStatusColor = (level) => {
    switch (level) {
      case 'GREEN': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'YELLOW': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'RED': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusDot = (level) => {
    switch (level) {
      case 'GREEN': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
      case 'YELLOW': return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
      case 'RED': return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 bg-pattern p-6 lg:p-10 font-sans">
      {selectedPatientId && (
        <PatientHistory
          userId={selectedPatientId}
          onBack={() => setSelectedPatientId(null)}
        />
      )}

      <div className="max-w-7xl mx-auto animate-fade-in">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-center glass-card p-6 rounded-2xl">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <span className="text-4xl">⚡</span>
              <span>System <span className="text-gradient">Dashboard</span></span>
            </h1>
            <p className="text-slate-500 mt-1">Real-time Mental Health Monitoring Center</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <button onClick={onLogout} className="text-red-500 hover:text-red-700 font-bold px-4 py-2 flex items-center gap-2 transition-colors">
              <span>➔</span> Logout
            </button>
            <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
              System Active
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Simulation Input */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-8 h-full">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">📝</span>
                AI Simulator
              </h2>
              <form onSubmit={handleAnalyze}>
                <div className="relative">
                  <textarea
                    className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-slate-700 mb-4 bg-white/50 backdrop-blur-sm"
                    rows="6"
                    placeholder="Type a message or paste a YouTube link to test the AI..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                  <div className="absolute bottom-6 right-4 text-xs text-slate-400">
                    Supports Thai & English
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={analyzing}
                  className={`w-full py-3 px-6 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0 ${analyzing
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
                    }`}
                >
                  {analyzing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Analyze Message'}
                </button>
              </form>

              {lastResult && (
                <div className="mt-8 animate-fade-in-up">
                  <div className={`p-6 rounded-xl border ${getStatusColor(lastResult.level)} relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-black">
                      {lastResult.level}
                    </div>
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <span className="font-bold text-lg tracking-wide">{lastResult.level} RISK</span>
                      <span className="text-sm font-mono bg-white/50 px-2 py-1 rounded">Score: {lastResult.score}/10</span>
                    </div>
                    <p className="text-sm mb-4 opacity-90 relative z-10 font-medium">{lastResult.reason}</p>
                    {lastResult.recommendation && (
                      <div className="text-xs bg-white/80 p-3 rounded-lg shadow-sm relative z-10 flex gap-2 items-start">
                        <span>💡</span>
                        <span>{lastResult.recommendation}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Patient Dashboard */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-8 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">👥</span>
                  Monitored Patients
                </h2>
                <div className="flex gap-2">
                  <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200">
                    Total: {patients.length}
                  </span>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-100 flex-1">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 backdrop-blur">
                    <tr>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User Profile</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Current Status</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Activity</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white/50">
                    {patients.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-12 text-center text-slate-400 italic">
                          <div className="text-4xl mb-2">📭</div>
                          No patients tracked yet.
                        </td>
                      </tr>
                    ) : (
                      patients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-white/80 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-sm font-bold mr-3 shadow-md">
                                {patient.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-700">{patient.name}</div>
                                <div className="text-xs text-slate-400 font-mono">{patient.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(patient.status)}`}>
                              <span className={`w-2 h-2 rounded-full mr-2 ${getStatusDot(patient.status)}`}></span>
                              {patient.status}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-slate-500">
                            {patient.last_update ? new Date(patient.last_update).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedPatientId(patient.id)}
                              className="text-sm bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 px-4 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow"
                            >
                              View History
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
