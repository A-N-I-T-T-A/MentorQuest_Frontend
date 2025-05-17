import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { getAllUsers } from '../../services/userService';
import Sidebar from "./Sidebar";
import SkillsManagement from "./SkillsManagement";
import "./Dashboard.css";

const AdminDashboard = () => {
    const [users, setUsers] = useState({ mentors: [], mentees: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const data = await getAllUsers();
                console.log('Users data:', data);
                setUsers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className="dashboard">
            <Sidebar userType="admin" />
            <div className="dashboard-content">
                <Routes>
                    <Route path="/" element={
                        <>
                            <h2>Admin Dashboard</h2>
                            {loading ? (
                                <p>Loading...</p>
                            ) : error ? (
                                <p>Error: {error}</p>
                            ) : (
                                <div className="card-container">
                                    <div className="card">
                                        <h3>Total Users</h3>
                                        <p>{users.mentors.length + users.mentees.length}</p>
                                    </div>
                                    <div className="card">
                                        <h3>Active Mentors</h3>
                                        <p>{users.mentors.length}</p>
                                    </div>
                                    <div className="card">
                                        <h3>Active Mentees</h3>
                                        <p>{users.mentees.length}</p>
                                    </div>
                                </div>
                            )}
                        </>
                    } />
                    <Route path="/skills" element={<SkillsManagement />} />
                </Routes>
            </div>
        </div>
    );
};

export default AdminDashboard;