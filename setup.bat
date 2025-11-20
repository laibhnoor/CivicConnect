@echo off
echo 🌍 Setting up CivicConnect - Community Feedback & Issue Tracker
echo ==============================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL is not installed. Please install PostgreSQL first.
    pause
    exit /b 1
)

echo ✅ Node.js and PostgreSQL are installed

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd server
call npm install
cd ..

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd client
call npm install
cd ..

REM Create uploads directory
echo 📁 Creating uploads directory...
if not exist "server\uploads\issues" mkdir "server\uploads\issues"

REM Create .env file for server
echo ⚙️ Creating server .env file...
(
echo # Database Configuration
echo DB_HOST=localhost
echo DB_PORT=5432
echo DB_NAME=civicconnect
echo DB_USER=postgres
echo DB_PASSWORD=password
echo.
echo # Server Configuration
echo PORT=5000
echo CLIENT_URL=http://localhost:5173
echo.
echo # JWT Secret
echo JWT_SECRET=civicconnect_super_secret_jwt_key_2024
echo.
echo # Email Configuration ^(optional^)
echo EMAIL_HOST=smtp.gmail.com
echo EMAIL_PORT=587
echo EMAIL_USER=your_email@gmail.com
echo EMAIL_PASS=your_app_password
echo.
echo # SMS Configuration ^(optional^)
echo TWILIO_ACCOUNT_SID=your_twilio_account_sid
echo TWILIO_AUTH_TOKEN=your_twilio_auth_token
echo TWILIO_PHONE_NUMBER=your_twilio_phone_number
echo.
echo # AI Image Classifier ^(optional^)
echo ENABLE_AI_CLASSIFIER=false
) > server\.env

echo ✅ Setup complete!
echo.
echo 🚀 Next steps:
echo 1. Create PostgreSQL database: createdb civicconnect
echo 2. Run database schema: psql civicconnect ^< server\schema.sql
echo 3. Start backend: cd server ^&^& npm run dev
echo 4. Start frontend: cd client ^&^& npm run dev
echo.
echo 🌐 Access the application at:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo.
echo 🔐 Default credentials:
echo    Admin: admin@civicconnect.gov / admin123
echo    Staff: staff@civicconnect.gov / staff123
echo.
pause

