import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { 
  MapPin, 
  Camera, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  X,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

import { API_BASE_URL } from './config';


const IssueForm = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const fileInputRef = useRef(null);

  const validationSchema = Yup.object({
    title: Yup.string()
      .min(5, 'Title must be at least 5 characters')
      .max(200, 'Title must be less than 200 characters')
      .required('Title is required'),
    description: Yup.string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description must be less than 1000 characters')
      .required('Description is required'),
    category: Yup.string()
      .oneOf(['roads', 'streetlights', 'waste', 'water', 'sewage', 'parks', 'traffic', 'safety', 'other'])
      .required('Please select a category'),
    latitude: Yup.number()
      .required('Location is required')
      .min(-90, 'Invalid latitude')
      .max(90, 'Invalid latitude'),
    longitude: Yup.number()
      .required('Location is required')
      .min(-180, 'Invalid longitude')
      .max(180, 'Invalid longitude'),
  });

  const categories = [
    { value: 'roads', label: 'Roads & Potholes', icon: '🛣️', color: '#ff6b35' },
    { value: 'streetlights', label: 'Street Lighting', icon: '💡', color: '#ffd93d' },
    { value: 'waste', label: 'Waste Management', icon: '🗑️', color: '#6bcf7f' },
    { value: 'water', label: 'Water Issues', icon: '💧', color: '#4dabf7' },
    { value: 'sewage', label: 'Sewer & Drainage', icon: '🚰', color: '#8b5cf6' },
    { value: 'parks', label: 'Parks & Recreation', icon: '🌳', color: '#51cf66' },
    { value: 'traffic', label: 'Traffic & Safety', icon: '🚦', color: '#ffa8a8' },
    { value: 'safety', label: 'Public Safety', icon: '🛡️', color: '#ff8787' },
    { value: 'other', label: 'Other Issues', icon: '📋', color: '#868e96' },
  ];

  const getCurrentLocation = (setFieldValue) => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { latitude, longitude };
        setCurrentLocation(location);
        // Update form fields immediately
        setFieldValue('latitude', latitude);
        setFieldValue('longitude', longitude);
        toast.success('Location detected successfully!');
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Unable to get your location. Please enter it manually.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('category', values.category);
      formData.append('latitude', values.latitude);
      formData.append('longitude', values.longitude);
      
      if (selectedFile) {
        formData.append('photo', selectedFile);
      }

     const token = localStorage.getItem('token');
const response = await axios.post(
  `${API_BASE_URL}/issues`,
  formData,
  {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  }
);


      toast.success('Issue reported successfully! Thank you for your contribution.');
      
      // Clean up
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      resetForm();
      setSelectedFile(null);
      setPreviewUrl(null);
      setCurrentLocation(null);
      
      if (onSuccess) {
        onSuccess(response.data);
      } else {
        // Navigate to dashboard if no onSuccess callback
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
      const message = error.response?.data?.message || 'Failed to submit issue. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Report an Issue</h2>
        <p className="text-gray-600">Help improve your community by reporting issues you encounter.</p>
      </div>

      <Formik
        initialValues={{
          title: '',
          description: '',
          category: '',
          latitude: '',
          longitude: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={false}
      >
        {({ setFieldValue, values }) => (
          <Form className="space-y-6">
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Issue Title *
              </label>
              <Field
                id="title"
                name="title"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                placeholder="Brief description of the issue"
              />
              <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </label>
              <Field
                as="textarea"
                id="description"
                name="description"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white resize-y"
                placeholder="Provide more details about the issue..."
              />
              <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Category *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <label
                    key={category.value}
                    className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      values.category === category.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Field
                      type="radio"
                      name="category"
                      value={category.value}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{category.label}</span>
                    </div>
                    {values.category === category.value && (
                      <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
                    )}
                  </label>
                ))}
              </div>
              <ErrorMessage name="category" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            {/* Location Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => getCurrentLocation(setFieldValue)}
                  disabled={isGettingLocation}
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50"
                >
                  {isGettingLocation ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
                  ) : (
                    <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                  )}
                  {isGettingLocation ? 'Getting your location...' : 'Use Current Location'}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="latitude" className="block text-xs text-gray-600 mb-1">
                      Latitude
                    </label>
                    <Field
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                      placeholder="e.g., 40.7128"
                    />
                  </div>
                  <div>
                    <label htmlFor="longitude" className="block text-xs text-gray-600 mb-1">
                      Longitude
                    </label>
                    <Field
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                      placeholder="e.g., -74.0060"
                    />
                  </div>
                </div>
                <ErrorMessage name="latitude" component="div" className="text-sm text-red-600" />
                <ErrorMessage name="longitude" component="div" className="text-sm text-red-600" />
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo (Optional)
              </label>
              <div className="space-y-3">
                {!previewUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                  >
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload a photo</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Submit Issue
                  </>
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default IssueForm;

