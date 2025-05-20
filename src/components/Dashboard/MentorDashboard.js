import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import "./Dashboard.css";
import axios from "axios";
import { getAuthToken } from "../../services/authUtils";

const API_URL = process.env.REACT_APP_API_URL || 'https://mentorquest-backend.onrender.com';

const MentorDashboard = () => {
    const [data, setData] = useState({
        sessions: 0,
        earnings: "₹0",
        reviews: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${API_URL}/mentorapp/dashboard/mentor/`,
                    {
                        headers: {
                            'Authorization': `Bearer ${getAuthToken()}`
                        }
                    }
                );
                setData(response.data);
            } catch (error) {
                console.error("Error fetching mentor dashboard data:", error);
                setError(error.response?.data?.message || "Failed to fetch dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="dashboard">
        <Sidebar userType="mentor" />
        <div className="dashboard-content">
            <h2>Loading...</h2>
        </div>
    </div>;

    if (error) return <div className="dashboard">
        <Sidebar userType="mentor" />
        <div className="dashboard-content">
            <h2>Error: {error}</h2>
        </div>
    </div>;

    return (
        <div className="dashboard">
            <Sidebar userType="mentor" />
            <div className="dashboard-content">
                <h2>Mentor Dashboard</h2>
                <div className="card-container">
                    <div className="card">
                        <h3>Total Sessions</h3>
                        <p>{data.sessions}</p>
                    </div>
                    <div className="card">
                        <h3>Total Earnings</h3>
                        <p>{data.earnings}</p>
                    </div>
                    <div className="card">
                        <h3>Reviews Received</h3>
                        <p>{data.reviews}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorDashboard;
