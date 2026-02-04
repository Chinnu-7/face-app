import { useState } from "react";
import api from "../api/api";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const res = await api.post("/login", { email, password });
            localStorage.setItem("token", res.data.token);
            window.location.href = "/dashboard";
        } catch (error) {
            alert("Login failed");
        }
    };

    return (
        <div className="h-screen flex items-center justify-center">
            <div className="p-6 shadow-lg rounded w-80">
                <h2 className="text-xl mb-4">Login</h2>
                <input placeholder="Email" onChange={e => setEmail(e.target.value)} className="input border p-2 w-full mb-2" />
                <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} className="input border p-2 w-full mt-2" />
                <button onClick={handleLogin} className="btn mt-4 bg-blue-500 text-white p-2 w-full rounded">Login</button>
            </div>
        </div>
    );
}
