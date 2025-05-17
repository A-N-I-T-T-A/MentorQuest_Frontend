import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Dashboard.css";
import notificationService from '../../services/notificationService';
import mentorNotificationService from '../../services/mentorNotificationService';
import { menteeNotificationService } from '../../services/menteeNotificationService';

const Sidebar = ({ userType }) => {
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);
    const [pendingSessionsCount, setPendingSessionsCount] = useState(0);
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

    const fetchUnreadNotifications = useCallback(async () => {
        try {
            if (userType === 'admin') {
                const count = await notificationService.getUnreadCount();
                setUnreadCount(count);
            } else if (userType === 'mentor') {
                const count = await mentorNotificationService.getUnreadMentorCount();
                setUnreadCount(count);
            } else if (userType === 'mentee') {
                const count = await menteeNotificationService.getUnreadCount();
                setUnreadCount(count);
            }
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
        }
    }, [userType]);

    const fetchPendingCounts = useCallback(async () => {
        if (userType === 'mentor') {
            try {
                // Fetch pending sessions count
                const sessionsResponse = await fetch(`${process.env.REACT_APP_API_URL}/mentorapp/sessions/mentor/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (sessionsResponse.ok) {
                    const sessionsData = await sessionsResponse.json();
                    const pendingSessions = sessionsData.filter(session => session.status === 'Pending');
                    setPendingSessionsCount(pendingSessions.length);
                }

                // Fetch pending requests count
                const requestsResponse = await fetch(`${process.env.REACT_APP_API_URL}/mentorapp/mentorship-requests/pending_requests/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (requestsResponse.ok) {
                    const requestsData = await requestsResponse.json();
                    setPendingRequestsCount(requestsData.length);
                }
            } catch (error) {
                console.error('Error fetching pending counts:', error);
            }
        }
    }, [userType]);

    // Set up WebSocket connection for real-time updates
    useEffect(() => {
        if (userType === 'mentor') {
            const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}/ws/mentor/`);

            ws.onopen = () => {
                console.log('WebSocket Connected');
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'status_update') {
                    fetchPendingCounts(); // Refresh counts when status changes
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket Error:', error);
            };

            ws.onclose = () => {
                console.log('WebSocket Disconnected');
            };

            return () => {
                ws.close();
            };
        }
    }, [userType, fetchPendingCounts]);

    // Listen for custom events
    useEffect(() => {
        const handleStatusChange = () => {
            fetchPendingCounts();
        };

        // Listen for custom events
        window.addEventListener('sessionStatusChange', handleStatusChange);
        window.addEventListener('requestStatusChange', handleStatusChange);
        window.addEventListener('newSession', handleStatusChange);
        window.addEventListener('newRequest', handleStatusChange);

        return () => {
            window.removeEventListener('sessionStatusChange', handleStatusChange);
            window.removeEventListener('requestStatusChange', handleStatusChange);
            window.removeEventListener('newSession', handleStatusChange);
            window.removeEventListener('newRequest', handleStatusChange);
        };
    }, [fetchPendingCounts]);

    useEffect(() => {
        fetchUnreadNotifications();
        fetchPendingCounts();

        // Add event listener for notification updates
        const handleNotificationUpdate = () => {
            fetchUnreadNotifications();
            fetchPendingCounts();
        };

        // Listen for notification updates
        window.addEventListener('notificationUpdate', handleNotificationUpdate);

        // Set up polling for real-time updates (as fallback)
        const pollInterval = setInterval(() => {
            fetchUnreadNotifications();
            fetchPendingCounts();
        }, 10000); // Poll every 10 seconds as fallback

        // Cleanup event listener and interval
        return () => {
            window.removeEventListener('notificationUpdate', handleNotificationUpdate);
            clearInterval(pollInterval);
        };
    }, [userType, fetchUnreadNotifications, fetchPendingCounts]);

    // Function to trigger notification update
    const triggerNotificationUpdate = useCallback(() => {
        fetchUnreadNotifications();
        fetchPendingCounts();
    }, [fetchUnreadNotifications, fetchPendingCounts]);

    const menuItems = {
        admin: [
            { 
                name: "Dashboard", 
                path: "/dashboard/admin",
                icon: "fas fa-tachometer-alt"
            },
            
            { 
                name: "Manage Skills", 
                path: "/dashboard/admin/skills",
                icon: "fas fa-tags"
            },
            { 
                name: "User Management", 
                path: "/dashboard/admin/users",
                icon: "fas fa-users"
            },
            { 
                name: "Notifications", 
                path: "/dashboard/admin/notifications",
                icon: "fas fa-bell",
                badge: unreadCount > 0 ? unreadCount : undefined,
                onClick: triggerNotificationUpdate
            },
            { 
                name: "Reports", 
                path: "/dashboard/admin/reports",
                icon: "fas fa-chart-bar"
            }
        ],
        mentor: [
            { 
                name: "Dashboard", 
                path: "/dashboard/mentor",
                icon: "fas fa-tachometer-alt"
            },
            { 
                name: "Mentorship Requests", 
                path: "/dashboard/mentor/requests",
                icon: "fas fa-handshake",
                badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined
            },
            { 
                name: "My Mentees", 
                path: "/dashboard/mentor/mentees",
                icon: "fas fa-users"
            },
            { 
                name: "Schedule Sessions", 
                path: "/dashboard/mentor/schedule",
                icon: "fas fa-calendar",
                badge: pendingSessionsCount > 0 ? pendingSessionsCount : undefined
            },
            { 
                name: "Feedbacks", 
                path: "/dashboard/mentor/feedbacks",
                icon: "fas fa-star"
            },
            { 
                name: "Notifications", 
                path: "/dashboard/mentor/notifications",
                icon: "fas fa-bell",
                badge: unreadCount > 0 ? unreadCount : undefined,
                onClick: triggerNotificationUpdate
            }
            
        ],
        mentee: [
            { 
                name: "Dashboard", 
                path: "/dashboard/mentee",
                icon: "fas fa-tachometer-alt"
            },
            { 
                name: "Find Mentors", 
                path: "/dashboard/mentee/find-mentors",
                icon: "fas fa-search"
            },
            { 
                name: "My Requests", 
                path: "/dashboard/mentee/requests",
                icon: "fas fa-handshake"
            },
            { 
                name: "My Mentors", 
                path: "/dashboard/mentee/mentors",
                icon: "fas fa-chalkboard-teacher"
            },
            { 
                name: "My Sessions", 
                path: "/dashboard/mentee/sessions",
                icon: "fas fa-calendar-check"
            },
            { 
                name: "Notifications", 
                path: "/dashboard/mentee/notifications",
                icon: "fas fa-bell",
                badge: unreadCount > 0 ? unreadCount : undefined,
                onClick: triggerNotificationUpdate
            }
        ]
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h3>{userType.charAt(0).toUpperCase() + userType.slice(1)} Panel</h3>
            </div>
            <nav className="sidebar-menu">
                {menuItems[userType].map((item, index) => (
                    <Link
                        key={index}
                        to={item.path}
                        className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={item.onClick}
                    >
                        <i className={item.icon}></i>
                        <span>{item.name}</span>
                        {item.badge && (
                            <span className="notification-badge">{item.badge}</span>
                        )}
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
