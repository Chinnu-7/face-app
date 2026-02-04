import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, UserCheck, LayoutDashboard, ChevronRight } from 'lucide-react';

const Dashboard = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/attendance/history');
                setHistory(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <LayoutDashboard className="text-blue-400" /> Attendance Dashboard
                    </h1>
                    <p className="text-slate-400 mt-1">Monitor your presence and performance</p>
                </div>
                <Link to="/mark-attendance" className="btn-primary px-6 py-3 rounded-2xl text-white font-bold flex items-center gap-2">
                    <UserCheck size={20} /> Mark Today's Attendance
                </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                    { label: 'Total Presence', value: history.filter(h => h.status === 'Present').length, color: 'text-green-400' },
                    { label: 'Late Entries', value: history.filter(h => h.status === 'Late').length, color: 'text-red-400' },
                    { label: 'Completion', value: '92%', color: 'text-blue-400' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 border-l-4 border-slate-700 hover:border-blue-500 transition-colors"
                    >
                        <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                        <h3 className={`text-4xl font-bold mt-2 ${stat.color}`}>{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card overflow-hidden"
            >
                <div className="p-6 border-b border-slate-700 bg-slate-800/50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar size={20} className="text-purple-400" /> Recent History
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-slate-400 text-sm text-left border-b border-slate-800">
                                <th className="p-4 font-semibold uppercase tracking-wider">Date</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Time</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Location</th>
                                <th className="p-4 font-semibold uppercase tracking-wider text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {history.length > 0 ? history.map((record, i) => (
                                <motion.tr
                                    key={record.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="hover:bg-slate-800/30 transition-colors group"
                                >
                                    <td className="p-4 font-medium flex items-center gap-3">
                                        <div className="size-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs text-blue-400 font-bold border border-slate-700">
                                            {record.date.split('-')[2]}
                                        </div>
                                        {record.date}
                                    </td>
                                    <td className="p-4 text-slate-300">
                                        <span className="flex items-center gap-2"><Clock size={14} className="text-slate-500" /> {record.time}</span>
                                    </td>
                                    <td className="p-4 text-slate-300">
                                        <span className="flex items-center gap-2"><MapPin size={14} className="text-slate-500" /> Office Area</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold leading-none ${record.status === 'Late'
                                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                            : 'bg-green-500/10 text-green-500 border border-green-500/20'
                                            }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </motion.tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-slate-500">
                                        No attendance records found yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
