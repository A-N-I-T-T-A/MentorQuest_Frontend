import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken } from '../../services/authUtils';
import styles from './SkillsManagement.module.css';

const SkillsManagement = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingSkill, setEditingSkill] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');

    const API_URL = "http://127.0.0.1:8001/mentorapp";

    useEffect(() => {
        fetchSkills();
        setIsAdmin(userData.user_type?.toLowerCase() === 'admin');
    }, [userData.user_type]);

    const fetchSkills = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/skills/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSkills(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching skills:", err);
            setError('Failed to fetch skills. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSkill = async (e) => {
        e.preventDefault();
        try {
            const token = getAuthToken();
            const response = await axios.post(
                `${API_URL}/skills/`,
                editingSkill,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setSkills([...skills, response.data]);
            setEditingSkill(null);
            setError(null);
        } catch (err) {
            console.error("Error adding skill:", err);
            setError('Failed to add skill. Please try again.');
        }
    };

    const handleUpdateSkill = async (e) => {
        e.preventDefault();
        try {
            const token = getAuthToken();
            const response = await axios.put(
                `${API_URL}/skills/${editingSkill.id}/`,
                editingSkill,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setSkills(skills.map(skill => 
                skill.id === editingSkill.id ? response.data : skill
            ));
            setEditingSkill(null);
            setError(null);
        } catch (err) {
            console.error("Error updating skill:", err);
            setError('Failed to update skill. Please try again.');
        }
    };

    const handleDeleteSkill = async (skillId) => {
        if (!skillId) {
            setError('Invalid skill ID');
            return;
        }
        
        if (window.confirm('Are you sure you want to delete this skill?')) {
            try {
                console.log('Deleting skill with ID:', skillId); // Debug log
                const token = getAuthToken();
                await axios.delete(`${API_URL}/skills/${skillId}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setSkills(skills.filter(skill => skill.id !== skillId));
                setError(null);
            } catch (err) {
                console.error("Error deleting skill:", err);
                setError('Failed to delete skill. Please try again.');
            }
        }
    };

    return (
        <div className={styles.skillsManagement}>
            <div className={styles.header}>
                <h2>Skills Management</h2>
                {isAdmin && (
                    <button 
                        className={styles.addButton}
                        onClick={() => setEditingSkill({ skill_name: '', description: '' })}
                    >
                        <i className="fas fa-plus"></i>
                        Add New Skill
                    </button>
                )}
            </div>

            {error && <div className={styles.error}>{error}</div>}
            {loading && <div className={styles.loading}>
                <i className="fas fa-spinner fa-spin"></i> Loading skills...
            </div>}

            <div className={styles.skillsTable}>
                <table>
                    <thead>
                        <tr>
                            <th>Skill Name</th>
                            <th>Description</th>
                            {isAdmin && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {skills.map(skill => (
                            <tr key={skill.id}>
                                <td>{skill.skill_name}</td>
                                <td>{skill.description}</td>
                                {isAdmin && (
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button 
                                                className={styles.editButton}
                                                onClick={() => setEditingSkill(skill)}
                                            >
                                                <i className="fas fa-edit"></i>
                                                Edit
                                            </button>
                                            <button 
                                                className={styles.deleteButton}
                                                onClick={() => handleDeleteSkill(skill.id)}
                                                disabled={!skill.id}
                                            >
                                                <i className="fas fa-trash"></i>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAdmin && editingSkill && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>
                            <i className={`fas ${editingSkill.id ? 'fa-edit' : 'fa-plus'}`}></i>
                            {' '}
                            {editingSkill.id ? 'Edit Skill' : 'Add New Skill'}
                        </h3>
                        <form onSubmit={editingSkill.id ? handleUpdateSkill : handleAddSkill}>
                            <div className={styles.formGroup}>
                                <label>Skill Name:</label>
                                <input
                                    type="text"
                                    value={editingSkill.skill_name}
                                    onChange={e => setEditingSkill({
                                        ...editingSkill,
                                        skill_name: e.target.value
                                    })}
                                    placeholder="Enter skill name"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description:</label>
                                <textarea
                                    value={editingSkill.description}
                                    onChange={e => setEditingSkill({
                                        ...editingSkill,
                                        description: e.target.value
                                    })}
                                    placeholder="Enter skill description"
                                    rows="4"
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="submit" className={styles.saveButton}>
                                    <i className={`fas ${editingSkill.id ? 'fa-save' : 'fa-plus'}`}></i>
                                    {editingSkill.id ? ' Update' : ' Add'}
                                </button>
                                <button 
                                    type="button" 
                                    className={styles.cancelButton}
                                    onClick={() => setEditingSkill(null)}
                                >
                                    <i className="fas fa-times"></i> Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillsManagement; 