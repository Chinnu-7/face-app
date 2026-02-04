import { useRef } from "react";

export default function CameraCapture({ onCapture }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const startCamera = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
    };

    const capture = () => {
        const canvas = canvasRef.current;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
        onCapture(canvas.toDataURL("image/png"));
    };

    return (
        <div>
            <video ref={videoRef} autoPlay className="rounded" />
            <canvas ref={canvasRef} hidden />
            <button onClick={startCamera}>Start Camera</button>
            <button onClick={capture}>Capture</button>
        </div>
    );
}
