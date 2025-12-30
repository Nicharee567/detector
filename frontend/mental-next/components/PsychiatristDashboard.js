import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PatientHistory from './PatientHistory';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SERVER_URL = API_BASE.replace('/api', '');

const PsychiatristDashboard = ({ onBack }) => {
    const [redCases, setRedCases] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [activeTab, setActiveTab] = useState('cases'); // 'cases' or 'analytics'
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30s
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getAuthHeader = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const fetchData = async () => {
        try {
            const [casesRes, notifRes, analyticsRes] = await Promise.all([
                axios.get(`${API_BASE}/export/red-cases`, getAuthHeader()),
                axios.get(`${API_BASE}/notifications`, getAuthHeader()),
                axios.get(`${API_BASE}/analytics`, getAuthHeader())
            ]);

            setRedCases(casesRes.data);
            setNotifications(notifRes.data);
            setAnalyticsData(analyticsRes.data);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await axios.post(`${API_BASE}/notifications/${id}/read`, {}, getAuthHeader());
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (err) {
            console.error("Error marking notification read:", err);
        }
    };

    const handleExport = async () => {
        try {
            // Dynamically import jsPDF to avoid SSR issues if any
            const jsPDF = (await import('jspdf')).default;
            const autoTable = (await import('jspdf-autotable')).default;

            const doc = new jsPDF();

            // fetch latest data
            const response = await axios.get(`${API_BASE}/export/red-cases`, getAuthHeader());
            const data = response.data;

            // Header
            doc.setFontSize(18);
            doc.setTextColor(40);
            doc.text("Mental Health Critical Cases Report (RED)", 14, 22);

            doc.setFontSize(11);
            doc.setTextColor(100);
            const dateStr = new Date().toLocaleString('th-TH');
            doc.text(`Generated on: ${dateStr}`, 14, 30);

            // Table
            const tableColumn = ["Patient ID", "Name", "Age", "Status", "Last Update", "Risk Reason"];
            const tableRows = [];

            data.forEach(ticket => {
                const ticketData = [
                    ticket.ID,
                    ticket.Name,
                    ticket.Age,
                    ticket.Status,
                    new Date(ticket.Last_Update).toLocaleDateString(),
                    ticket.Risk_Reason
                ];
                tableRows.push(ticketData);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 40,
                styles: { fontSize: 10, cellPadding: 3 },
                headStyles: { fillColor: [239, 68, 68] }, // Red header
                alternateRowStyles: { fillColor: [254, 242, 242] }
            });

            doc.save(`Critical_Cases_Report_${Date.now()}.pdf`);

        } catch (err) {
            console.error("Export Error:", err);
            alert("Failed to generate PDF report");
        }
    };

    // Calculate Stats
    const totalCases = redCases.length;
    const avgScore = totalCases > 0
        ? (redCases.reduce((acc, curr) => acc + curr.score, 0) / totalCases).toFixed(1)
        : 0;
    const criticalCount = redCases.filter(c => c.score >= 8).length;

    // eslint-disable-next-line no-unused-vars
    // const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#CBD5E1'];

    return (
        <div className="min-h-screen bg-mesh p-6 lg:p-10 font-sans selection:bg-indigo-500 selection:text-white">
            {selectedPatientId && (
                <PatientHistory
                    userId={selectedPatientId}
                    onBack={() => setSelectedPatientId(null)}
                />
            )}

            <div className="max-w-7xl mx-auto animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <button onClick={onBack} className="text-red-500 hover:text-red-700 font-bold mb-2 flex items-center gap-2 transition-colors">
                            <span>➔</span> Logout
                        </button>
                        <h1 className="text-4xl font-extrabold text-slate-800 flex items-center gap-3 tracking-tight">
                            <span className="text-5xl drop-shadow-md">👨‍⚕️</span>
                            <span>Psychiatrist <span className="text-gradient-danger drop-shadow-sm">Dashboard</span></span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 hover:bg-white transition-all relative group"
                            >
                                <span className="text-2xl group-hover:animate-pulse-soft">🔔</span>
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full animate-bounce shadow-lg ring-2 ring-white">
                                        {notifications.length}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-4 w-96 glass-card rounded-3xl z-50 overflow-hidden animate-fade-in-up origin-top-right">
                                    <div className="p-5 border-b border-indigo-50/50 bg-white/40 backdrop-blur-md flex justify-between items-center">
                                        <span className="font-bold text-slate-800 text-lg">Notifications</span>
                                        <span className="text-xs bg-indigo-500 text-white px-3 py-1 rounded-full shadow-sm">{notifications.length} New</span>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-10 text-center text-slate-400">
                                                <div className="text-4xl mb-3">✨</div>
                                                <div className="text-sm font-medium">All caught up!</div>
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.id} className="p-5 border-b border-indigo-50/30 hover:bg-white/40 transition-colors cursor-default">
                                                    <div className="flex gap-3">
                                                        <div className="w-2 h-2 mt-2 rounded-full bg-red-400 shrink-0"></div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-semibold text-slate-800 mb-1 leading-relaxed">{n.message}</div>

                                                            {/* Context Display */}
                                                            {n.content_type && (
                                                                <div className="mt-2 mb-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
                                                                    {n.content_type === 'image' ? (
                                                                        <div>
                                                                            <div className="font-bold text-slate-500 mb-1">📸 Suspicious Image:</div>
                                                                            <img src={`${SERVER_URL}${n.content_preview}`} alt="Evidence" className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                                                                        </div>
                                                                    ) : n.content_type === 'link' ? (
                                                                        <div>
                                                                            <div className="font-bold text-slate-500 mb-1">🔗 Suspicious Link:</div>
                                                                            <a href={n.content_preview} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                                                                {n.content_preview}
                                                                            </a>
                                                                        </div>
                                                                    ) : (
                                                                        <div>
                                                                            <div className="font-bold text-slate-500 mb-1">📝 Context:</div>
                                                                            <div className="italic">"{n.content_preview}"</div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <div className="flex justify-between items-center mt-3">
                                                                <span className="text-xs text-slate-400 font-medium">{new Date(n.timestamp).toLocaleTimeString()}</span>
                                                                <button
                                                                    onClick={() => handleMarkRead(n.id)}
                                                                    className="text-xs text-indigo-600 font-bold hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-lg transition-colors"
                                                                >
                                                                    Mark Read
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleExport}
                            className="btn-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-500/20 active:ring-2 transition-all flex items-center gap-3 transform active:scale-95"
                        >
                            <span>📥</span> Export Report
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-10 bg-white/40 backdrop-blur-md p-2 rounded-2xl w-fit border border-white/50 shadow-sm">
                    <button
                        onClick={() => setActiveTab('cases')}
                        className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === 'cases'
                            ? 'bg-white text-indigo-600 shadow-md ring-1 ring-indigo-100'
                            : 'text-slate-500 hover:text-indigo-500 hover:bg-white/50'}`}
                    >
                        📋 Critical Cases
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === 'analytics'
                            ? 'bg-white text-indigo-600 shadow-md ring-1 ring-indigo-100'
                            : 'text-slate-500 hover:text-indigo-500 hover:bg-white/50'}`}
                    >
                        📈 Analytics
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'cases' ? (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-fade-in-up">
                            <div className="glass-card rounded-3xl p-8 flex items-center gap-6 group cursor-pointer">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-4xl shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform duration-300">🚨</div>
                                <div>
                                    <div className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Total Red Cases</div>
                                    <div className="text-5xl font-black text-slate-800">{totalCases}</div>
                                </div>
                            </div>
                            <div className="glass-card rounded-3xl p-8 flex items-center gap-6 group cursor-pointer" style={{ animationDelay: '100ms' }}>
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-4xl shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">🔥</div>
                                <div>
                                    <div className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Critical (8+)</div>
                                    <div className="text-5xl font-black text-slate-800">{criticalCount}</div>
                                </div>
                            </div>
                            <div className="glass-card rounded-3xl p-8 flex items-center gap-6 group cursor-pointer" style={{ animationDelay: '200ms' }}>
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-4xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">📊</div>
                                <div>
                                    <div className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Avg Risk Score</div>
                                    <div className="text-5xl font-black text-slate-800">{avgScore}<span className="text-xl text-slate-400 font-medium ml-1">/10</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="glass-card rounded-3xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                            <div className="p-8 bg-white/40 border-b border-white/50 flex justify-between items-center backdrop-blur-md">
                                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-4">
                                    <span className="relative flex h-5 w-5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 shadow-lg shadow-red-500/50"></span>
                                    </span>
                                    Critical Cases (Red Status)
                                </h2>
                                <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-red-500/20">
                                    {redCases.length} Cases Found
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-indigo-50/30 border-b border-indigo-50">
                                        <tr>
                                            <th className="p-6 pl-8 text-xs font-black text-slate-400 uppercase tracking-widest">Patient ID</th>
                                            <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Risk Score</th>
                                            <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Key Reason</th>
                                            <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Last Detected</th>
                                            <th className="p-6 pr-8 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-indigo-50/50">
                                        {redCases.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="p-24 text-center text-slate-400">
                                                    <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center text-6xl mx-auto mb-8 text-green-500 shadow-inner ring-8 ring-green-50/50">✅</div>
                                                    <div className="text-2xl font-bold text-slate-700 mb-3">No critical cases detected</div>
                                                    <div className="text-slate-500">All monitored patients are within safe limits.</div>
                                                </td>
                                            </tr>
                                        ) : (
                                            redCases.map((c, i) => (
                                                <tr key={i} className="hover:bg-white/60 transition-all duration-300 group">
                                                    <td className="p-6 pl-8 font-bold text-slate-700">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                                                {c.user_id.substring(0, 2)}
                                                            </div>
                                                            <span className="text-lg tracking-tight">{c.user_id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-1 h-3 w-32 bg-slate-100 rounded-full overflow-hidden shadow-inner ring-1 ring-black/5">
                                                                <div className={`h-full rounded-full transition-all duration-1000 ease-out ${c.score >= 8 ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-orange-400 to-red-400'}`} style={{ width: `${(c.score / 10) * 100}%` }}></div>
                                                            </div>
                                                            <span className={`font-black text-xl ${c.score >= 8 ? 'text-red-600' : 'text-orange-500'}`}>{c.score}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 max-w-xs">
                                                        <div className="truncate text-slate-600 font-medium px-3 py-1.5 rounded-lg bg-white/50 border border-white/60 w-fit backdrop-blur-sm" title={c.reason}>
                                                            {c.reason}
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-sm text-slate-500 font-medium">
                                                        {new Date(c.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </td>
                                                    <td className="p-6 pr-8 text-right">
                                                        <button onClick={() => setSelectedPatientId(c.user_id)} className="text-sm bg-white border border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95">
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
                    </>
                ) : (
                    /* Analytics Tab */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in-up">
                        {/* Risk Distribution Pie Chart */}
                        <div className="glass-card p-10 rounded-3xl">
                            <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                                <span className="bg-indigo-100/50 text-indigo-600 p-3 rounded-2xl">📊</span>
                                Patient Risk Distribution
                            </h3>
                            <div className="h-[400px]">
                                {analyticsData ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={analyticsData.risk_distribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={80}
                                                outerRadius={140}
                                                paddingAngle={8}
                                                dataKey="value"
                                                cornerRadius={10}
                                            >
                                                {analyticsData.risk_distribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    backdropFilter: 'blur(10px)',
                                                    borderRadius: '16px',
                                                    border: '1px solid rgba(255,255,255,0.5)',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                    padding: '12px 16px'
                                                }}
                                                itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : <div className="flex items-center justify-center h-full text-slate-400 animate-pulse">Loading Analytics...</div>}
                            </div>
                        </div>

                        {/* Trend Line Chart */}
                        <div className="glass-card p-10 rounded-3xl">
                            <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                                <span className="bg-purple-100/50 text-purple-600 p-3 rounded-2xl">📈</span>
                                7-Day Risk Trend
                            </h3>
                            <div className="h-[400px]">
                                {analyticsData ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={analyticsData.trend_data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                stroke="#94a3b8"
                                                axisLine={false}
                                                tickLine={false}
                                                dy={10}
                                                style={{ fontSize: '12px', fontWeight: 'bold' }}
                                            />
                                            <YAxis
                                                stroke="#94a3b8"
                                                axisLine={false}
                                                tickLine={false}
                                                dx={-10}
                                                style={{ fontSize: '12px', fontWeight: 'bold' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    backdropFilter: 'blur(10px)',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="avgScore"
                                                stroke="#4f46e5"
                                                strokeWidth={4}
                                                dot={{ r: 6, fill: '#4f46e5', strokeWidth: 4, stroke: '#fff' }}
                                                activeDot={{ r: 10, fill: '#4f46e5', strokeWidth: 0, shadow: '0 0 20px rgba(79, 70, 229, 0.5)' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : <div className="flex items-center justify-center h-full text-slate-400 animate-pulse">Loading Analytics...</div>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PsychiatristDashboard;
