-- CivicConnect Database Schema
-- Community Feedback & Issue Tracker for Local Governments

-- Enable PostGIS extension for geographic data
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users table with role-based access
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'citizen' CHECK (role IN ('citizen', 'staff', 'admin')),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Issues table with comprehensive tracking
CREATE TABLE issues (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'roads', 'streetlights', 'waste', 'water', 'sewage', 
        'parks', 'traffic', 'safety', 'other'
    )),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'resolved', 'closed', 'rejected'
    )),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    photo_url TEXT,
    assigned_to INT REFERENCES users(id),
    assigned_department VARCHAR(50),
    resolution_notes TEXT,
    resolution_photo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Comments/Updates table for issue tracking
CREATE TABLE issue_comments (
    id SERIAL PRIMARY KEY,
    issue_id INT REFERENCES issues(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- Internal staff notes vs public comments
    created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table for tracking user notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    issue_id INT REFERENCES issues(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'status_update', 'assignment', 'comment', etc.
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Departments table for organizing staff
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    head_user_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Issue categories with descriptions
CREATE TABLE issue_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#007bff'
);

-- Insert default categories
INSERT INTO issue_categories (name, description, icon, color) VALUES
('roads', 'Roads, potholes, street repairs', '🛣️', '#ff6b35'),
('streetlights', 'Street lighting issues', '💡', '#ffd93d'),
('waste', 'Garbage collection, recycling', '🗑️', '#6bcf7f'),
('water', 'Water leaks, supply issues', '💧', '#4dabf7'),
('sewage', 'Sewer problems, drainage', '🚰', '#8b5cf6'),
('parks', 'Parks, playgrounds, green spaces', '🌳', '#51cf66'),
('traffic', 'Traffic signals, signs, safety', '🚦', '#ffa8a8'),
('safety', 'Public safety concerns', '🛡️', '#ff8787'),
('other', 'Other municipal issues', '📋', '#868e96');

-- Create indexes for better performance
CREATE INDEX idx_issues_location ON issues USING GIST (ST_Point(longitude, latitude));
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_category ON issues(category);
CREATE INDEX idx_issues_created_at ON issues(created_at);
CREATE INDEX idx_issues_user_id ON issues(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create notifications
CREATE OR REPLACE FUNCTION create_issue_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify the reporter when status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO notifications (user_id, issue_id, type, title, message)
        VALUES (
            NEW.user_id,
            NEW.id,
            'status_update',
            'Issue Status Updated',
            'Your issue "' || NEW.title || '" status has been updated to ' || NEW.status
        );
    END IF;
    
    -- Notify assigned staff when assigned
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to AND NEW.assigned_to IS NOT NULL THEN
        INSERT INTO notifications (user_id, issue_id, type, title, message)
        VALUES (
            NEW.assigned_to,
            NEW.id,
            'assignment',
            'New Issue Assignment',
            'You have been assigned to issue: "' || NEW.title || '"'
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply notification trigger
CREATE TRIGGER issue_notification_trigger
    AFTER UPDATE ON issues
    FOR EACH ROW EXECUTE FUNCTION create_issue_notification();

-- Insert sample admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@civicconnect.gov', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert sample staff user (password: staff123)
INSERT INTO users (name, email, password, role) VALUES
('Staff User', 'staff@civicconnect.gov', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff');

