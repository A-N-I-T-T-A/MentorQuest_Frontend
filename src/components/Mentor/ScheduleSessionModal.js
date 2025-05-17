import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ScheduleSessionModal.css';

const ScheduleSessionModal = ({ isOpen, onClose, session, onSuccess }) => {
    const [meetingLink, setMeetingLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!meetingLink) {
            setError('Please enter a meeting link');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Send email to mentee
            const emailResponse = await fetch(`${process.env.REACT_APP_API_URL}/mentorapp/send-session-email/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    session_id: session.id,
                    meeting_link: meetingLink
                })
            });

            const emailData = await emailResponse.json();
            
            if (!emailResponse.ok) {
                throw new Error(emailData.message || 'Failed to send email');
            }

            // Update session status
            const updateResponse = await fetch(`${process.env.REACT_APP_API_URL}/mentorapp/sessions/${session.id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: 'Scheduled'
                })
            });

            const updateData = await updateResponse.json();
            
            if (!updateResponse.ok) {
                throw new Error(updateData.message || 'Failed to update session status');
            }

            toast.success('Session scheduled successfully and email sent to mentee!');
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error scheduling session:', err);
            setError(err.message || 'Failed to schedule session. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`modal ${isOpen ? 'open' : ''}`}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Schedule Session</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        {error && <div className="error-message">{error}</div>}
                        <div className="field-group">
                            <label htmlFor="meetingLink">Meeting Link:</label>
                            <input
                                type="text"
                                id="meetingLink"
                                value={meetingLink}
                                onChange={(e) => setMeetingLink(e.target.value)}
                                placeholder="Enter your meeting link (e.g., Zoom, Google Meet)"
                                required
                            />
                        </div>
                        <div className="field-group">
                            <label>Session Details:</label>
                            <div className="session-details">
                                <p><strong>Date:</strong> {new Date(session.session_date).toLocaleDateString()}</p>
                                <p><strong>Time:</strong> {new Date(`1970-01-01T${session.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(`1970-01-01T${session.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                <p><strong>Mentee:</strong> {session.relationship?.mentee?.user?.first_name} {session.relationship?.mentee?.user?.last_name}</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? 'Scheduling...' : 'Schedule Session'}
                            </button>
                            <button type="button" className="cancel-btn" onClick={onClose}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ScheduleSessionModal;
