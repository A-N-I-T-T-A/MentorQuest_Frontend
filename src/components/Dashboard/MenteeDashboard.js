import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import "./Dashboard.css";
import axios from "axios";
import { getAuthToken } from "../../services/authUtils";

const API_URL = process.env.REACT_APP_API_URL || 'https://mentorquest-backend.onrender.com';

const MenteeDashboard = () => {
    const [data, setData] = useState({
        completed_sessions: 0,
        upcoming_sessions: 0,
        mentors_contacted: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${API_URL}/mentorapp/dashboard/mentee/`,
                    {
                        headers: {
                            'Authorization': `Bearer ${getAuthToken()}`
                        }
                    }
                );
                setData(response.data);
            } catch (error) {
                console.error("Error fetching mentee dashboard data:", error);
                setError(error.response?.data?.message || "Failed to fetch dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="dashboard">
        <Sidebar userType="mentee" />
        <div className="dashboard-content">
            <h2>Loading...</h2>
        </div>
    </div>;

    if (error) return <div className="dashboard">
        <Sidebar userType="mentee" />
        <div className="dashboard-content">
            <h2>Error: {error}</h2>
        </div>
    </div>;

    return (
        <div className="dashboard">
            <Sidebar userType="mentee" />
            <div className="dashboard-content">
                <h2>Mentee Dashboard</h2>
                <div className="card-container">
                    <div className="card">
                        <h3>Completed Sessions</h3>
                        <p>{data.completed_sessions}</p>
                    </div>
                    <div className="card">
                        <h3>Upcoming Sessions</h3>
                        <p>{data.upcoming_sessions}</p>
                    </div>
                    <div className="card">
                        <h3>Mentors Contacted</h3>
                        <p>{data.mentors_contacted}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenteeDashboard;
