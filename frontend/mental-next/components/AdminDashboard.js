import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const AdminDashboard = ({ onLogout }) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'users'
    const [analyticsData, setAnalyticsData] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // New States for Appointment Feature
    const [searchTerm, setSearchTerm] = useState('');
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [selectedUserForAppointment, setSelectedUserForAppointment] = useState(null);

    // Derived filtered users
    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Mock slice for pagination
    const paginatedUsers = filteredUsers.slice(0, 10);

    const getAuthHeader = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [analyticsRes, usersRes] = await Promise.all([
                axios.get(`${API_BASE}/analytics`, getAuthHeader()),
                axios.get(`${API_BASE}/users`, getAuthHeader())
            ]);
            setAnalyticsData(analyticsRes.data);
            setUsers(usersRes.data);
        } catch (err) {
            console.error("Error fetching admin data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm(`Are you sure you want to delete user ${userId}? This cannot be undone.`)) return;

        try {
            await axios.delete(`${API_BASE}/users/${userId}`, getAuthHeader());
            setUsers(users.filter(u => u.id !== userId));
            alert(`User ${userId} deleted successfully.`);
        } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete user.");
        }
    };

    // Calculate Stats
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.id.toUpperCase().startsWith('ADMIN')).length;
    const patientCount = users.filter(u => !u.id.toUpperCase().startsWith('ADMIN') && !u.id.toUpperCase().startsWith('DR') && !u.id.toUpperCase().startsWith('T')).length;

    // Mock Yearly/Monthly data (as backend only sends one trend set currently)
    const mockMonthlyData = [
        { name: 'Week 1', value: 45 }, { name: 'Week 2', value: 60 },
        { name: 'Week 3', value: 35 }, { name: 'Week 4', value: 70 }
    ];

    // eslint-disable-next-line no-unused-vars
    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

    return (
        <div className="min-h-screen bg-mesh p-6 lg:p-10 font-sans selection:bg-indigo-500 selection:text-white">
            <div className="max-w-7xl mx-auto animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-800 flex items-center gap-3 tracking-tight">
                            <span className="text-5xl drop-shadow-md">🛠️</span>
                            <span>System <span className="text-gradient-primary drop-shadow-sm">Admin</span></span>
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">System Overview & User Management</p>
                    </div>

                    <div className="flex gap-3">
                        <div className="bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/60 shadow-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-sm font-bold text-slate-600">System Online</span>
                        </div>
                        <button onClick={onLogout} className="btn-secondary text-sm px-6 py-2 rounded-xl font-bold bg-white text-red-500 hover:bg-red-50 border border-red-50 hover:border-red-200">
                            Logout
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-10 bg-white/40 backdrop-blur-md p-2 rounded-2xl w-fit border border-white/50 shadow-sm">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === 'dashboard'
                            ? 'bg-white text-indigo-600 shadow-md ring-1 ring-indigo-100'
                            : 'text-slate-500 hover:text-indigo-500 hover:bg-white/50'}`}
                    >
                        📊 Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === 'users'
                            ? 'bg-white text-indigo-600 shadow-md ring-1 ring-indigo-100'
                            : 'text-slate-500 hover:text-indigo-500 hover:bg-white/50'}`}
                    >
                        👥 รายชื่อนักศึกษา
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-96 text-slate-400">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
                    </div>
                ) : (
                    <>
                        {/* DASHBOARD TAB */}
                        {activeTab === 'dashboard' && (
                            <div className="animate-fade-in-up">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                                    <div className="glass-card p-6 rounded-3xl">
                                        <div className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Total Users</div>
                                        <div className="text-4xl font-black text-slate-800">{totalUsers}</div>
                                    </div>
                                    <div className="glass-card p-6 rounded-3xl">
                                        <div className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Patients</div>
                                        <div className="text-4xl font-black text-indigo-600">{patientCount}</div>
                                    </div>
                                    <div className="glass-card p-6 rounded-3xl">
                                        <div className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">High Risk (Red)</div>
                                        <div className="text-4xl font-black text-red-500">
                                            {analyticsData?.risk_distribution.find(r => r.name.includes('Red'))?.value || 0}
                                        </div>
                                    </div>
                                    <div className="glass-card p-6 rounded-3xl">
                                        <div className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">System Load</div>
                                        <div className="text-4xl font-black text-emerald-500">Normal</div>
                                    </div>
                                </div>

                                {/* Charts */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="glass-card p-8 rounded-3xl">
                                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                            <span>📉</span> User Registration & Risk
                                        </h3>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={analyticsData?.trend_data || []}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                                                    <YAxis axisLine={false} tickLine={false} />
                                                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                    <Bar dataKey="avgScore" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Avg Risk Score" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="glass-card p-8 rounded-3xl">
                                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                            <span>🥧</span> Risk Distribution
                                        </h3>
                                        <div className="h-80">
                                            {analyticsData && (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={analyticsData.risk_distribution}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={100}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                            cornerRadius={5}
                                                        >
                                                            {analyticsData.risk_distribution.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* USERS TAB - STUDENT LIST */}
                        {activeTab === 'users' && (
                            <div className="animate-fade-in-up">
                                <div className="glass-card rounded-[2rem] overflow-hidden min-h-[600px] relative">
                                    {/* Toolbar */}
                                    <div className="p-8 border-b border-indigo-50 flex flex-col md:flex-row justify-between items-center bg-white/40 backdrop-blur-sm gap-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-800">รายชื่อนักศึกษาทุกระดับ</h3>
                                            <p className="text-slate-500 text-sm">จัดการข้อมูลและนัดหมายนักศึกษา</p>
                                        </div>

                                        <div className="flex gap-3 w-full md:w-auto">
                                            <div className="relative flex-1 md:w-64">
                                                <input
                                                    type="text"
                                                    placeholder="🔍 Search name, id..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none bg-white/80"
                                                />
                                            </div>
                                            <button
                                                onClick={() => router.push('/register')}
                                                className="btn-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 whitespace-nowrap"
                                            >
                                                + เพิ่มนักศึกษา
                                            </button>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-indigo-50/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                                                <tr>
                                                    <th className="p-6">ชื่อ-สกุล</th>
                                                    <th className="p-6">คณะ</th>
                                                    <th className="p-6">ชั้นปี</th>
                                                    <th className="p-6">เบอร์โทร</th>
                                                    <th className="p-6">อาการ</th>
                                                    <th className="p-6">ระดับอาการ</th>
                                                    <th className="p-6 text-center">การนัดหมาย</th>
                                                    <th className="p-6 text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-indigo-50/50">
                                                {paginatedUsers.length > 0 ? (
                                                    paginatedUsers.map((u, index) => {
                                                        // Mock data for missing fields
                                                        const userHash = u.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
                                                        const faculty = ['วิศวกรรมศาสตร์', 'บริหารธุรกิจ', 'มนุษยศาสตร์', 'วิทยาศาสตร์'][userHash % 4];
                                                        const year = (userHash % 4) + 1;
                                                        const phone = `08${userHash % 10}-${(userHash * 2) % 1000}-${(userHash * 3) % 10000}`;

                                                        return (
                                                            <tr key={u.id} className="hover:bg-indigo-50/30 transition-colors group">
                                                                <td className="p-6">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold text-slate-700">{u.name}</span>
                                                                        <span className="text-xs text-slate-400">{u.id}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="p-6 text-slate-600">{faculty}</td>
                                                                <td className="p-6 text-slate-600">{year}</td>
                                                                <td className="p-6 text-slate-600 font-mono text-xs">{phone}</td>
                                                                <td className="p-6 text-slate-600 max-w-xs truncate" title={u.status === 'RED' ? 'มีความเสี่ยงสูง' : 'ปกติ'}>
                                                                    {u.status === 'RED' ? 'คลั่งรักเด็กดื้อ (Risk)' : u.status === 'YELLOW' ? 'ซึมเศร้าเล็กน้อย' : 'ปกติ'}
                                                                </td>
                                                                <td className="p-6">
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${u.status === 'RED' ? 'bg-red-100 text-red-600 border-red-200' :
                                                                            u.status === 'YELLOW' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                                                                                u.status === 'GREEN' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' :
                                                                                    'bg-slate-100 text-slate-600 border-slate-200'
                                                                        }`}>
                                                                        {u.status || 'Unknown'}
                                                                    </span>
                                                                </td>
                                                                <td className="p-6 text-center">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedUserForAppointment(u);
                                                                            setShowAppointmentModal(true);
                                                                        }}
                                                                        className="w-10 h-10 rounded-lg border border-indigo-200 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center mx-auto shadow-sm"
                                                                        title="เพิ่มการนัดหมาย"
                                                                    >
                                                                        📝
                                                                    </button>
                                                                </td>
                                                                <td className="p-6 text-center">
                                                                    <button
                                                                        onClick={() => handleDeleteUser(u.id)}
                                                                        className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                                                                        title="ลบข้อมูล"
                                                                    >
                                                                        🗑
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="8" className="p-10 text-center text-slate-400">
                                                            ไม่พบข้อมูลนักศึกษาที่ค้นหา
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Simple Pagination Mock */}
                                    <div className="p-6 border-t border-indigo-50 flex justify-end gap-2 bg-white/40">
                                        <button className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-400 text-sm disabled:opacity-50" disabled>Previous</button>
                                        <button className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-bold shadow-md shadow-indigo-500/30">1</button>
                                        <button className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">2</button>
                                        <button className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">Next</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Appointment Modal */}
                        {showAppointmentModal && selectedUserForAppointment && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                                <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
                                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                        <h3 className="text-xl font-bold text-slate-800">เพิ่มการนัดหมาย</h3>
                                        <button onClick={() => setShowAppointmentModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl">✕</button>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ชื่อ</label>
                                                <input type="text" value={selectedUserForAppointment.name.split(' ')[0] || ''} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-600" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">นามสกุล</label>
                                                <input type="text" value={selectedUserForAppointment.name.split(' ').slice(1).join(' ') || 'นักศึกษา'} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-600" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">เรื่องที่นัดหมาย</label>
                                            <input type="text" placeholder="เช่น นัดติดตามผลอาการ..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">วันที่และเวลา</label>
                                            <input type="datetime-local" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                                        </div>

                                        <button
                                            onClick={() => {
                                                alert(`บันทึกการนัดหมายสำเร็จสำหรับ: ${selectedUserForAppointment.name}`);
                                                setShowAppointmentModal(false);
                                            }}
                                            className="w-full btn-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/20 text-lg mt-4"
                                        >
                                            บันทึกการนัดหมาย
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
