import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { AlertCircle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from './config';


// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons based on status
const createCustomIcon = (status, category) => {
  const colors = {
    pending: '#fbbf24',
    in_progress: '#3b82f6',
    resolved: '#10b981',
    closed: '#6b7280',
  };

  const categoryIcons = {
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

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${colors[status] || '#6b7280'};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-size: 20px;
      ">
        ${categoryIcons[category] || '📋'}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Component to handle map bounds
function MapBounds({ issues }) {
  const map = useMap();
  
  useEffect(() => {
    if (issues.length > 0) {
      const bounds = L.latLngBounds(
        issues.map(issue => [issue.latitude, issue.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [issues, map]);

  return null;
}

const MapView = ({ issues: propIssues, filters = {} }) => {
  const [issues, setIssues] = useState(propIssues || []);
  const [loading, setLoading] = useState(!propIssues);
  const navigate = useNavigate();

  useEffect(() => {
    if (!propIssues) {
      fetchIssues();
    } else {
      setIssues(propIssues);
    }
  }, [propIssues, filters]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);

     const response = await axios.get(
      `${API_BASE_URL}/issues?${params.toString()}`
    );
      setIssues(response.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No issues found on the map</p>
        </div>
      </div>
    );
  }

  // Default center (first issue or a default location)
  const center = issues.length > 0
    ? [issues[0].latitude, issues[0].longitude]
    : [40.7128, -74.0060]; // Default to NYC

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBounds issues={issues} />

        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.latitude, issue.longitude]}
            icon={createCustomIcon(issue.status, issue.category)}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{issue.title}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                    {getStatusIcon(issue.status)}
                    <span className="ml-1 capitalize">{issue.status.replace('_', ' ')}</span>
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{issue.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{issue.category}</span>
                  <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => navigate(`/issues/${issue.id}`)}
                  className="mt-2 w-full text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;

