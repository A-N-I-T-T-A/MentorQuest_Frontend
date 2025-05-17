import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from "./Pages/Home/Home";
import About from "./Pages/About/About";
import Navbar from "./components/navbar/Navbar";
import Login from "./Pages/Auth/Login";
import Signup from "./Pages/Auth/Signup";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import ProfileSetup from "./Pages/Auth/ProfileSetup";
import MentorProfileSetup from "./Pages/Auth/MentorProfileSetup";
import FindMentor from "./Pages/FindMentor/FindMentor";
import MentorProfile from "./Pages/MentorProfile/MentorProfile";
import UserProfile from "./Pages/Profile/UserProfile";
import UserManagement from "./Pages/Admin/UserManagement";
import ReportsPage from "./Pages/Admin/ReportsPage";
import MentorDashboard from "./components/Dashboard/MentorDashboard";
import MenteeDashboard from "./components/Dashboard/MenteeDashboard";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import ProtectedRoute from './components/ProtectedRoute';
import SelectAccountType from './Pages/Auth/SelectAccountType';
import MentorRequests from './components/Dashboard/MentorRequests';
import MenteeRequests from './components/Dashboard/MenteeRequests';
import MatchingMentors from './components/Dashboard/MatchingMentors';
import MyMentees from './components/Dashboard/MyMentees';
import NotificationPage from './Pages/Admin/NotificationPage';
import MenteeProfile from './Pages/MenteeProfile';
import MentorNotificationPage from './Pages/Mentor/MentorNotificationPage';
import ScheduleSessionsPage from './Pages/Mentor/ScheduleSessionsPage';
import MentorFeedbacks from './Pages/Mentor/MentorFeedbacks';
import MenteeNotificationPage from './Pages/Mentee/MenteeNotificationPage';
import MenteeSessionsPage from './Pages/Mentee/MenteeSessionsPage';
import MyMentors from './components/Dashboard/MyMentors';

const App = () => {
    return (
        <Router>
            <Navbar />
            <ToastContainer position="top-center" />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profileSetup" element={<ProfileSetup />} />
                <Route path="/mentorProfileSetup" element={<MentorProfileSetup />} />
                <Route path="/forgotpassword" element={<ForgotPassword />} />
                <Route path="/about" element={<About />} />
                <Route path="/find-mentor" element={<FindMentor />} />
                <Route path="/mentor-profile/:mentorId" element={<MentorProfile />} />
                <Route 
                    path="/profile" 
                    element={
                        <ProtectedRoute allowedUserTypes={['mentor', 'mentee']}>
                            <UserProfile />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/mentee-profile/:id" 
                    element={
                        <ProtectedRoute allowedUserTypes={['admin', 'mentee', 'mentor']}>
                            <MenteeProfile />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/dashboard/admin/*" 
                    element={
                        <ProtectedRoute allowedUserTypes={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route
                    path="/dashboard/admin/users"
                    element={
                        <ProtectedRoute allowedUserTypes={['admin']}>
                            <UserManagement />
                        </ProtectedRoute>
                    }
                />
                <Route 
                    path="/dashboard/admin/notifications" 
                    element={
                        <ProtectedRoute allowedUserTypes={['admin']}>
                           <NotificationPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/dashboard/admin/reports" 
                    element={
                        <ProtectedRoute allowedUserTypes={['admin']}>
                           <ReportsPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/dashboard/mentor/*" 
                    element={
                        <ProtectedRoute allowedUserTypes={['mentor']}>
                            <MentorDashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/dashboard/mentor/notifications" 
                    element={
                        <ProtectedRoute allowedUserTypes={['mentor']}>
                            <MentorNotificationPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/dashboard/mentor/schedule" 
                    element={
                        <ProtectedRoute allowedUserTypes={['mentor']}>
                            <ScheduleSessionsPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/dashboard/mentor/feedbacks" 
                    element={
                        <ProtectedRoute allowedUserTypes={['mentor']}>
                            <MentorFeedbacks />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/dashboard/mentee/*" 
                    element={
                        <ProtectedRoute allowedUserTypes={['mentee']}>
                            <MenteeDashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/dashboard/mentee/notifications" 
                    element={
                        <ProtectedRoute allowedUserTypes={['mentee']}>
                            <MenteeNotificationPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/dashboard/mentee/sessions" 
                    element={
                        <ProtectedRoute allowedUserTypes={['mentee']}>
                            <MenteeSessionsPage />
                        </ProtectedRoute>
                    } 
                />
                <Route path="/select-account-type" element={<SelectAccountType />} />
                <Route path="/dashboard/mentor" element={<MentorDashboard />} />
                <Route path="/dashboard/mentor/requests" element={<MentorRequests />} />
                <Route path="/dashboard/mentor/mentees" element={<MyMentees />} />
                <Route path="/dashboard/mentee" element={<MenteeDashboard />} />
                <Route path="/dashboard/mentee/find-mentors" element={<MatchingMentors />} />
                <Route path="/dashboard/mentee/mentors" element={<MyMentors />} />
                <Route path="/dashboard/mentee/requests" element={<MenteeRequests />} />
            </Routes>
        </Router>
    );
};

export default App;
