import React, { useState, useRef } from 'react';
import api from '../api/api';
import Webcam from 'react-webcam';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, Camera } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [department, setDepartment] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [departments, setDepartments] = useState([]);
    const [consent, setConsent] = useState(false);
    const [liveness, setLiveness] = useState(false); // Mock liveness state
    const [loading, setLoading] = useState(false);
    const webcamRef = useRef(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await api.get('/departments');
                setDepartments(res.data);
            } catch (err) {
                console.error('Failed to fetch departments', err);
            }
        };
        fetchDepartments();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!consent) return alert('Please consent to biometric data collection');

        const imageSrc = webcamRef.current.getScreenshot();

        if (!imageSrc) return alert('Capture face first');

        setLoading(true);
        const blob = await (await fetch(imageSrc)).blob();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('role', role);
        formData.append('department', department);
        formData.append('employeeId', employeeId);
        formData.append('phoneNumber', phoneNumber);
        formData.append('image', blob, 'face.jpg');

        try {
            await api.post('/auth/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Registration Successful');
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.msg || 'Registration Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 w-full max-w-2xl"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500">
                        Create Account
                    </h2>
                    <p className="text-slate-400 mt-2">Join the Face Attendance system today</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-slate-500 size-5" />
                            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="input-field w-full pl-11 p-3 rounded-xl" required />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-slate-500 size-5" />
                            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="input-field w-full pl-11 p-3 rounded-xl" required />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-slate-500 size-5" />
                            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="input-field w-full pl-11 p-3 rounded-xl" required />
                        </div>
                        <select value={role} onChange={e => setRole(e.target.value)} className="input-field w-full p-3 rounded-xl appearance-none">
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="employee">Employee</option>
                        </select>
                        <select value={department} onChange={e => setDepartment(e.target.value)} className="input-field w-full p-3 rounded-xl appearance-none">
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept._id} value={dept._id}>{dept.name}</option>
                            ))}
                        </select>
                        <div className="relative">
                            <input type="text" placeholder="Employee ID (Optional)" value={employeeId} onChange={e => setEmployeeId(e.target.value)} className="input-field w-full p-3 rounded-xl" />
                        </div>
                        <div className="relative">
                            <input type="text" placeholder="Phone Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="input-field w-full p-3 rounded-xl" />
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-400 p-2">
                            <input
                                type="checkbox"
                                checked={consent}
                                onChange={e => setConsent(e.target.checked)}
                                className="size-4 accent-purple-500"
                            />
                            <span>I consent to the collection of my biometric (face) data.</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full p-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? 'Registering...' : <><UserPlus size={20} /> Register Now</>}
                        </button>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-slate-700 bg-black shadow-inner">
                            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" />
                            <div className="scanner-line"></div>
                            <div className="absolute top-2 left-2 bg-red-500 text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                <div className="size-1.5 bg-white rounded-full"></div> LIVE
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
                            <Camera size={14} /> Ensure your face is centered and well-lit
                        </p>
                    </div>
                </form>

                <p className="text-center mt-8 text-slate-400">
                    Already have an account? <Link to="/login" className="text-purple-400 hover:underline">Login</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
