import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  MapPin,
  User,
  MessageSquare,
  Edit,
  Trash2,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import MapView from '../map/MapView';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { API_BASE_URL } from '../../config';


const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [staffUsers, setStaffUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchIssue();
    if (user?.role === 'admin' || user?.role === 'staff') {
      fetchStaffUsers();
    }
  }, [id]);

  const fetchIssue = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/issues/${id}`);
      setIssue(response.data);
    } catch (error) {
      console.error('Error fetching issue:', error);
      toast.error('Failed to load issue');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/users/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffUsers(response.data);
    } catch (error) {
      console.error('Error fetching staff users:', error);
    }
  };

  const handleUpdate = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      const response = await axios.put(
        `${API_BASE_URL}/issues/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setIssue(response.data);
      setIsEditing(false);
      toast.success('Issue updated successfully');
    } catch (error) {
      console.error('Error updating issue:', error);
      toast.error('Failed to update issue');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this issue?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Issue deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting issue:', error);
      toast.error('Failed to delete issue');
    }
  };

  const handleAddComment = async (values, { resetForm }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/issues/${id}/comments`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Comment added successfully');
      resetForm();
      setShowCommentForm(false);
      fetchIssue();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'in_progress':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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

  if (!issue) {
    return null;
  }

  const canEdit = user?.role === 'admin' || user?.role === 'staff';
  const canDelete = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-4xl">{getCategoryIcon(issue.category)}</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{issue.title}</h1>
                <p className="text-gray-600 mt-1">
                  Issue #{issue.id} • {new Date(issue.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {canEdit && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Status</h2>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    issue.status
                  )}`}
                >
                  {getStatusIcon(issue.status)}
                  <span className="ml-2 capitalize">{issue.status.replace('_', ' ')}</span>
                </span>
              </div>

              {isEditing && canEdit ? (
                <Formik
                  initialValues={{
                    status: issue.status,
                    priority: issue.priority || 'medium',
                    assigned_to: issue.assigned_to || '',
                    assigned_department: issue.assigned_department || '',
                    resolution_notes: issue.resolution_notes || '',
                  }}
                  onSubmit={handleUpdate}
                >
                  {({ isSubmitting }) => (
                    <Form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <Field
                          as="select"
                          name="status"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </Field>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority
                        </label>
                        <Field
                          as="select"
                          name="priority"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </Field>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assign To
                        </label>
                        <Field
                          as="select"
                          name="assigned_to"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Unassigned</option>
                          {staffUsers.map((staff) => (
                            <option key={staff.id} value={staff.id}>
                              {staff.name} ({staff.role})
                            </option>
                          ))}
                        </Field>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Resolution Notes
                        </label>
                        <Field
                          as="textarea"
                          name="resolution_notes"
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add resolution notes..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        Update Issue
                      </button>
                    </Form>
                  )}
                </Formik>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <span className="font-medium capitalize">{issue.priority || 'medium'}</span>
                  </div>
                  {issue.assigned_to_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Assigned to:</span>
                      <span className="font-medium">{issue.assigned_to_name}</span>
                    </div>
                  )}
                  {issue.assigned_department && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium">{issue.assigned_department}</span>
                    </div>
                  )}
                  {issue.resolution_notes && (
                    <div>
                      <span className="text-gray-600 block mb-2">Resolution Notes:</span>
                      <p className="text-gray-900">{issue.resolution_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
            </div>

            {/* Photos */}
            {(issue.photo_url || issue.resolution_photo_url) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {issue.photo_url && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Report Photo</p>
                      <img
                        src={`${API_BASE_URL}${issue.photo_url}`}
                        alt="Issue"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  {issue.resolution_photo_url && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Resolution Photo</p>
                      <img
                        src={`${API_BASE_URL}${issue.resolution_photo_url}`}
                        alt="Resolution"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
                {user && (
                  <button
                    onClick={() => setShowCommentForm(!showCommentForm)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Comment
                  </button>
                )}
              </div>

              {showCommentForm && user && (
                <Formik
                  initialValues={{ comment: '', is_internal: false }}
                  validationSchema={Yup.object({
                    comment: Yup.string().required('Comment is required'),
                  })}
                  onSubmit={handleAddComment}
                >
                  {({ isSubmitting }) => (
                    <Form className="mb-6">
                      <Field
                        as="textarea"
                        name="comment"
                        rows={3}
                        placeholder="Write a comment..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                      />
                      <ErrorMessage name="comment" component="div" className="text-red-600 text-sm mb-2" />
                      {canEdit && (
                        <label className="flex items-center mb-2">
                          <Field type="checkbox" name="is_internal" className="mr-2" />
                          <span className="text-sm text-gray-600">Internal note (only visible to staff)</span>
                        </label>
                      )}
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowCommentForm(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Post Comment
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}

              <div className="space-y-4">
                {issue.comments && issue.comments.length > 0 ? (
                  issue.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-lg ${comment.is_internal ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {comment.commenter_name}
                          </span>
                          {comment.is_internal && (
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                              Internal
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No comments yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location
              </h2>
              <div className="h-64 mb-4">
                <MapView issues={[issue]} />
              </div>
              <div className="text-sm text-gray-600">
                <p>Latitude: {issue.latitude}</p>
                <p>Longitude: {issue.longitude}</p>
              </div>
            </div>

            {/* Reporter Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reporter</h2>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{issue.reporter}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Reported on {new Date(issue.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
