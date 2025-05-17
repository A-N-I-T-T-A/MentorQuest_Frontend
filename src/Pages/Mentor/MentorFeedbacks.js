import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Dashboard/Sidebar';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getAuthToken } from '../../services/authUtils';
import './MentorFeedbacks.css';
import { MEDIA_BASE_URL } from '../../config';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8001';

const MentorFeedbacks = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/mentorapp/mentor/feedbacks/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFeedbacks(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching feedbacks:', err);
            setError('Failed to load feedbacks. Please try again later.');
            toast.error('Failed to load feedbacks');
        } finally {
            setLoading(false);
        }
    };

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Helper to get the proper profile image URL
    const getProfileImageUrl = (profileImage) => {
        if (!profileImage) return "/placeholder.svg";
        if (profileImage.startsWith('http')) return profileImage;
        return `${MEDIA_BASE_URL}${profileImage}`;
    };

    // Helper to render star rating
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i 
                    key={i} 
                    className={`fas fa-star ${i <= rating ? 'filled' : 'empty'}`}
                ></i>
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <Sidebar userType="mentor" />
                <div className="dashboard-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading feedbacks...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Sidebar userType="mentor" />
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h1>My Feedbacks</h1>
                    <p>View feedback received from your mentees</p>
                </div>

                {error && (
                    <div className="error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        <p>{error}</p>
                    </div>
                )}

                <div className="feedbacks-container">
                    {feedbacks.length === 0 ? (
                        <div className="no-feedbacks">
                            <i className="fas fa-comment-alt"></i>
                            <p>You haven't received any feedback yet</p>
                        </div>
                    ) : (
                        <div className="feedbacks-grid">
                            {feedbacks.map((feedback) => (
                                <div key={feedback.id} className="feedback-card">
                                    <div className="feedback-header">
                                        <div className="mentee-info">
                                            <div className="mentee-avatar-container">
                                                <img 
                                                    src={getProfileImageUrl(feedback.mentee_image)}
                                                    alt={feedback.mentee_name || 'Mentee'}
                                                    className="mentee-avatar"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "/placeholder.svg";
                                                    }}
                                                />
                                            </div>
                                            <div className="mentee-details">
                                                <h3>{feedback.mentee_name || 'Anonymous Mentee'}</h3>
                                                <p className="session-date">
                                                    <i className="far fa-calendar"></i> {formatDate(feedback.session_date)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="rating">
                                            {renderStars(feedback.rating)}
                                            <span className="rating-value">{feedback.rating}/5</span>
                                        </div>
                                    </div>

                                    <div className="feedback-content">
                                        <p>{feedback.comment || 'No comment provided'}</p>
                                    </div>

                                    <div className="feedback-footer">
                                        <div className="session-details">
                                            {feedback.session_topic && (
                                                <span className="session-topic">
                                                    <i className="fas fa-tag"></i> {feedback.session_topic}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MentorFeedbacks; 