import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  X,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { API_BASE_URL } from '../../config';


const IssueList = ({ userRole = 'citizen' }) => {
  const [issues, setIssues] = useState([]);
  const [allIssues, setAllIssues] = useState([]); // Store all fetched issues for client-side search
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Fetch issues when status, category, or priority changes
  useEffect(() => {
    fetchIssues();
  }, [filters.status, filters.category, filters.priority]);

  // Apply search filter client-side when search term changes
  useEffect(() => {
    if (filters.search && filters.search.trim() !== '') {
      const searchLower = filters.search.toLowerCase().trim();
      const filtered = allIssues.filter(
        issue =>
          (issue.title && issue.title.toLowerCase().includes(searchLower)) ||
          (issue.description && issue.description.toLowerCase().includes(searchLower)) ||
          (issue.category && issue.category.toLowerCase().includes(searchLower)) ||
          (issue.reporter && issue.reporter.toLowerCase().includes(searchLower))
      );
      setIssues(filtered);
    } else {
      // If search is empty, show all filtered issues
      setIssues(allIssues);
    }
  }, [filters.search, allIssues]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);
      
      // If citizen, only show their issues
      if (userRole === 'citizen') {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) params.append('user_id', user.id);
      }

      const response = await axios.get(
      `${API_BASE_URL}/issues?${params.toString()}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

      // Store all fetched issues for client-side search
      setAllIssues(response.data);
      
      // Apply search filter if there's a search term
      if (filters.search && filters.search.trim() !== '') {
        const searchLower = filters.search.toLowerCase().trim();
        const filteredIssues = response.data.filter(
          issue =>
            (issue.title && issue.title.toLowerCase().includes(searchLower)) ||
            (issue.description && issue.description.toLowerCase().includes(searchLower)) ||
            (issue.category && issue.category.toLowerCase().includes(searchLower)) ||
            (issue.reporter && issue.reporter.toLowerCase().includes(searchLower))
        );
        setIssues(filteredIssues);
      } else {
        setIssues(response.data);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) {
      return;
    }

   try {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_BASE_URL}/issues/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success('Issue deleted successfully');
    fetchIssues();
  } catch (error) {
    console.error('Error deleting issue:', error);
    toast.error('Failed to delete issue');
  }
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
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

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'roads', label: 'Roads' },
    { value: 'streetlights', label: 'Streetlights' },
    { value: 'waste', label: 'Waste' },
    { value: 'water', label: 'Water' },
    { value: 'sewage', label: 'Sewage' },
    { value: 'parks', label: 'Parks' },
    { value: 'traffic', label: 'Traffic' },
    { value: 'safety', label: 'Safety' },
    { value: 'other', label: 'Other' },
  ];

  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  const priorities = [
    { value: '', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search issues..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 bg-white font-medium"
          >
            <Filter className="h-5 w-5 mr-2 text-gray-600" />
            <span className="text-gray-700">Filters</span>
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                onClick={() => setFilters({ status: '', category: '', priority: '', search: '' })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Issues List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {issues.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/issues/${issue.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <span className="text-3xl">{getCategoryIcon(issue.category)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {issue.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            issue.status
                          )}`}
                        >
                          {getStatusIcon(issue.status)}
                          <span className="ml-1 capitalize">
                            {issue.status.replace('_', ' ')}
                          </span>
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                            issue.priority
                          )}`}
                        >
                          {issue.priority || 'medium'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2 line-clamp-2">{issue.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Reported by {issue.reporter}</span>
                        <span>•</span>
                        <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                        {issue.assigned_to_name && (
                          <>
                            <span>•</span>
                            <span>Assigned to {issue.assigned_to_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {(userRole === 'admin' || userRole === 'staff') && (
                    <div
                      className="flex items-center space-x-2 ml-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => navigate(`/issues/${issue.id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {userRole === 'admin' && (
                        <button
                          onClick={() => handleDelete(issue.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueList;

