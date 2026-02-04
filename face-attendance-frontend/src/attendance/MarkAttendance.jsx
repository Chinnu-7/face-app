import CameraCapture from "../components/CameraCapture";
import { getLocation } from "../components/LocationCheck";
import api from "../api/api";

export default function MarkAttendance() {

    const submitAttendance = async (image) => {
        try {
            const location = await getLocation();

            await api.post("/attendance/mark", {
                selfie: image,
                latitude: location.latitude,
                longitude: location.longitude
            });

            alert("Attendance marked successfully");
        } catch (error) {
            alert("Failed to mark attendance: " + error);
        }
    };

    return (
        <div className="p-6">
            <h2>Mark Attendance</h2>
            <CameraCapture onCapture={submitAttendance} />
        </div>
    );
}
