import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Map, 
  List, 
  User, 
  LogOut, 
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import NotificationBell from '../notifications/NotificationBell';
import MapView from '../map/MapView';
import IssueList from '../issues/IssueList';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('overview'); // overview, map, list
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0
  });
  const [categoryStats, setCategoryStats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchIssues();
    if (parsedUser.role === 'admin' || parsedUser.role === 'staff') {
      fetchStats();
    }
  }, [navigate]);

  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const params = new URLSearchParams();
      
      // If citizen, only show their issues
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role === 'citizen') {
          params.append('user_id', parsedUser.id);
        }
      }

      const response = await axios.get(`http://localhost:5000/api/issues?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const issuesData = response.data;
      setIssues(issuesData);

      // Calculate basic stats
      const basicStats = {
        total: issuesData.length,
        pending: issuesData.filter(issue => issue.status === 'pending').length,
        inProgress: issuesData.filter(issue => issue.status === 'in_progress').length,
        resolved: issuesData.filter(issue => issue.status === 'resolved').length,
        urgent: issuesData.filter(issue => issue.priority === 'urgent').length,
        high: issuesData.filter(issue => issue.priority === 'high').length,
        medium: issuesData.filter(issue => issue.priority === 'medium').length,
        low: issuesData.filter(issue => issue.priority === 'low').length,
      };
      setStats(basicStats);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/issues/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data.overall) {
        setStats({
          total: parseInt(response.data.overall.total),
          pending: parseInt(response.data.overall.pending),
          inProgress: parseInt(response.data.overall.in_progress),
          resolved: parseInt(response.data.overall.resolved),
          urgent: parseInt(response.data.overall.urgent),
          high: parseInt(response.data.overall.high),
          medium: parseInt(response.data.overall.medium),
          low: parseInt(response.data.overall.low),
        });
      }

      if (response.data.byCategory) {
        setCategoryStats(response.data.byCategory);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      roads: '🛣️',
      streetlights: '💡',
      waste: '🗑️',
      water: '💧',
      sewage: '🚰',
      parks: '🌳',
      traffic: '🚦',
      safety: '🛡️',
      other: '📋',
    };
    return icons[category] || '📋';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">CivicConnect</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationBell />
              
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || 'User'}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'User'}!
          </h2>
          <p className="text-gray-600 mt-2">
            Manage and track community issues in your area.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Issues</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link
            to="/report"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Report New Issue
          </Link>
          
          <button
            onClick={() => setViewMode('map')}
            className={`inline-flex items-center px-6 py-3 rounded-lg transition-colors duration-200 ${
              viewMode === 'map'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Map className="h-5 w-5 mr-2" />
            View Map
          </button>
          
          <button
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center px-6 py-3 rounded-lg transition-colors duration-200 ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <List className="h-5 w-5 mr-2" />
            All Issues
          </button>

          <button
            onClick={() => setViewMode('overview')}
            className={`inline-flex items-center px-6 py-3 rounded-lg transition-colors duration-200 ${
              viewMode === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            Overview
          </button>
        </div>

        {/* View Mode Content */}
        {viewMode === 'map' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Issues Map</h3>
            <div className="h-[600px]">
              <MapView issues={issues} />
            </div>
          </div>
        )}

        {viewMode === 'list' && (
          <IssueList userRole={user?.role} />
        )}

        {viewMode === 'overview' && (
          <>
            {/* Analytics Charts (Admin/Staff only) */}
            {(user?.role === 'admin' || user?.role === 'staff') && categoryStats.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues by Category</h3>
                  <Bar
                    data={{
                      labels: categoryStats.map(cat => cat.category),
                      datasets: [
                        {
                          label: 'Total',
                          data: categoryStats.map(cat => parseInt(cat.count)),
                          backgroundColor: 'rgba(59, 130, 246, 0.5)',
                          borderColor: 'rgba(59, 130, 246, 1)',
                          borderWidth: 1,
                        },
                        {
                          label: 'Pending',
                          data: categoryStats.map(cat => parseInt(cat.pending)),
                          backgroundColor: 'rgba(251, 191, 36, 0.5)',
                          borderColor: 'rgba(251, 191, 36, 1)',
                          borderWidth: 1,
                        },
                        {
                          label: 'Resolved',
                          data: categoryStats.map(cat => parseInt(cat.resolved)),
                          backgroundColor: 'rgba(16, 185, 129, 0.5)',
                          borderColor: 'rgba(16, 185, 129, 1)',
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: false,
                        },
                      },
                    }}
                  />
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
                  <Doughnut
                    data={{
                      labels: ['Urgent', 'High', 'Medium', 'Low'],
                      datasets: [
                        {
                          data: [
                            stats.urgent,
                            stats.high,
                            stats.medium,
                            stats.low,
                          ],
                          backgroundColor: [
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(249, 115, 22, 0.8)',
                            'rgba(251, 191, 36, 0.8)',
                            'rgba(156, 163, 175, 0.8)',
                          ],
                          borderColor: [
                            'rgba(239, 68, 68, 1)',
                            'rgba(249, 115, 22, 1)',
                            'rgba(251, 191, 36, 1)',
                            'rgba(156, 163, 175, 1)',
                          ],
                          borderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* Recent Issues */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Issues</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {issues.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No issues yet</h3>
                    <p className="text-gray-600 mb-4">Start by reporting your first community issue.</p>
                    <Link
                      to="/report"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Report Issue
                    </Link>
                  </div>
                ) : (
                  issues.slice(0, 10).map((issue) => (
                    <div
                      key={issue.id}
                      className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/issues/${issue.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getCategoryIcon(issue.category)}</span>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{issue.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-1">{issue.description}</p>
                            <p className="text-xs text-gray-500">
                              Reported by {issue.reporter} • {new Date(issue.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                            {getStatusIcon(issue.status)}
                            <span className="ml-1 capitalize">{issue.status.replace('_', ' ')}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

