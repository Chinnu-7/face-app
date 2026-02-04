import React, { useRef, useState } from 'react';
import api from '../api/api';
import Webcam from 'react-webcam';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ArrowLeft, Scan, CheckCircle, AlertCircle } from 'lucide-react';

const Attendance = () => {
    const webcamRef = useRef(null);
    const [status, setStatus] = useState('idle'); // idle, liveness, checking, success, error
    const [errorMsg, setErrorMsg] = useState('');
    const [hasBlinked, setHasBlinked] = useState(false);
    const navigate = useNavigate();

    const OFFICE_LOCATION = { lat: 17.3850, lng: 78.4867 }; // Hypothetical office center

    // Haversine formula to calculate distance between two lat/lng points
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const d = R * c; // in metres
        return d;
    };

    const handleMark = async () => {
        if (status === 'idle') {
            setStatus('liveness');
            return;
        }

        // If we are in liveness state and the user clicks "I Blinked"
        if (status === 'liveness') {
            setHasBlinked(true); // Acknowledge blink, proceed to capture
            setStatus('checking'); // Move to checking state
        }

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) {
            setStatus('error');
            setErrorMsg('Failed to capture image. Please try again.');
            setTimeout(() => setStatus('idle'), 4000);
            return;
        }

        // 1. Get Real Geolocation
        let userLocation = { lat: 0, lng: 0 };
        try {
            const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
            });
            userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };

            // Check distance to office
            const distance = calculateDistance(userLocation.lat, userLocation.lng, OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);
            const MAX_DISTANCE_METERS = 100; // e.g., 100 meters
            if (distance > MAX_DISTANCE_METERS) {
                setStatus('error');
                setErrorMsg(`You are too far from the office (${Math.round(distance)}m). Please try again from a closer location.`);
                setTimeout(() => setStatus('idle'), 4000);
                return;
            }

        } catch (err) {
            setStatus('error');
            setErrorMsg('Geolocation access denied or failed. Cannot verify attendance.');
            setTimeout(() => setStatus('idle'), 4000);
            return;
        }

        const blob = await (await fetch(imageSrc)).blob();
        const formData = new FormData();
        formData.append('image', blob, 'attendance.jpg');
        formData.append('location', JSON.stringify(userLocation));

        try {
            const res = await api.post('/attendance/mark', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus('success');
            setTimeout(() => navigate('/dashboard'), 2500);
        } catch (err) {
            setStatus('error');
            setErrorMsg(err.response?.data?.msg || 'Recognition failed. Please try again.');
            setTimeout(() => setStatus('idle'), 4000);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <Link to="/dashboard" className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-4 w-full max-w-xl text-center"
            >
                <div className="p-4 mb-4">
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                        <Scan className="text-blue-400" /> Face Recognition
                    </h2>
                    <p className="text-slate-400">Position your face within the frame</p>
                </div>

                <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700 bg-black group mb-6">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full grayscale group-hover:grayscale-0 transition-all duration-700"
                    />

                    <AnimatePresence>
                        {status === 'liveness' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-purple-500/20 backdrop-blur-sm flex flex-col items-center justify-center p-6"
                            >
                                <div className="size-20 border-4 border-purple-400 rounded-full animate-pulse flex items-center justify-center">
                                    <Scan size={32} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mt-4">Liveness Check</h3>
                                <p className="text-purple-100 mt-2">Please BLINK now to verify you are a real person</p>
                                <button
                                    onClick={handleMark}
                                    className="mt-6 bg-white text-purple-600 px-6 py-2 rounded-full font-bold"
                                >
                                    I Blinked
                                </button>
                            </motion.div>
                        )}

                        {status === 'checking' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-blue-500/20 backdrop-blur-[2px] flex flex-col items-center justify-center"
                            >
                                <div className="scanner-line"></div>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="size-16 border-4 border-t-blue-400 border-transparent rounded-full"
                                />
                                <p className="mt-4 font-bold text-blue-100 tracking-widest uppercase">Analyzing...</p>
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-green-500/40 backdrop-blur-md flex flex-col items-center justify-center"
                            >
                                <CheckCircle size={64} className="text-white animate-bounce" />
                                <h3 className="text-2xl font-bold text-white mt-4">Recognition Success!</h3>
                                <p className="text-green-100 mt-2">Attendance marked. Redirecting...</p>
                            </motion.div>
                        )}

                        {status === 'error' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-red-500/40 backdrop-blur-md flex flex-col items-center justify-center px-6"
                            >
                                <AlertCircle size={64} className="text-white" />
                                <h3 className="text-2xl font-bold text-white mt-4">Identity Unverified</h3>
                                <p className="text-red-100 mt-2">{errorMsg}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Corner accents */}
                    <div className="absolute top-4 left-4 size-8 border-t-4 border-l-4 border-slate-500 rounded-tl-lg"></div>
                    <div className="absolute top-4 right-4 size-8 border-t-4 border-r-4 border-slate-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-4 left-4 size-8 border-b-4 border-l-4 border-slate-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-4 right-4 size-8 border-b-4 border-r-4 border-slate-500 rounded-br-lg"></div>
                </div>

                <div className="px-4 pb-4">
                    <button
                        onClick={handleMark}
                        disabled={status !== 'idle'}
                        className={`w-full p-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${status === 'idle'
                            ? 'btn-primary'
                            : 'bg-slate-700 cursor-not-allowed'
                            }`}
                    >
                        <Camera size={24} /> Verify Identity
                    </button>
                    <p className="mt-4 text-xs text-slate-500 uppercase tracking-widest font-bold">Secure Face Verification v1.0</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Attendance;
