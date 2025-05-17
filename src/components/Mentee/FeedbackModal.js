import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './FeedbackModal.css';

const FeedbackModal = ({ isOpen, onClose, session, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) {
            setError('Please enter a comment');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/mentorapp/feedback/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    session_id: session.id,
                    rating: rating,
                    comment: comment
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit feedback');
            }

            toast.success('Feedback submitted successfully');
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error submitting feedback:', err);
            setError(err.message || 'Failed to submit feedback');
        } finally {
            setLoading(false);
        }
    };

    const handleRatingChange = (value) => {
        setRating(value);
    };

    return (
        <div className={`modal ${isOpen ? 'open' : ''}`}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Give Feedback</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        {error && <div className="error-message">{error}</div>}
                        <div className="rating-section">
                            <h3>Rate your session</h3>
                            <div className="rating-stars">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <label key={star}>
                                        <input
                                            type="radio"
                                            name="rating"
                                            value={star}
                                            checked={rating === star}
                                            onChange={() => handleRatingChange(star)}
                                        />
                                        <i className={`fas fa-star ${rating >= star ? 'active' : ''}`}>
                                        </i>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="field-group">
                            <label htmlFor="comment">Share your thoughts about the session:</label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Please share your thoughts about the session..."
                                required
                            />
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="cancel-btn" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;