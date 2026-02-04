import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import MarkAttendance from "./attendance/MarkAttendance";
import EmployeeDashboard from "./dashboard/EmployeeDashboard";
// import ProtectedRoute from "./auth/ProtectedRoute"; // Use if needed

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/attendance" element={<MarkAttendance />} />
                <Route path="/dashboard" element={<EmployeeDashboard />} />
            </Routes>
        </BrowserRouter>
    );
}
