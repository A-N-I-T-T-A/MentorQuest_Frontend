import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import axios from 'axios';
import { getAuthToken } from '../../services/authUtils';
import styles from './ReportsPage.module.css';
import Sidebar from '../../components/Dashboard/Sidebar';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8001';

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [requestStats, setRequestStats] = useState(null);
  const [sessionStats, setSessionStats] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        
        const response = await axios.get(`${API_URL}/mentorapp/admin/reports/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Extract data from response
        const { user_stats, request_stats, session_stats } = response.data;
        
        setUserStats(user_stats);
        setRequestStats(request_stats);
        setSessionStats(session_stats);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load reports. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // Chart configurations
  const userChartData = {
    labels: ['Mentors', 'Mentees'],
    datasets: [
      {
        data: userStats ? [userStats.mentor_count, userStats.mentee_count] : [0, 0],
        backgroundColor: ['#4a90e2', '#56ccf2'],
        borderColor: ['#2a70c2', '#36acf2'],
        borderWidth: 1,
      },
    ],
  };

  const requestChartData = {
    labels: ['Pending', 'Accepted', 'Rejected'],
    datasets: [
      {
        label: 'Mentorship Requests',
        data: requestStats ? [
          requestStats.pending_count,
          requestStats.accepted_count,
          requestStats.rejected_count
        ] : [0, 0, 0],
        backgroundColor: ['#ffcd56', '#4bc0c0', '#ff6384'],
      },
    ],
  };

  const sessionChartData = {
    labels: ['Pending', 'Scheduled', 'Completed', 'Cancelled', 'No-show'],
    datasets: [
      {
        label: 'Sessions',
        data: sessionStats ? [
          sessionStats.pending_count,
          sessionStats.scheduled_count,
          sessionStats.completed_count,
          sessionStats.cancelled_count,
          sessionStats.no_show_count
        ] : [0, 0, 0, 0, 0],
        backgroundColor: [
          '#ffcd56', // Pending - Yellow
          '#4bc0c0', // Scheduled - Teal
          '#36a2eb', // Completed - Blue
          '#ff6384', // Cancelled - Red
          '#9966ff'  // No-show - Purple
        ],
      },
    ],
  };

  // Chart options
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Status Distribution',
      },
    },
  };

  if (loading) return (
    <div className="dashboard">
      <Sidebar userType="admin" />
      <div className="dashboard-content">
        <div className={styles.loading}>Loading reports...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="dashboard">
      <Sidebar userType="admin" />
      <div className="dashboard-content">
        <div className={styles.error}>{error}</div>
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <Sidebar userType="admin" />
      <div className="dashboard-content">
        <div className={styles.reportsContainer}>
          <h1 className={styles.pageTitle}>Analytics Dashboard</h1>
          <p className={styles.pageDescription}>
            View comprehensive statistics about users, mentorship requests, and sessions.
          </p>

          <div className={styles.statsOverview}>
            <div className={styles.statCard}>
              <h3>Total Users</h3>
              <p className={styles.statNumber}>{userStats ? userStats.mentor_count + userStats.mentee_count : 0}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Total Requests</h3>
              <p className={styles.statNumber}>
                {requestStats ? 
                  requestStats.pending_count + 
                  requestStats.accepted_count + 
                  requestStats.rejected_count : 0}
              </p>
            </div>
            <div className={styles.statCard}>
              <h3>Total Sessions</h3>
              <p className={styles.statNumber}>
                {sessionStats ? 
                  sessionStats.pending_count + 
                  sessionStats.scheduled_count + 
                  sessionStats.completed_count +
                  sessionStats.cancelled_count +
                  sessionStats.no_show_count : 0}
              </p>
            </div>
          </div>

          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h2>User Role Distribution</h2>
              <div className={styles.chartContainer}>
                <Pie data={userChartData} options={pieOptions} />
              </div>
            </div>

            <div className={styles.chartCard}>
              <h2>Mentorship Request Status</h2>
              <div className={styles.chartContainer}>
                <Pie data={requestChartData} options={pieOptions} />
              </div>
            </div>

            <div className={styles.chartCard}>
              <h2>Session Status Breakdown</h2>
              <div className={styles.chartContainer}>
                <Bar data={sessionChartData} options={barOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage; 