#!/bin/bash

echo "🌍 Setting up CivicConnect - Community Feedback & Issue Tracker"
echo "=============================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✅ Node.js and PostgreSQL are installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p server/uploads/issues

# Create .env file for server
echo "⚙️ Creating server .env file..."
cat > server/.env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=civicconnect
DB_USER=postgres
DB_PASSWORD=password

# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:5173

# JWT Secret
JWT_SECRET=civicconnect_super_secret_jwt_key_2024

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS Configuration (optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
EOF

echo "✅ Setup complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Create PostgreSQL database: createdb civicconnect"
echo "2. Run database schema: psql civicconnect < server/schema.sql"
echo "3. Start backend: cd server && npm run dev"
echo "4. Start frontend: cd client && npm run dev"
echo ""
echo "🌐 Access the application at:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo ""
echo "🔐 Default credentials:"
echo "   Admin: admin@civicconnect.gov / admin123"
echo "   Staff: staff@civicconnect.gov / staff123"

