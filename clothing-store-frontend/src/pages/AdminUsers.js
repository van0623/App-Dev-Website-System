import React, { useState, useEffect, useCallback } from 'react';
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
  const [roleChangeModal, setRoleChangeModal] = useState({
    isOpen: false,
    userId: null,
    newRole: null,
    userName: '',
    currentRole: ''
  });
  const [loadingStates, setLoadingStates] = useState({});

  const fetchUsers = useCallback(async () => {
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
  }, [showError]);

  const filterUsers = useCallback(() => {
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
  }, [users, searchTerm, filterRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const handleRoleChange = (userId, currentRole, newRole, userName) => {
    // Prevent changing own role
    if (userId === user.id) {
      showError('You cannot change your own role');
      return;
    }

    // Prevent changing role of the last admin
    if (currentRole === 'admin' && newRole === 'customer') {
      const adminCount = users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        showError('Cannot remove the last admin user');
        return;
      }
    }

    setRoleChangeModal({
      isOpen: true,
      userId,
      newRole,
      userName,
      currentRole
    });
  };

  const confirmRoleChange = async () => {
    const { userId, newRole, userName } = roleChangeModal;
    
    setLoadingStates(prev => ({ ...prev, [userId]: true }));
    
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/role`, {
        role: newRole
      });
      
      showSuccess(`Successfully updated ${userName}'s role to ${newRole}`);
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      showError(error.response?.data?.message || 'Error updating user role');
    } finally {
      setLoadingStates(prev => ({ ...prev, [userId]: false }));
      setRoleChangeModal({ isOpen: false, userId: null, newRole: null, userName: '', currentRole: '' });
    }
  };

  const cancelRoleChange = () => {
    setRoleChangeModal({ isOpen: false, userId: null, newRole: null, userName: '', currentRole: '' });
  };

  const deleteUser = async (userId, userName) => {
    // Prevent deleting own account
    if (userId === user.id) {
      showError('You cannot delete your own account');
      return;
    }

    // Prevent deleting the last admin
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.role === 'admin') {
      const adminCount = users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        showError('Cannot delete the last admin user');
        return;
      }
    }

    if (window.confirm(`Are you sure you want to delete ${userName}'s account?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
        showSuccess(`Successfully deleted ${userName}'s account`);
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
                      onChange={(e) => handleRoleChange(
                        userData.id,
                        userData.role,
                        e.target.value,
                        `${userData.first_name} ${userData.last_name}`
                      )}
                      className={`role-select ${userData.role} ${loadingStates[userData.id] ? 'loading' : ''}`}
                      disabled={loadingStates[userData.id]}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{new Date(userData.created_at).toLocaleDateString()}</td>
                  <td>
                    <button 
                      onClick={() => deleteUser(userData.id, `${userData.first_name} ${userData.last_name}`)}
                      className="btn btn-sm btn-danger"
                      disabled={userData.id === user.id || loadingStates[userData.id]}
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

      {/* Role Change Confirmation Modal */}
      {roleChangeModal.isOpen && (
        <div className="role-confirm-modal">
          <div className="role-confirm-content">
            <div className="role-confirm-header">
              <h3>Confirm Role Change</h3>
            </div>
            <div className="role-confirm-body">
              <p>
                Are you sure you want to change {roleChangeModal.userName}'s role from{' '}
                <strong>{roleChangeModal.currentRole}</strong> to{' '}
                <strong>{roleChangeModal.newRole}</strong>?
              </p>
            </div>
            <div className="role-confirm-actions">
              <button 
                className="role-confirm-btn cancel"
                onClick={cancelRoleChange}
                disabled={loadingStates[roleChangeModal.userId]}
              >
                Cancel
              </button>
              <button 
                className="role-confirm-btn confirm"
                onClick={confirmRoleChange}
                disabled={loadingStates[roleChangeModal.userId]}
              >
                {loadingStates[roleChangeModal.userId] ? 'Updating...' : 'Confirm Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers; 