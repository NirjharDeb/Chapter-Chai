import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ Component }) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const response = await fetch("/auth/check", {
                credentials: "include",
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (response.ok) {
                setIsAuthenticated(true);
            } else {
                navigate("/");  // Redirect to login if not authenticated
            }
            setLoading(false);
        };
        checkAuth();
    }, [navigate]);

    if (loading) return <div>Loading...</div>;

    return isAuthenticated ? <Component /> : null;
};

export default ProtectedRoute;