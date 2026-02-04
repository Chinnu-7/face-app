import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
    withCredentials: true
});

api.interceptors.request.use((req) => {
    // Token is now handled via secure HttpOnly cookies, 
    // so we don't need to manually add it to headers.
    return req;
});

export default api;
