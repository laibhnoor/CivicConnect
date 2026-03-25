import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, MapPin, Users, Zap } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">CivicConnect</h1>
            <div className="space-x-4">
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm bg-gray-900 text-white px-4 py-2 hover:bg-gray-800"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Report Issues. Drive Change.
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            CivicConnect gives you a voice. Report potholes, broken streetlights, and community issues directly to local authorities. Track progress in real-time and see your community improve.
          </p>
          <Link
            to="/register"
            className="inline-block bg-gray-900 text-white px-8 py-3 text-lg hover:bg-gray-800 transition-colors"
          >
            Start Reporting
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-12 w-12 text-gray-900" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Report Issues</h4>
              <p className="text-gray-600">
                Spot a problem in your community? Take a photo and report it instantly through the app.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <MapPin className="h-12 w-12 text-gray-900" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Location Tracking</h4>
              <p className="text-gray-600">
                Issues are pinned on an interactive map. See what's being reported near you.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Zap className="h-12 w-12 text-gray-900" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Updates</h4>
              <p className="text-gray-600">
                Track the status of issues from pending to resolved. Watch your city improve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Report What Matters</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded p-6 text-center">
            <p className="text-3xl mb-2">🛣️</p>
            <p className="font-semibold text-gray-900">Roads</p>
          </div>
          <div className="border border-gray-200 rounded p-6 text-center">
            <p className="text-3xl mb-2">💡</p>
            <p className="font-semibold text-gray-900">Street Lights</p>
          </div>
          <div className="border border-gray-200 rounded p-6 text-center">
            <p className="text-3xl mb-2">🗑️</p>
            <p className="font-semibold text-gray-900">Waste</p>
          </div>
          <div className="border border-gray-200 rounded p-6 text-center">
            <p className="text-3xl mb-2">💧</p>
            <p className="font-semibold text-gray-900">Water</p>
          </div>
          <div className="border border-gray-200 rounded p-6 text-center">
            <p className="text-3xl mb-2">🚰</p>
            <p className="font-semibold text-gray-900">Sewage</p>
          </div>
          <div className="border border-gray-200 rounded p-6 text-center">
            <p className="text-3xl mb-2">🌳</p>
            <p className="font-semibold text-gray-900">Parks</p>
          </div>
          <div className="border border-gray-200 rounded p-6 text-center">
            <p className="text-3xl mb-2">🚦</p>
            <p className="font-semibold text-gray-900">Traffic</p>
          </div>
          <div className="border border-gray-200 rounded p-6 text-center">
            <p className="text-3xl mb-2">🛡️</p>
            <p className="font-semibold text-gray-900">Safety</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-6">Be Part of the Change</h3>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of citizens making their communities better. One report at a time.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="inline-block bg-white text-gray-900 px-8 py-3 font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="inline-block border-2 border-white text-white px-8 py-3 hover:bg-white hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2026 CivicConnect. Making communities better, together.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
