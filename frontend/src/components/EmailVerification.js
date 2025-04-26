import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../api";
import '../styles/Form.css';

const VerifyEmail = () => {
    const { token } = useParams();
    const [message, setMessage] = useState("Verifying...");
    const navigate = useNavigate();

    useEffect(() => {
        const handleVerification = async () => {
            const response = await verifyEmail(token);

            if (response.success) {
                setMessage("Email verified successfully! Redirecting to login...");
                setTimeout(() => navigate("/login"), 3000);
            } else {
                setMessage(response.message || "Verification failed. Invalid or expired token.");
            }
        };

        handleVerification();
    }, [token, navigate]);

    return (
        <div className="container">
            <h2>Email Verification</h2>
            <p>{message}</p>
        </div>
    );
};

export default VerifyEmail;
