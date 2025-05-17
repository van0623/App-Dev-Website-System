import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';
import '../App.css';

const AdminUsers = () => {
  const { user } = useUser();
  const { showSuccess, showError } = useNotification();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole]);

  const fetchUsers = async () => {
    console.log('Fetching users...'); // Debug log
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users');
      console.log('Response:', response.data); // Debug log
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response?.data); // Debug log
      showError('Failed to load users');
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/role`, {
        role: newRole
      });
      showSuccess('User role updated successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      showError('Error updating user role');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
        showSuccess('User deleted successfully!');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showError('Error deleting user');
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="access-denied">Access Denied: Admin Only</div>;
  }

  return (
    <div className="admin-users">
      <div className="container">
        <div className="page-header">
          <Link to="/admin/landing" className="back-button">
            Back to Admin Panel
          </Link>
          <h1>User Management</h1>
        </div>

        <div className="user-filters">
          <div className="filter-group">
            <label>Search Users:</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Filter by Role:</label>
            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(userData => (
                <tr key={userData.id}>
                  <td>{userData.id}</td>
                  <td>{userData.first_name} {userData.last_name}</td>
                  <td>{userData.email}</td>
                  <td>
                    <select
                      value={userData.role}
                      onChange={(e) => updateUserRole(userData.id, e.target.value)}
                      className={`role-select ${userData.role}`}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{new Date(userData.created_at).toLocaleDateString()}</td>
                  <td>
                    <button 
                      onClick={() => deleteUser(userData.id)}
                      className="btn btn-sm btn-danger"
                      disabled={userData.id === user.id}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="users-stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{users.length}</p>
          </div>
          <div className="stat-card">
            <h3>Customers</h3>
            <p>{users.filter(u => u.role === 'customer').length}</p>
          </div>
          <div className="stat-card">
            <h3>Admins</h3>
            <p>{users.filter(u => u.role === 'admin').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers; 