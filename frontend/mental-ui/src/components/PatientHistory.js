import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const PatientHistory = ({ userId, onBack }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${API_BASE}/history/${userId}`);
                setHistory(res.data);
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [userId]);

    const getStatusColor = (level) => {
        switch (level) {
            case 'GREEN': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
            case 'YELLOW': return 'bg-amber-50 border-amber-200 text-amber-800';
            case 'RED': return 'bg-rose-50 border-rose-200 text-rose-800';
            default: return 'bg-slate-50 border-slate-200 text-slate-800';
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white/95 backdrop-blur-xl w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/20">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
                            <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/30">
                                👤
                            </span>
                            Patient History: <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{userId}</span>
                        </h2>
                        <p className="text-slate-500 ml-16 text-sm font-medium">Detailed analysis log and risk progression</p>
                    </div>
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all hover:rotate-90"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
                            <p className="font-bold">Loading history...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">📭</div>
                            <p className="text-xl font-bold text-slate-600">No history found for this patient.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-100 before:via-indigo-200 before:to-indigo-100">
                            {history.map((item, index) => (
                                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>

                                    {/* Icon */}
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-lg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${item.result_level === 'RED' ? 'bg-red-500' :
                                        item.result_level === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-500'
                                        }`}>
                                        <span className="text-white text-xs font-bold">{item.score}</span>
                                    </div>

                                    {/* Card */}
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group-hover:border-indigo-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <time className="font-mono text-xs text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded">
                                                {new Date(item.timestamp).toLocaleString()}
                                            </time>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(item.result_level)}`}>
                                                {item.result_level}
                                            </span>
                                        </div>

                                        <div className="mb-4 p-4 bg-slate-50 rounded-xl text-slate-700 italic text-sm border-l-4 border-slate-300 shadow-inner">
                                            "{item.content}"
                                        </div>

                                        <div className="space-y-3">
                                            <div className="text-sm">
                                                <span className="font-bold text-slate-700 block mb-1">Analysis Result</span>
                                                <span className="text-slate-600 leading-relaxed">{item.reason}</span>
                                            </div>
                                            {item.recommendation && (
                                                <div className="text-sm bg-indigo-50 text-indigo-800 p-3 rounded-xl flex gap-3 items-start border border-indigo-100">
                                                    <span className="text-lg">💡</span>
                                                    <span className="font-medium">{item.recommendation}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientHistory;
