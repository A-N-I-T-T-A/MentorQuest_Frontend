import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getMentorshipRequests, deleteMentorshipRequest } from '../../services/mentorshipService';
import { hasPendingSessionWithMentor } from '../../services/sessionService';
import BookingModal from '../Booking/BookingModal';
import './Dashboard.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MenteeRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [pendingSessionMentors, setPendingSessionMentors] = useState({});

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await getMentorshipRequests('mentee');
            // Transform the data to ensure proper structure and consistent status case
            const transformedRequests = response.map(request => ({
                ...request,
                status: request.status?.charAt(0).toUpperCase() + request.status?.slice(1).toLowerCase(),
                mentor: {
                    ...request.mentor,
                    user: request.mentor?.user || {},
                    profile_image: request.mentor?.profile_image || request.mentor?.user?.profile_image || null
                }
            }));
            console.log('Transformed requests:', transformedRequests); // Debug log
            setRequests(transformedRequests);
            
            // Check pending sessions for each mentor
            const mentorPendingSessions = {};
            await Promise.all(transformedRequests.map(async (request) => {
                if (request.mentor && request.mentor.id) {
                    const hasPending = await hasPendingSessionWithMentor(request.mentor.id);
                    mentorPendingSessions[request.mentor.id] = hasPending;
                }
            }));
            setPendingSessionMentors(mentorPendingSessions);
        } catch (err) {
            setError('Failed to fetch requests');
            console.error('Error fetching requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async (requestId) => {
        if (!window.confirm('Are you sure you want to cancel this request?')) {
            return;
        }

        try {
            await deleteMentorshipRequest(requestId);
            toast.success('Request cancelled successfully');
            fetchRequests();
        } catch (err) {
            console.error('Error cancelling request:', err);
            toast.error('Failed to cancel request. Please try again.');
        }
    };

    const handleDeleteRejectedRequest = async (requestId) => {
        if (!window.confirm('Are you sure you want to delete this rejected request?')) {
            return;
        }

        try {
            await deleteMentorshipRequest(requestId);
            toast.success('Request deleted successfully');
            fetchRequests();
        } catch (err) {
            console.error('Error deleting rejected request:', err);
            toast.error('Failed to delete request. Please try again.');
        }
    };

    const viewMentorProfile = (mentorId) => {
        navigate(`/mentor-profile/${mentorId}`);
    };

    const handleScheduleSession = (mentor) => {
        // Transform the mentor data to match the expected structure
        const transformedMentor = {
            id: mentor.id,
            user: {
                first_name: mentor.user?.first_name,
                last_name: mentor.user?.last_name,
                email: mentor.user?.email
            },
            profile_image: mentor.profile_image,
            designation: mentor.designation,
            hourly_rate: mentor.hourly_rate
        };
        setSelectedMentor(transformedMentor);
        setIsBookingModalOpen(true);
    };

    const handleBookingSuccess = () => {
        fetchRequests(); // Refresh the requests list after successful booking
        toast.success('Session booked successfully!');
    };

    const getProfileImageUrl = (profileImage) => {
        if (!profileImage) return "/placeholder.svg";
        if (profileImage.startsWith('http')) return profileImage;
        return `${process.env.REACT_APP_API_URL}${profileImage}`;
    };

    if (loading) return <div className="loading">Loading requests...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="dashboard-container">
            <Sidebar userType="mentee" />
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h1>My Mentorship Requests</h1>
                    <p>Track the status of your mentorship requests</p>
                </div>

                <div className="requests-container">
                    {requests.length === 0 ? (
                        <div className="no-requests">
                            <i className="fas fa-paper-plane"></i>
                            <p>You haven't sent any requests yet</p>
                            <button 
                                className="find-mentors-btn"
                                onClick={() => navigate('/dashboard/mentee/find-mentors')}
                            >
                                Find Mentors
                            </button>
                        </div>
                    ) : (
                        <div className="requests-grid">
                            {requests.map((request) => (
                                <div key={request.id} className="request-card">
                                    <div className="request-header">
                                        <div className="mentor-info">
                                            <div className="mentor-avatar-container">
                                                <img 
                                                    src={getProfileImageUrl(request.mentor?.profile_image)}
                                                    alt={`${request.mentor?.user?.first_name || 'Mentor'} ${request.mentor?.user?.last_name || ''}`}
                                                    className="mentor-avatar"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "/placeholder.svg";
                                                    }}
                                                />
                                            </div>
                                            <div className="mentor-details">
                                                <h3>
                                                    {`${request.mentor?.user?.first_name || 'Anonymous'} ${request.mentor?.user?.last_name || 'Mentor'}`}
                                                </h3>
                                                <p>{request.mentor?.user?.email || 'Email not available'}</p>
                                                {request.mentor?.designation && (
                                                    <p className="mentor-designation">{request.mentor.designation}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`status-badge ${request.status}`}>
                                            {request.status?.charAt(0).toUpperCase() + (request.status?.slice(1) || '')}
                                        </span>
                                    </div>

                                    <div className="request-message">
                                        <p>{request.message || 'No message provided'}</p>
                                    </div>

                                    <div className="request-actions">
                                        <button 
                                            className="view-profile-btn"
                                            onClick={() => viewMentorProfile(request.mentor?.id)}
                                        >
                                            <i className="fas fa-user"></i> View Profile
                                        </button>
                                        {request.status === 'Pending' && (
                                            <button 
                                                className="cancel-btn"
                                                onClick={() => handleCancelRequest(request.id)}
                                            >
                                                Cancel Request
                                            </button>
                                        )}
                                        {request.status === 'Rejected' && (
                                            <button 
                                                className="delete-btn"
                                                onClick={() => handleDeleteRejectedRequest(request.id)}
                                            >
                                                Delete
                                            </button>
                                        )}
                                        {request.status === 'Accepted' && (
                                            <button 
                                                className="schedule-session-btn"
                                                onClick={() => handleScheduleSession(request.mentor)}
                                                disabled={pendingSessionMentors[request.mentor?.id]}
                                                title={pendingSessionMentors[request.mentor?.id] ? "You already have a pending or scheduled session with this mentor" : ""}
                                            >
                                                <i className="fas fa-calendar-plus"></i> Schedule Session
                                                {pendingSessionMentors[request.mentor?.id] && <span className="pending-indicator"> (Session Pending)</span>}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                mentor={selectedMentor}
                onBookingSuccess={handleBookingSuccess}
            />
        </div>
    );
};

export default MenteeRequests;