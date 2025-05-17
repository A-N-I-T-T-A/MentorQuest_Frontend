import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './BookingModal.css';

const BookingModal = ({ isOpen, onClose, mentor, onBookingSuccess }) => {
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [timeOptions, setTimeOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mentorDetails, setMentorDetails] = useState({});

    const formatTime = (timeString) => {
        const time = new Date(`1970-01-01T${timeString}`);
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDay = (day) => {
        const dayMap = {
            'Monday': 'Mon',
            'Tuesday': 'Tue',
            'Wednesday': 'Wed',
            'Thursday': 'Thu',
            'Friday': 'Fri',
            'Saturday': 'Sat',
            'Sunday': 'Sun'
        };
        return dayMap[day] || day;
    };

    const fetchAvailableSlots = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Fetching slots for mentor:', mentor?.id);
            
            if (!mentor?.id) {
                throw new Error('Mentor ID is required');
            }
            
            const response = await fetch(`${process.env.REACT_APP_API_URL}/mentorapp/mentor-availability/${mentor.id}/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Response error:', errorData);
                throw new Error(errorData.message || 'Failed to fetch available slots');
            }
            
            const data = await response.json();
            console.log('Available slots data:', data);
            
            if (!data || !data.available_slots) {
                throw new Error('Invalid response format');
            }
            
            // Format the slots to include both start and end times
            const formattedSlots = data.available_slots.map((slot, index) => ({
                id: `slot-${index}`,
                day: formatDay(slot.day),
                start_time: slot.start_time,
                end_time: slot.end_time,
                displayTime: `${formatDay(slot.day)}: ${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`
            }));
            
            setAvailableSlots(formattedSlots);
        } catch (err) {
            setError('Failed to load available time slots. Please try again.');
            console.error('Error fetching slots:', err);
        } finally {
            setLoading(false);
        }
    }, [mentor]);

    const fetchMentorDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/mentorapp/mentors/${mentor.id}/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch mentor details');
            }
            const data = await response.json();
            console.log('Mentor details:', data);
            setMentorDetails(data);
        } catch (err) {
            console.error('Error fetching mentor details:', err);
            setError('Failed to fetch mentor details. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [mentor]);

    useEffect(() => {
        if (isOpen && mentor?.id) {
            fetchAvailableSlots();
            fetchMentorDetails();
        }
    }, [isOpen, mentor, fetchAvailableSlots, fetchMentorDetails]);

    const getTimeOptions = (slot) => {
        const start = new Date(`1970-01-01T${slot.start_time}`);
        const end = new Date(`1970-01-01T${slot.end_time}`);
        const options = [];
        
        // Generate 1-hour intervals between start and end time
        let currentTime = new Date(start);
        while (currentTime < end) {
            // Convert to 24-hour format without timezone
            const time24hr = currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            
            options.push({
                time: time24hr,
                display: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            currentTime.setMinutes(currentTime.getMinutes() + 60); // 1 hour intervals
        }
        
        return options;
    };

    useEffect(() => {
        if (selectedSlot) {
            const slot = JSON.parse(selectedSlot);
            setTimeOptions(getTimeOptions(slot));
        } else {
            setTimeOptions([]);
        }
    }, [selectedSlot]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSlot || !selectedTime) {
            setError('Please select both a time slot and a specific time');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Parse the selected slot
            const slot = JSON.parse(selectedSlot);
            
            // Calculate the next occurrence of the selected day
            const today = new Date();
            const dayMap = {
                'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 0
            };
            const targetDay = dayMap[slot.day];
            const currentDay = today.getDay();
            
            // Calculate days until next occurrence
            let daysAhead = targetDay - currentDay;
            if (daysAhead <= 0) {
                daysAhead += 7;
            }
            
            // Calculate the session date
            const sessionDate = new Date(today);
            sessionDate.setDate(today.getDate() + daysAhead);
            
            // Check for existing sessions
            const response = await fetch(`${process.env.REACT_APP_API_URL}/mentorapp/check-existing-sessions/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    mentor_id: mentor.id,
                    session_date: sessionDate.toISOString().split('T')[0],
                    session_time: selectedTime
                })
            });

            if (!response.ok) {
                throw new Error('Failed to check existing sessions');
            }

            const data = await response.json();
            
            if (data.has_conflict) {
                setError('This time slot is already booked. Please select a different time.');
                setLoading(false);
                return;
            }

            // Store booking data in session
            const bookingData = {
                mentor_id: mentor.id,
                time_slot: {
                    ...slot,
                    selected_time: selectedTime
                },
                amount: mentorDetails?.hourly_rate
            };
            
            // Store in both session storage and request body
            sessionStorage.setItem('booking_data', JSON.stringify(bookingData));

            // Create booking order
            const orderResponse = await fetch(`${process.env.REACT_APP_API_URL}/mentorapp/bookings/create-order/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(bookingData)
            });

            if (!orderResponse.ok) {
                throw new Error('Failed to create booking order');
            }

            const orderData = await orderResponse.json();

            // Initialize Razorpay
            const options = {
                key: 'rzp_test_qHVVGRqP506WMd',
                amount: orderData.amount,
                currency: "INR",
                name: "MentorQuest",
                description: `Booking session with ${mentorDetails?.user?.first_name} ${mentorDetails?.user?.last_name}`,
                order_id: orderData.order_id,
                handler: async (response) => {
                    try {
                        // Verify payment
                        const verifyResponse = await fetch(`${process.env.REACT_APP_API_URL}/mentorapp/bookings/verify-payment/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                booking_data: bookingData
                            })
                        });

                        if (!verifyResponse.ok) {
                            const errorData = await verifyResponse.json();
                            console.error('Payment verification error:', errorData);
                            throw new Error(errorData.message || 'Payment verification failed');
                        }

                        const verifyData = await verifyResponse.json();
                        console.log('Payment verification successful:', verifyData);

                        // Close modal and redirect to MenteeRequests
                        onClose();
                        window.location.href = '/dashboard/mentee/requests';
                    } catch (err) {
                        console.error('Payment verification failed:', err);
                        toast.error(err.message || 'Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: `${mentorDetails?.user?.first_name} ${mentorDetails?.user?.last_name}`,
                    email: mentorDetails?.user?.email
                },
                theme: {
                    color: "#4a90e2"
                },
                modal: {
                    ondismiss: function() {
                        console.log('Payment modal closed');
                    }
                }
            };

            console.log('Initializing Razorpay with options:', options);
            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                toast.error(`Payment failed: ${response.error.description}`);
            });
            razorpay.open();
        } catch (err) {
            console.error('Booking failed:', err);
            setError('Failed to process booking. Please try again.');
            toast.error('Failed to process booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getProfileImageUrl = (profileImage) => {
        if (!profileImage) return "/placeholder.svg";
        if (profileImage.startsWith('http')) return profileImage;
        return `${process.env.REACT_APP_API_URL}${profileImage}`;
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Book a Session</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                <div className="mentor-info">
                    <img 
                        src={getProfileImageUrl(mentorDetails?.profile_image)}
                        alt={`${mentorDetails?.user?.first_name || 'Mentor'} ${mentorDetails?.user?.last_name || ''}`}
                        className="mentor-avatar"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder.svg";
                        }}
                    />
                    <div className="mentor-details">
                        <h3>{`${mentorDetails?.user?.first_name || 'Anonymous'} ${mentorDetails?.user?.last_name || 'Mentor'}`}</h3>
                        <p>{mentorDetails?.user?.email || 'Email not available'}</p>
                        {mentorDetails?.designation && (
                            <p className="mentor-designation">{mentorDetails.designation}</p>
                        )}
                        <p className="hourly-rate">₹{mentorDetails?.hourly_rate || '0'} / hour</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="timeSlot">Select Time Slot</label>
                        <select
                            id="timeSlot"
                            className="time-slot-select"
                            value={selectedSlot}
                            onChange={(e) => {
                                setSelectedSlot(e.target.value);
                                setSelectedTime(''); // Reset time when slot changes
                            }}
                            disabled={loading || availableSlots.length === 0}
                        >
                            <option value="">Choose a time slot</option>
                            {availableSlots.map(slot => (
                                <option key={slot.id} value={JSON.stringify({
                                    day: slot.day,
                                    start_time: slot.start_time,
                                    end_time: slot.end_time
                                })}>
                                    {slot.displayTime}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedSlot && (
                        <div className="form-group">
                            <label htmlFor="time">Select Specific Time</label>
                            <select
                                id="time"
                                className="time-slot-select"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                disabled={loading || timeOptions.length === 0}
                            >
                                <option value="">Choose a specific time</option>
                                {timeOptions.map((option, index) => (
                                    <option key={index} value={option.time}>
                                        {option.display}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <div className="session-duration">
                            <p>Session Duration: 1 hour</p>
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions">
                        <button 
                            type="button" 
                            className="cancel-button" 
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="book-button"
                            disabled={loading || !selectedSlot || !selectedTime}
                        >
                            {loading ? 'Processing...' : 'Book Now'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;