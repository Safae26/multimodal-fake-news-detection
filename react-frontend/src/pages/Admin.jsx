import { useState, useEffect } from 'react';
import { 
  Users, Shield, CheckCircle, XCircle, Trash2, Edit2, 
  UserPlus, Search, Filter, X, AlertTriangle, 
  Mail, Key, UserCheck, ShieldAlert, FileText, Activity,
  Loader2, BarChart3, PieChart, TrendingUp, Image, Eye, Maximize2, Globe, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export default function Admin({ token }) {
  const { confirmAction, toast } = useAlert();
  const [activeTab, setActiveTab] = useState('users'); // users, logs, analytics
  const [activeChartTab, setActiveChartTab] = useState('verification');
  const [usersList, setUsersList] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter State for Users
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // all, admin, user
  const [filterStatus, setFilterStatus] = useState('all'); // all, verified, pending

  // Pagination State
  const [usersPage, setUsersPage] = useState(1);
  const [logsPage, setLogsPage] = useState(1);
  const USERS_PER_PAGE = 8;
  const LOGS_PER_PAGE = 10;

  // Search state for Logs & Detail Modal
  const [logSearchTerm, setLogSearchTerm] = useState('');
  const [selectedScans, setSelectedScans] = useState([]);
  const [inspectLog, setInspectLog] = useState(null);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states for Add User
  const [addForm, setAddForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    is_admin: false,
    is_verified: false
  });

  // Form states for Edit User
  const [editForm, setEditForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '', // optional
    is_admin: false,
    is_verified: false
  });

  // Fetch users list
  const fetchUsers = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/users/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to retrieve user directory');
      }
      const data = await response.json();
      setUsersList(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to fetch user directory.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all system logs
  const fetchAllLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/analyses/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAllLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAllLogs();
  }, [token]);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchAllLogs();
    } else if (activeTab === 'analytics') {
      fetchUsers();
      fetchAllLogs();
    } else {
      fetchUsers();
    }
  }, [activeTab]);

  // Handle Add User Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (!addForm.username || !addForm.email || !addForm.password) {
        throw new Error('Username, email, and password are required.');
      }
      const response = await fetch('/api/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addForm)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create user');
      }

      setSuccessMsg(`User @${data.username} created successfully.`);
      toast(`User @${data.username} created successfully!`, 'success');
      setIsAddModalOpen(false);
      setAddForm({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        is_admin: false,
        is_verified: false
      });
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Error creating user.');
      toast(err.message || 'Error creating user.', 'error');
    }
  };

  // Open Edit Modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email,
      password: '', // leave empty to not change password
      is_admin: user.is_admin,
      is_verified: user.is_verified
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit User Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = { ...editForm };
      if (!payload.password) {
        delete payload.password;
      }

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update user');
      }

      setSuccessMsg(`User @${data.username} profile updated.`);
      toast(`User @${data.username} profile updated successfully!`, 'success');
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Error updating profile.');
      toast(err.message || 'Error updating profile.', 'error');
    }
  };

  // Toggle user permissions quickly
  const toggleAdmin = async (userId, currentVal) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_admin: !currentVal })
      });
      if (!response.ok) {
        throw new Error('Failed to update privileges');
      }
      setSuccessMsg('User privileges updated successfully.');
      toast(`User privileges updated to ${!currentVal ? 'Admin' : 'User'}!`, 'success');
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to toggle admin status.');
      toast(err.message || 'Failed to update user privileges.', 'error');
    }
  };

  // Toggle verification status quickly
  const toggleVerification = async (userId, currentVal) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_verified: !currentVal })
      });
      if (!response.ok) {
        throw new Error('Failed to update verification profile');
      }
      setSuccessMsg('User verification status updated.');
      toast(`User verification status updated to ${!currentVal ? 'Verified' : 'Pending'}!`, 'success');
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to toggle verification.');
      toast(err.message || 'Failed to update user verification.', 'error');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId, username) => {
    confirmAction({
      title: 'Delete User',
      message: `Are you sure you want to permanently delete user @${username}? This action is irreversible.`,
      type: 'danger',
      onConfirm: async () => {
        setErrorMsg('');
        setSuccessMsg('');
        try {
          const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!response.ok) {
            throw new Error('Failed to delete user profile');
          }
          setSuccessMsg(`User @${username} deleted successfully.`);
          toast(`User @${username} deleted successfully.`, 'success');

          // Cascading delete: Clean up user's reviews from local storage
          try {
            const savedComments = localStorage.getItem('user_comments');
            if (savedComments) {
              let commentsList = JSON.parse(savedComments);
              // Filter out comments where username matches or name matches (for legacy comments)
              commentsList = commentsList.filter(c => c.username !== username && c.name !== username);
              localStorage.setItem('user_comments', JSON.stringify(commentsList));
            }
          } catch (e) {
            console.error('Failed to cleanup user reviews', e);
          }

          fetchUsers();
        } catch (err) {
          setErrorMsg(err.message || 'Failed to delete user.');
          toast(err.message || 'Failed to delete user.', 'error');
        }
      }
    });
  };

  // Delete Scan Log
  const handleDeleteLog = async (logId) => {
    confirmAction({
      title: 'Delete Scan Record',
      message: 'Are you sure you want to delete this scan record from system-wide history logs?',
      type: 'danger',
      onConfirm: async () => {
        setErrorMsg('');
        setSuccessMsg('');
        try {
          const res = await fetch(`/api/analyses/${logId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!res.ok) {
            throw new Error('Failed to delete log entry');
          }
          setSuccessMsg('System-wide claim log deleted.');
          toast('System-wide claim log deleted successfully.', 'success');
          fetchAllLogs();
        } catch (err) {
          setErrorMsg(err.message || 'Failed to delete log.');
          toast(err.message || 'Failed to delete log.', 'error');
        }
      }
    });
  };

  // Bulk Delete Scans
  const handleBulkDeleteScans = async () => {
    if (selectedScans.length === 0) return;
    
    confirmAction({
      title: 'Bulk Delete Scan Records',
      message: `Are you sure you want to delete ${selectedScans.length} scan record(s)? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        setErrorMsg('');
        setSuccessMsg('');
        setIsLoadingLogs(true);
        try {
          // Process deletes in parallel
          const deletePromises = selectedScans.map(logId => 
            fetch(`/api/analyses/${logId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => {
              if (!res.ok) throw new Error(`Failed to delete log ${logId}`);
            })
          );
          await Promise.all(deletePromises);
          
          setSuccessMsg(`Successfully deleted ${selectedScans.length} system-wide claim logs.`);
          toast(`Successfully deleted ${selectedScans.length} system-wide claim logs.`, 'success');
          setSelectedScans([]);
          fetchAllLogs();
        } catch (err) {
          setErrorMsg('Failed to complete bulk delete operation.');
          toast('Failed to complete bulk delete operation.', 'error');
          setIsLoadingLogs(false);
        }
      }
    });
  };

  // Filtered Users List logic
  const filteredUsers = usersList.filter(user => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) {
      const matchesRole = 
        filterRole === 'all' || 
        (filterRole === 'admin' && user.is_admin) || 
        (filterRole === 'user' && !user.is_admin);

      const matchesStatus = 
        filterStatus === 'all' || 
        (filterStatus === 'verified' && user.is_verified) || 
        (filterStatus === 'pending' && !user.is_verified);

      return matchesRole && matchesStatus;
    }

    const searchClean = searchLower.replace(/^@/, '');
    const username = (user.username || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const firstName = (user.username === 'admin' ? (user.first_name || 'Safae') : (user.first_name || '')).toLowerCase();
    const lastName = (user.username === 'admin' ? (user.last_name || 'ERAJI') : (user.last_name || '')).toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();
    const reverseFullName = `${lastName} ${firstName}`.trim();

    const matchesSearch = 
      username.includes(searchLower) ||
      username.includes(searchClean) ||
      email.includes(searchLower) ||
      email.includes(searchClean) ||
      firstName.includes(searchLower) ||
      lastName.includes(searchLower) ||
      fullName.includes(searchLower) ||
      reverseFullName.includes(searchLower);

    const matchesRole = 
      filterRole === 'all' || 
      (filterRole === 'admin' && user.is_admin) || 
      (filterRole === 'user' && !user.is_admin);

    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'verified' && user.is_verified) || 
      (filterStatus === 'pending' && !user.is_verified);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Filtered Logs list logic
  const filteredLogs = allLogs.filter(log => {
    return (
      log.username.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
      log.model.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
      log.verdict.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
      (log.text || '').toLowerCase().includes(logSearchTerm.toLowerCase())
    );
  });

  // Reset pages on filter changes
  useEffect(() => { setUsersPage(1); }, [searchTerm, filterRole, filterStatus]);
  useEffect(() => { setLogsPage(1); }, [logSearchTerm]);

  // Paginated Slices
  const totalUsersPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;
  const paginatedUsers = filteredUsers.slice((usersPage - 1) * USERS_PER_PAGE, usersPage * USERS_PER_PAGE);

  const totalLogsPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE) || 1;
  const paginatedLogs = filteredLogs.slice((logsPage - 1) * LOGS_PER_PAGE, logsPage * LOGS_PER_PAGE);

  // Computed metrics
  const nonAdminUsers = usersList.filter(u => u.username !== 'admin');
  const totalUsers = nonAdminUsers.length;
  const verifiedCount = nonAdminUsers.filter(u => u.is_verified).length;
  const adminCount = usersList.filter(u => u.is_admin).length;
  const pendingCount = totalUsers - verifiedCount;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-in relative">
      
      {/* Decorative Glow elements */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-indigo-500/10 glowing-bg"></div>
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 glowing-bg" style={{ animationDelay: '4s' }}></div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-6 relative z-10">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            Admin Operations Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Manage user accounts and monitor performance insights.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-xs hover:scale-[1.02] active:scale-95 shadow-md shadow-indigo-500/10 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Analytics dashboard row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 relative z-10">
        <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200/60 dark:border-slate-805 rounded-2xl shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500"></div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block tracking-wider">Total Users</span>
            <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{totalUsers}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200/60 dark:border-slate-805 rounded-2xl shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500"></div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block tracking-wider">Verified Status</span>
            <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{verifiedCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200/60 dark:border-slate-805 rounded-2xl shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-amber-500"></div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block tracking-wider">Pending Status</span>
            <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{pendingCount}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200/60 dark:border-slate-805 rounded-2xl shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-violet-500"></div>
          <div className="p-3 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block tracking-wider">Total Admins</span>
            <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{adminCount}</span>
          </div>
        </div>
      </div>

      {/* Action Needed Alerts */}
      {pendingCount > 0 && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl flex items-start gap-3 animate-pulse-subtle relative z-10">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-black text-amber-850 dark:text-amber-400 uppercase tracking-wider mb-0.5">Action Needed: Pending Account Verifications</h4>
            <p className="text-[11px] text-amber-700 dark:text-slate-355 leading-normal">
              {pendingCount === 1 
                ? '1 user account is currently awaiting profile verification. Please review the user list below and click the verification badge to approve it.' 
                : `There are ${pendingCount} user accounts currently awaiting profile verification. Please review the user list below and click the verification badges to approve them.`}
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      {errorMsg && (
        <div className="mb-6 flex items-start gap-2.5 p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-200/50 dark:border-red-900/30 relative z-10">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="mb-6 flex items-start gap-2.5 p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl border border-emerald-200/50 dark:border-emerald-900/30 relative z-10">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Navigation Tab Switcher */}
      <div className="flex border-b border-slate-250 dark:border-slate-800 mb-6 gap-2 relative z-10 overflow-x-auto touch-scroll whitespace-nowrap pb-1">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-250'
          }`}
        >
          <Users className="w-4 h-4" />
          Users
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-250'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Analytics
        </button>
      </div>

      {/* TAB CONTENT: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <>
          {/* Search and Filters Controls */}
          <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
            <div className="w-full md:max-w-md relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by username, email, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-200 transition-colors"
              />
            </div>
            
            <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-1.5 rounded-xl">
                <Filter className="w-3.5 h-3.5 text-slate-450" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="bg-transparent text-xs text-slate-700 dark:text-slate-350 focus:outline-none font-bold cursor-pointer"
                >
                  <option value="all" className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Roles</option>
                  <option value="admin" className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">Admins</option>
                  <option value="user" className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">Users</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-1.5 rounded-xl">
                <UserCheck className="w-3.5 h-3.5 text-slate-450" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent text-xs text-slate-700 dark:text-slate-350 focus:outline-none font-bold cursor-pointer"
                >
                  <option value="all" className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Statuses</option>
                  <option value="verified" className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">Verified</option>
                  <option value="pending" className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">Pending</option>
                </select>
              </div>

              {(searchTerm !== '' || filterRole !== 'all' || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterRole('all');
                    setFilterStatus('all');
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Directory Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden relative z-10">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
                <p className="text-slate-500 text-xs">Loading user directory...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] table-auto border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-805 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      <th className="p-4">User</th>
                      <th className="p-4">Email</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Role</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedUsers.map((usr) => (
                      <tr
                        key={usr.id}
                        className="hover:bg-slate-50/30 dark:hover:bg-indigo-950/10 transition-colors duration-150 text-sm animate-fade-in"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={(usr.username === 'admin' && (!usr.profile_picture || usr.profile_picture.includes('images.unsplash.com') || usr.profile_picture.includes('dicebear.com'))) ? '/assets/admin/safae.jpeg' : (usr.profile_picture || `https://api.dicebear.com/9.x/notionists/svg?seed=${usr.username}`)}
                              alt={usr.username}
                              className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 object-cover"
                              onError={(e) => {
                                e.target.src = usr.username === 'admin' ? '/assets/admin/safae.jpeg' : `https://api.dicebear.com/9.x/notionists/svg?seed=${usr.username}`;
                              }}
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white leading-none mb-1 flex items-center gap-1.5">
                                {usr.first_name || usr.last_name ? `${usr.first_name || ''} ${usr.last_name || ''}` : 'Unnamed User'}
                                {Boolean(usr.is_admin) && <Shield className="w-3.5 h-3.5 text-violet-500" />}
                              </p>
                              <p className="text-xs font-mono text-slate-450 dark:text-slate-500">@{usr.username}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{usr.email}</td>

                        <td className="p-4 text-center">
                          {usr.username === 'admin' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Verified
                            </span>
                          ) : (
                            <button
                              onClick={() => toggleVerification(usr.id, usr.is_verified)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                                usr.is_verified
                                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30 hover:bg-emerald-100/50'
                                  : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30 hover:bg-amber-100/50'
                              }`}
                              title="Click to toggle verification status"
                            >
                              {usr.is_verified ? (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Verified
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5" />
                                  Pending
                                </>
                              )}
                            </button>
                          )}
                        </td>

                        <td className="p-4 text-center">
                          {usr.username === 'admin' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-violet-50 dark:bg-slate-800 text-violet-600 dark:text-violet-300 border-violet-200 dark:border-violet-700/50 shadow-sm">
                              <Shield className="w-3.5 h-3.5" />
                              System Admin
                            </span>
                          ) : (
                            <button
                              onClick={() => toggleAdmin(usr.id, usr.is_admin)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all shadow-sm ${
                                usr.is_admin
                                  ? 'bg-violet-50 dark:bg-slate-800 text-violet-600 dark:text-violet-300 border-violet-200 dark:border-violet-700/50 hover:bg-violet-100 dark:hover:bg-slate-700'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700/80'
                              }`}
                              title="Click to toggle system admin rights"
                            >
                              <Shield className="w-3.5 h-3.5" />
                              {usr.is_admin ? 'Admin' : 'User'}
                            </button>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          {usr.username === 'admin' ? (
                            <div className="flex items-center justify-end gap-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest mr-2 select-none">
                              <Shield className="w-3.5 h-3.5 text-violet-500" />
                              System Owner
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(usr)}
                                className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-550 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:scale-105 active:scale-95 transition-all"
                                title="Edit User"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(usr.id, usr.username)}
                                className="p-2 bg-slate-50 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:scale-105 active:scale-95 transition-all"
                                title="Delete Account"
                                disabled={usr.username === 'admin'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>

                      </tr>
                    ))}

                    {filteredUsers.length === 0 && !isLoading && (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-400 text-xs font-bold uppercase">
                          No user accounts logged matching selection filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Users Pagination Bar */}
            {filteredUsers.length > 0 && !isLoading && (
              <div className="p-4 bg-slate-50/80 dark:bg-slate-950/80 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Showing <strong className="text-slate-800 dark:text-slate-200">{Math.min(filteredUsers.length, (usersPage - 1) * USERS_PER_PAGE + 1)}</strong> to <strong className="text-slate-800 dark:text-slate-200">{Math.min(filteredUsers.length, usersPage * USERS_PER_PAGE)}</strong> of <strong className="text-slate-800 dark:text-slate-200">{filteredUsers.length}</strong> users
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setUsersPage(prev => Math.max(prev - 1, 1))}
                    disabled={usersPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalUsersPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setUsersPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        usersPage === p
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => setUsersPage(prev => Math.min(prev + 1, totalUsersPages))}
                    disabled={usersPage === totalUsersPages}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB CONTENT: ANALYTICS & INSIGHTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in relative z-10">
          {/* Overview Stat Cards — Scans */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2"><Activity className="w-4 h-4" />Scan Analytics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Total System Scans</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white">{allLogs.length}</span>
              </div>
              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Fake News Rate</span>
                <span className="text-3xl font-black text-red-500">
                  {allLogs.length > 0 
                    ? `${((allLogs.filter(l => l.verdict.toLowerCase().includes('fake')).length / allLogs.length) * 100).toFixed(1)}%`
                    : '0.0%'
                  }
                </span>
              </div>
              <div className="p-3.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Avg. Model Confidence</span>
                <span className="text-3xl font-black text-emerald-500">
                  {allLogs.length > 0
                    ? `${(allLogs.reduce((sum, l) => sum + l.confidence, 0) / allLogs.length).toFixed(1)}%`
                    : '0.0%'
                  }
                </span>
              </div>
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Modality Type Distribution (Handles Multimodal, Text-Only, Image-Only) */}
            <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-850 dark:text-white text-base">Modality Distribution</h3>
              </div>
              
              {allLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase">No data to display. Run some scans first.</div>
              ) : (
                <div className="space-y-6 py-2">
                  {(() => {
                    const multimodalCount = allLogs.filter(l => l.image_present && l.text && l.text.trim().length > 0).length;
                    const imageOnlyCount = allLogs.filter(l => l.image_present && (!l.text || l.text.trim().length === 0)).length;
                    const textOnlyCount = allLogs.filter(l => !l.image_present).length;

                    const multimodalPct = (multimodalCount / allLogs.length) * 100;
                    const imageOnlyPct = (imageOnlyCount / allLogs.length) * 100;
                    const textOnlyPct = (textOnlyCount / allLogs.length) * 100;

                    return (
                      <>
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs font-bold text-slate-755 dark:text-slate-300">
                            <span>Multimodal (Text + Image)</span>
                            <span>{multimodalCount} scans ({multimodalPct.toFixed(0)}%)</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold text-slate-755 dark:text-slate-300">
                            <span>Text-Only (Unimodal Text)</span>
                            <span>{textOnlyCount} scans ({textOnlyPct.toFixed(0)}%)</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold text-slate-755 dark:text-slate-300">
                            <span>Image-Only (Unimodal Image)</span>
                            <span>{imageOnlyCount} scans ({imageOnlyPct.toFixed(0)}%)</span>
                          </div>
                          
                          {/* Segmented Progress Bar */}
                          <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex p-0.5 border border-slate-200/40 dark:border-slate-700/40">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-l-full transition-all duration-1000 cursor-pointer"
                              style={{ width: `${multimodalPct}%` }}
                              title={`Multimodal: ${multimodalCount} scans (${multimodalPct.toFixed(0)}%)`}
                            ></div>
                            <div 
                              className="h-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-1000 cursor-pointer"
                              style={{ width: `${textOnlyPct}%` }}
                              title={`Text-Only: ${textOnlyCount} scans (${textOnlyPct.toFixed(0)}%)`}
                            ></div>
                            <div 
                              className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-r-full transition-all duration-1000 cursor-pointer"
                              style={{ width: `${imageOnlyPct}%` }}
                              title={`Image-Only: ${imageOnlyCount} scans (${imageOnlyPct.toFixed(0)}%)`}
                            ></div>
                          </div>
                        </div>

                        {/* Interactive Metric Cards */}
                        <div className="grid grid-cols-3 gap-3">
                          <div 
                            onClick={() => toast(`Multimodal: ${multimodalCount} cross-modal scans (${multimodalPct.toFixed(0)}%)`, 'info')}
                            className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 rounded-2xl flex flex-col items-center cursor-pointer hover:scale-[1.03] active:scale-95 transition-all shadow-xs hover:shadow-md"
                          >
                            <span className="text-xl font-black text-indigo-500 dark:text-indigo-400">{multimodalCount}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1 text-center">Multimodal</span>
                          </div>
                          <div 
                            onClick={() => toast(`Text-Only: ${textOnlyCount} unimodal text scans (${textOnlyPct.toFixed(0)}%)`, 'info')}
                            className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850 hover:border-violet-500/50 dark:hover:border-violet-500/50 rounded-2xl flex flex-col items-center cursor-pointer hover:scale-[1.03] active:scale-95 transition-all shadow-xs hover:shadow-md"
                          >
                            <span className="text-xl font-black text-violet-500 dark:text-violet-400">{textOnlyCount}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1 text-center">Text-Only</span>
                          </div>
                          <div 
                            onClick={() => toast(`Image-Only: ${imageOnlyCount} unimodal image scans (${imageOnlyPct.toFixed(0)}%)`, 'info')}
                            className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 rounded-2xl flex flex-col items-center cursor-pointer hover:scale-[1.03] active:scale-95 transition-all shadow-xs hover:shadow-md"
                          >
                            <span className="text-xl font-black text-cyan-500 dark:text-cyan-400">{imageOnlyCount}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1 text-center">Image-Only</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* ===== MERGED USER ANALYTICS CARD ===== */}
            <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-5 relative overflow-hidden group">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  {activeChartTab === 'verification' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  )}
                  <h3 className="font-bold text-slate-850 dark:text-white text-base">
                    {activeChartTab === 'verification' ? 'User Account Status' : 'Top Active Users'}
                  </h3>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl shadow-inner border border-slate-200/50 dark:border-slate-700/50">
                  <button
                    onClick={() => setActiveChartTab('verification')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeChartTab === 'verification'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Account Status
                  </button>
                  <button
                    onClick={() => setActiveChartTab('leaderboard')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeChartTab === 'leaderboard'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Top Users
                  </button>
                </div>
              </div>

              {activeChartTab === 'verification' ? (
                // Verification View
                totalUsers === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase relative z-10">No user accounts found.</div>
                ) : (
                  <div className="space-y-5 py-2 animate-fade-in relative z-10">
                    {[{ label: 'Verified Accounts', count: verifiedCount, color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100/50 dark:border-emerald-950/20' },
                      { label: 'Unverified Accounts', count: pendingCount, color: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100/50 dark:border-amber-950/20' }
                    ].map(({ label, count, color, textColor, bg }) => {
                      const pct = totalUsers > 0 ? (count / totalUsers) * 100 : 0;
                      return (
                        <div key={label} className="space-y-2 group cursor-default">
                          <div className={`flex items-center justify-between p-3 border rounded-xl transition-all duration-300 group-hover:shadow-sm ${bg}`}>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
                            <span className={`text-xs font-black ${textColor}`}>{count} ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                            <div className={`h-full ${color} rounded-full transition-all duration-1000 opacity-90 group-hover:opacity-100`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                // Leaderboard View
                allLogs.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase relative z-10">No scan activity yet.</div>
                ) : (
                  <div className="space-y-3 animate-fade-in py-2 relative z-10">
                    {(() => {
                      const byUser = allLogs.reduce((acc, log) => {
                        acc[log.username] = (acc[log.username] || 0) + 1;
                        return acc;
                      }, {});
                      const sorted = Object.entries(byUser)
                        .map(([username, count]) => ({ username, count }))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 5);
                      const maxScans = sorted.length > 0 ? sorted[0].count : 1;
                      const rankColors = ['text-amber-500', 'text-slate-400', 'text-amber-700', 'text-slate-500', 'text-slate-500'];
                      const rankBg = ['bg-amber-50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/30', 'bg-slate-50 dark:bg-slate-950 border-slate-200/40 dark:border-slate-850', 'bg-orange-50/50 dark:bg-orange-950/10 border-orange-100/50 dark:border-orange-950/20', 'bg-slate-50 dark:bg-slate-950 border-slate-200/40 dark:border-slate-850', 'bg-slate-50 dark:bg-slate-950 border-slate-200/40 dark:border-slate-850'];
                      
                      return sorted.map((u, i) => {
                        const pct = (u.count / maxScans) * 100;
                        return (
                          <div key={u.username} className={`flex items-center gap-4 p-2.5 border rounded-xl group hover:shadow-sm transition-all cursor-default ${rankBg[i] || rankBg[3]}`}>
                            <span className={`text-sm font-black w-6 text-center shrink-0 ${rankColors[i] || 'text-slate-400'}`}>#{i + 1}</span>
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center shrink-0 overflow-hidden">
                                {usersList.find(x => x.username === u.username)?.profile_picture ? (
                                    <img src={usersList.find(x => x.username === u.username).profile_picture} alt={u.username} className="w-full h-full object-cover" />
                                ) : (
                                    <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${u.username}&backgroundColor=transparent`} alt={u.username} className="w-full h-full opacity-80" />
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex justify-between items-center pr-2">
                                <span className="text-xs font-bold text-slate-850 dark:text-white truncate">@{u.username}</span>
                                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{u.count}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000 opacity-80 group-hover:opacity-100" style={{ width: `${pct}%` }}></div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )
              )}
            </div>

            {/* Activity Over Time (Prediction Volume - Full Width at Bottom) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <h3 className="font-bold text-slate-850 dark:text-white text-base">Prediction Volume (Last 7 Days)</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Daily verification scan volume across all registered accounts</p>
                  </div>
                </div>
                {allLogs.length > 0 && (
                  <span className="text-xs font-black px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-800/40 rounded-xl">
                    Total {allLogs.length} Scans
                  </span>
                )}
              </div>
              
              {allLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase">No data to display. Run some scans first.</div>
              ) : (
                <div>
                  {(() => {
                    const activity = allLogs.reduce((acc, log) => {
                      const dateStr = log.timestamp ? log.timestamp.split(' ')[0] : 'Unknown';
                      acc[dateStr] = (acc[dateStr] || 0) + 1;
                      return acc;
                    }, {});
                    const sorted = Object.entries(activity)
                      .map(([date, count]) => ({ date, count }))
                      .sort((a, b) => new Date(a.date) - new Date(b.date))
                      .slice(-7);
                    const maxVal = sorted.length > 0 ? Math.max(...sorted.map(d => d.count)) : 1;
                    const svgH = 140;
                    const barW = 36;
                    const gap = 24;
                    const labelH = 24;
                    const totalW = sorted.length * (barW + gap) - gap;

                    const fmtDate = (dateStr) => {
                      try {
                        return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                      } catch { return dateStr; }
                    };

                    return (
                      <div className="w-full overflow-x-auto pt-2">
                        <svg
                          viewBox={`0 0 ${totalW} ${svgH + labelH}`}
                          className="w-full"
                          style={{ minWidth: `${Math.max(totalW, 300)}px`, height: `${svgH + labelH + 16}px` }}
                        >
                          {/* Y-axis gridlines */}
                          {[0, 0.25, 0.5, 0.75, 1].map(frac => {
                            const y = svgH - frac * svgH;
                            return (
                              <line
                                key={frac}
                                x1={0} y1={y}
                                x2={totalW} y2={y}
                                stroke="currentColor"
                                strokeWidth="0.5"
                                className="text-slate-200 dark:text-slate-800"
                                strokeDasharray={frac === 0 ? 'none' : '3 3'}
                              />
                            );
                          })}

                          {sorted.map(({ date, count }, i) => {
                            const barH = Math.max((count / maxVal) * svgH, 6);
                            const x = i * (barW + gap);
                            const y = svgH - barH;
                            const midX = x + barW / 2;
                            return (
                              <g key={date} className="group cursor-pointer">
                                {/* Gradient bar */}
                                <defs>
                                  <linearGradient id={`bgrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgb(129, 140, 248)" />
                                    <stop offset="100%" stopColor="rgb(79, 70, 229)" />
                                  </linearGradient>
                                </defs>
                                <rect
                                  x={x}
                                  y={y}
                                  width={barW}
                                  height={barH}
                                  rx="6"
                                  fill={`url(#bgrad-${i})`}
                                  className="opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:filter group-hover:drop-shadow-md"
                                />
                                {/* Count badge on top of bar */}
                                <text
                                  x={midX}
                                  y={y - 8}
                                  textAnchor="middle"
                                  fontSize="9"
                                  fontWeight="900"
                                  className="fill-indigo-600 dark:fill-indigo-400 group-hover:scale-110 transition-all duration-300 pointer-events-none"
                                >
                                  {count}
                                </text>
                                {/* Date label below baseline */}
                                <text
                                  x={midX}
                                  y={svgH + labelH - 4}
                                  textAnchor="middle"
                                  fontSize="8"
                                  fontWeight="700"
                                  fill="currentColor"
                                  className="text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300"
                                >
                                  {fmtDate(date)}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== ADD USER MODAL ==================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-verdict-reveal">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Add New User</h3>
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Create Account</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={addForm.first_name}
                      onChange={(e) => setAddForm({ ...addForm, first_name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={addForm.last_name}
                      onChange={(e) => setAddForm({ ...addForm, last_name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Username *</label>
                  <input
                    type="text"
                    required
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-mono text-slate-900 dark:text-white"
                    placeholder="johndoe"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                      placeholder="johndoe@institution.org"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Access Password *</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100/50">
                    <input
                      type="checkbox"
                      checked={addForm.is_admin}
                      onChange={(e) => setAddForm({ ...addForm, is_admin: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 size-4 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Grant Admin Rights</span>
                      <span className="text-[10px] text-slate-400 block leading-tight">Admin privileges</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100/50">
                    <input
                      type="checkbox"
                      checked={addForm.is_verified}
                      onChange={(e) => setAddForm({ ...addForm, is_verified: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 size-4 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Auto-Verify Account</span>
                      <span className="text-[10px] text-slate-400 block leading-tight">Verified status</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-slate-50 dark:bg-slate-950/80 p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-250 dark:border-slate-850 text-slate-700 dark:text-slate-350 hover:bg-slate-100 rounded-xl font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/10 transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== EDIT USER MODAL ==================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-verdict-reveal">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 rounded-lg">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Edit User Details</h3>
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Modifying @{selectedUser?.username}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={editForm.first_name}
                      onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={editForm.last_name}
                      onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Username *</label>
                  <input
                    type="text"
                    required
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">
                    Reset Password <span className="text-[10px] font-normal text-slate-400">(leave blank to keep current)</span>
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100/50">
                    <input
                      type="checkbox"
                      checked={editForm.is_admin}
                      onChange={(e) => setEditForm({ ...editForm, is_admin: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 size-4 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Grant Admin Rights</span>
                      <span className="text-[10px] text-slate-400 block leading-tight">Admin privileges</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100/50">
                    <input
                      type="checkbox"
                      checked={editForm.is_verified}
                      onChange={(e) => setEditForm({ ...editForm, is_verified: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 size-4 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Set Account Verified</span>
                      <span className="text-[10px] text-slate-400 block leading-tight">Verified status</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-slate-50 dark:bg-slate-950/80 p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-250 dark:border-slate-850 text-slate-700 dark:text-slate-350 hover:bg-slate-100 rounded-xl font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/10 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== FULL NEWS INSPECTION MODAL ==================== */}
      {isInspectModalOpen && inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-verdict-reveal">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Verification Audit Record
                  </h3>
                  <p className="text-slate-400 text-xs font-medium">Submitted by <strong className="text-indigo-600 dark:text-indigo-400">@{inspectLog.username}</strong> on {inspectLog.timestamp || 'Recent Analysis'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsInspectModalOpen(false);
                  setInspectLog(null);
                }}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Verdict Summary Card */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                inspectLog.verdict.includes('Fake')
                  ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200/60 dark:border-red-900/40 text-red-700 dark:text-red-300'
                  : 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300'
              }`}>
                <div className="flex items-center gap-3">
                  {inspectLog.verdict.includes('Fake') ? (
                    <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                  )}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest block opacity-75">AI Classification Result</span>
                    <h4 className="text-lg font-black">{inspectLog.verdict}</h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest block opacity-75">Confidence Score</span>
                  <span className="text-xl font-black">{inspectLog.confidence.toFixed(1)}%</span>
                </div>
              </div>

              {/* Full News Claim Text Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    Full Submitted News Claim Text
                  </label>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inspectLog.text || '');
                      toast('Full news claim copied to clipboard!', 'success');
                    }}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Copy Text
                  </button>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 rounded-2xl text-slate-850 dark:text-slate-200 text-sm leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap font-sans">
                  {(() => {
                    const rawText = (inspectLog.text || '').replace(/🔗/g, '');
                    let cleanText = rawText.replace(/https?:\/\/[^\s]+/gi, '').replace(/\s+/g, ' ').trim();
                    cleanText = cleanText.replace(/source\s*:?\s*$/i, '').trim();
                    return cleanText || <em className="text-slate-400">No article text submitted. Visual/metadata analysis was performed.</em>;
                  })()}
                </div>

                {/* Extracted Original Source Link */}
                {(() => {
                  const rawText = inspectLog.text || '';
                  const foundMatch = rawText.match(/(https?:\/\/[^\s]+)/i);
                  const sourceLink = inspectLog.source_url || inspectLog.url || (foundMatch ? foundMatch[1] : null);
                  if (!sourceLink) return null;

                  return (
                    <div className="mt-2 flex items-center justify-between p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 rounded-2xl">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">Original Source Link:</span>
                        <a 
                          href={sourceLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                        >
                          {sourceLink}
                        </a>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Image Asset if Attached and valid */}
              {(() => {
                const rawSrc = inspectLog.image_url || inspectLog.image_path || inspectLog.claim_image_url || (typeof inspectLog.image === 'string' && inspectLog.image.length > 5 ? inspectLog.image : null);
                if (!rawSrc) return null;

                return (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Image className="w-3.5 h-3.5 text-indigo-500" />
                      Attached Multimodal Visual Evidence
                    </label>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 rounded-2xl flex items-center justify-center">
                      <img 
                        src={rawSrc} 
                        alt="Original Attached Visual Evidence" 
                        className="max-h-72 rounded-xl object-contain shadow-md hover:scale-[1.01] transition-transform duration-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.parentElement.parentElement.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* System Metadata Grid */}
              <div className="pt-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Modality Type</span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">{inspectLog.image_present ? (inspectLog.text ? 'Multimodal (Text + Image)' : 'Unimodal Image') : 'Unimodal Text'}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50/80 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                onClick={() => {
                  setIsInspectModalOpen(false);
                  setInspectLog(null);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                Close Inspection
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
