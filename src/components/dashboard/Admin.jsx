import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Activity,
  TestTube,
  RefreshCw,
  User,
  Search,
  Trash2,
  Eye,
  BarChart3,
  LogIn,
  UserPlus,
  Calendar
} from 'lucide-react';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  deleteDoc, 
  orderBy,
  getDoc
} from "firebase/firestore";
import { auth, db } from "../../firebase/config"; // CHANGED FROM "../../../firebase/config"
import { onAuthStateChanged } from "firebase/auth";

const Admin = () => {
  const navigate = useNavigate();
  const [isVerifiedAdmin, setIsVerifiedAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [labData, setLabData] = useState([]);
  const [loginData, setLoginData] = useState([]);
  const [signupData, setSignupData] = useState([]);
  const [personalInfo, setPersonalInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Security verification - check if user is actually admin
  useEffect(() => {
    const verifyAdminAccess = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const adminDoc = await getDoc(doc(db, 'adminUsers', user.uid));
        if (!adminDoc.exists() || adminDoc.data().isAdmin !== true) {
          // Not an admin - redirect to access denied or home
          navigate('/patient/dashboard');
          return;
        }
        setIsVerifiedAdmin(true);
        loadAllData(); // Only load data if user is verified admin
      } catch (error) {
        console.error('Security verification failed:', error);
        navigate('/login');
      }
    };

    verifyAdminAccess();
  }, [navigate]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUsers(),
        loadLabData(),
        loadLoginData(),
        loadSignupData(),
        loadPersonalInfo()
      ]);
      loadStats();
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersQuery = query(collection(db, "users"));
      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        joinedDate: doc.data().createdAt?.toDate?.() || new Date()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadLabData = async () => {
    try {
      const labQuery = query(collection(db, "LabInformation"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(labQuery);
      const labData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      setLabData(labData);
    } catch (error) {
      console.error('Error loading lab data:', error);
    }
  };

  const loadLoginData = async () => {
    try {
      const loginQuery = query(collection(db, "login"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(loginQuery);
      const loginData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date()
      }));
      setLoginData(loginData);
    } catch (error) {
      console.error('Error loading login data:', error);
    }
  };

  const loadSignupData = async () => {
    try {
      const signupQuery = query(collection(db, "signup"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(signupQuery);
      const signupData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      setSignupData(signupData);
    } catch (error) {
      console.error('Error loading signup data:', error);
    }
  };

  const loadPersonalInfo = async () => {
    try {
      const personalQuery = query(collection(db, "personalInformation"));
      const snapshot = await getDocs(personalQuery);
      const personalData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      }));
      setPersonalInfo(personalData);
    } catch (error) {
      console.error('Error loading personal info:', error);
    }
  };

  const loadStats = () => {
    const totalUsers = users.length;
    const totalLabEntries = labData.length;
    const totalLogins = loginData.length;
    const totalSignups = signupData.length;
    
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentUsers = users.filter(user => 
      new Date(user.joinedDate) > lastWeek
    ).length;
    
    const activeToday = loginData.filter(login => 
      new Date(login.timestamp).toDateString() === today.toDateString()
    ).length;

    setStats({
      totalUsers,
      totalLabEntries,
      totalLogins,
      totalSignups,
      recentUsers,
      activeToday
    });
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, "users", userId));
        await loadAllData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const deleteLabEntry = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this lab entry?')) {
      try {
        await deleteDoc(doc(db, "LabInformation", entryId));
        await loadAllData();
      } catch (error) {
        console.error('Error deleting lab entry:', error);
      }
    }
  };

  // Filter data based on search term
  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLabData = labData.filter(lab =>
    lab.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.userGender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLoginData = loginData.filter(login =>
    login.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    login.userId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserLabEntries = (userId) => {
    return labData.filter(lab => lab.userId === userId);
  };

  const getUserLoginHistory = (userId) => {
    return loginData.filter(login => login.userId === userId);
  };

  // Security check - don't render anything until admin is verified
  if (!isVerifiedAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border text-center">
          <div className="flex flex-col items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <h3 className="text-xl font-semibold">Verifying Access</h3>
            <p className="text-gray-600 mt-2">Checking administrator privileges...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border text-center">
          <div className="flex flex-col items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <h3 className="text-xl font-semibold">Loading Admin Dashboard</h3>
            <p className="text-gray-600 mt-2">Please wait while we load all system data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users and track system activity</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <button
              onClick={loadAllData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'dashboard', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'labdata', label: 'Lab Data', icon: TestTube },
              { id: 'activity', label: 'Activity', icon: Activity },
              { id: 'signups', label: 'Signups', icon: UserPlus }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search across all data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Users Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers || 0}</p>
                    <p className="text-xs text-green-600 mt-2">+{stats.recentUsers || 0} this week</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Lab Entries Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lab Entries</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalLabEntries || 0}</p>
                    <p className="text-xs text-gray-600 mt-2">Total submissions</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TestTube className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Total Logins Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Logins</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalLogins || 0}</p>
                    <p className="text-xs text-blue-600 mt-2">{stats.activeToday || 0} today</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <LogIn className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Signups Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Signups</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalSignups || 0}</p>
                    <p className="text-xs text-gray-600 mt-2">Total registrations</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <UserPlus className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Lab Submissions */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Lab Submissions</h3>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  {labData.slice(0, 5).map(lab => (
                    <div key={lab.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-600" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 block">
                            {lab.userId?.substring(0, 8)}...
                          </span>
                          <span className="text-xs text-gray-600">
                            Age: {lab.userAge} • RF: {lab.rheumatoidFactor}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {lab.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {labData.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No lab submissions yet</p>
                  )}
                </div>
              </div>

              {/* Recent Logins */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Logins</h3>
                  <Activity className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  {loginData.slice(0, 5).map(login => (
                    <div key={login.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <LogIn className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">{login.email}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">
                          {login.timestamp.toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {login.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {loginData.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No login activity yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">User Management</h3>
              <span className="text-sm text-gray-600 mt-2 md:mt-0">{users.length} users</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Joined</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Lab Entries</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Last Login</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => {
                    const userLabEntries = getUserLabEntries(user.id);
                    const userLoginHistory = getUserLoginHistory(user.id);
                    const lastLogin = userLoginHistory[0]?.timestamp;
                    
                    return (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {user.displayName || 'No Name'}
                              </p>
                              <p className="text-xs text-gray-500 font-mono">{user.id.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">{user.email}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {user.joinedDate.toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {userLabEntries.length}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {lastLogin ? lastLogin.toLocaleDateString() : 'Never'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No users found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">User Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">User ID</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-mono">{selectedUser.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Display Name</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedUser.displayName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Joined Date</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedUser.joinedDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Activity Stats */}
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">Activity Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{getUserLabEntries(selectedUser.id).length}</p>
                      <p className="text-sm text-gray-600 mt-1">Lab Entries</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{getUserLoginHistory(selectedUser.id).length}</p>
                      <p className="text-sm text-gray-600 mt-1">Total Logins</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-lg font-bold text-purple-600">
                        {getUserLoginHistory(selectedUser.id)[0] ? 
                          getUserLoginHistory(selectedUser.id)[0].timestamp.toLocaleDateString() : 'Never'
                        }
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Last Login</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;