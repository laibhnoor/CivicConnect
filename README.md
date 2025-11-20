# 🌍 CivicConnect - Community Feedback & Issue Tracker

A modern, full-featured platform for citizens to report local issues and for municipalities to manage and resolve them efficiently.

## ✨ Features

### For Citizens 👥
- ✅ **Easy Issue Reporting**: Submit issues with photos, GPS location, and detailed descriptions
- ✅ **Real-time Tracking**: Track issue progress from submission to resolution
- ✅ **Interactive Map View**: View all reported issues on an interactive Leaflet map
- ✅ **Email/SMS Notifications**: Get instant updates when issue status changes
- ✅ **Issue History**: View all your reported issues in one place
- ✅ **Mobile-friendly**: Fully responsive design for mobile devices

### For City Staff/Admins 🏛️
- ✅ **Comprehensive Dashboard**: Analytics with charts and statistics
- ✅ **Issue Management**: Assign, update priority, add resolution notes, and mark as resolved
- ✅ **Role-based Access Control**: Different permissions for staff and admins
- ✅ **Issue Assignment**: Assign issues to specific staff members or departments
- ✅ **Comments System**: Add public or internal notes to issues
- ✅ **Analytics Dashboard**: Bar charts and doughnut charts for data insights
- ✅ **Filtering & Search**: Advanced filtering by status, category, priority
- ✅ **File Management**: Handle photo uploads and resolution photos

### Advanced Features 🚀
- ✅ **Email Notifications**: Automated email alerts using Nodemailer
- ✅ **SMS Notifications**: Twilio integration for SMS updates (optional)
- ✅ **AI Image Classifier**: Auto-categorize issues from photos (optional, extensible)
- ✅ **Interactive Maps**: Leaflet.js integration with custom markers
- ✅ **Real-time Notifications**: Notification bell with unread count
- ✅ **PostGIS Support**: Geographic data handling with PostgreSQL PostGIS extension

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js (RESTful API)
- **PostgreSQL** with PostGIS for geographic data
- **JWT** authentication with role-based access control
- **Multer** for file uploads (images)
- **Nodemailer** for email notifications
- **Twilio** for SMS notifications (optional)
- **bcrypt** for password hashing

### Frontend
- **React.js** with Vite
- **Tailwind CSS** for modern, responsive styling
- **React Router** for navigation
- **Formik + Yup** for form validation
- **Leaflet.js** + **React-Leaflet** for interactive maps
- **Chart.js** + **React-Chartjs-2** for analytics
- **Axios** for API calls
- **React Hot Toast** for user notifications
- **Lucide React** for icons

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher) with PostGIS extension
- npm or yarn

## 🚀 Quick Start

### Windows Setup

Run the setup script:
```bash
setup.bat
```

### Manual Setup

#### 1. Database Setup
```bash
# Create PostgreSQL database
createdb civicconnect

# Run the schema (includes PostGIS extension)
psql civicconnect < server/schema.sql
```

#### 2. Backend Setup
```bash
cd server
npm install

# Create .env file (or use setup.bat)
# Configure your database credentials and other settings
# See server/.env.example for all options

# Start the server
npm run dev
```

#### 3. Frontend Setup
```bash
cd client
npm install

# Start the development server
npm run dev
```

#### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🔐 Default Credentials

After running the schema, these users are created:

### Admin User
- Email: `admin@civicconnect.gov`
- Password: `admin123`
- Role: Admin (full access)

### Staff User
- Email: `staff@civicconnect.gov`
- Password: `staff123`
- Role: Staff (can manage issues)

## 📁 Project Structure

```
CivicConnect/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/            # Login, Register, ProtectedRoute
│   │   │   ├── dashboard/       # Main dashboard with analytics
│   │   │   ├── issues/          # IssueForm, IssueList, IssueDetail
│   │   │   ├── map/             # MapView component
│   │   │   └── notifications/   # NotificationBell component
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                       # Express backend
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── issueController.js   # Issue CRUD operations
│   │   ├── notificationController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT auth + role-based access
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── issueRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   ├── notificationService.js  # Email/SMS notifications
│   │   └── imageClassifier.js      # AI image classification (optional)
│   ├── db.js                      # PostgreSQL connection
│   ├── schema.sql                 # Database schema
│   └── index.js                   # Express app setup
└── README.md
```

## 🗄️ Database Schema

The application uses PostgreSQL with PostGIS extension. Main tables:

- **users**: User accounts with role-based access (citizen, staff, admin)
- **issues**: Reported issues with location (lat/lng), photos, status, priority
- **issue_comments**: Comments and updates on issues (public/internal)
- **notifications**: User notifications for status updates, assignments, etc.
- **departments**: City departments (for organization)
- **issue_categories**: Predefined issue categories with icons and colors

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login (returns JWT token)

### Issues
- `GET /api/issues` - Get all issues (with filters: status, category, priority, assigned_to, user_id)
- `GET /api/issues/:id` - Get single issue with comments
- `POST /api/issues` - Create new issue (with photo upload, multipart/form-data)
- `PUT /api/issues/:id` - Update issue (status, priority, assignment, resolution notes, resolution photo)
- `DELETE /api/issues/:id` - Delete issue (admin only)
- `GET /api/issues/stats` - Get analytics statistics (staff/admin only)
- `POST /api/issues/:id/comments` - Add comment to issue

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread notification count
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

### Users
- `GET /api/users/me` - Get current user profile
- `GET /api/users` - Get all users (staff/admin only)
- `GET /api/users/staff` - Get staff users (for assignment dropdowns)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile

## 🎨 UI Components

### Authentication
- **Login.jsx**: Beautiful login form with validation
- **Register.jsx**: Registration with role selection
- **ProtectedRoute.jsx**: Route protection with JWT

### Dashboard
- **Dashboard.jsx**: Main dashboard with:
  - Statistics cards (total, pending, in progress, resolved)
  - Analytics charts (bar chart for categories, doughnut for priorities)
  - View modes: Overview, Map, List
  - Recent issues list

### Issue Management
- **IssueForm.jsx**: Comprehensive issue reporting form with:
  - GPS location detection
  - Photo upload with preview
  - Category selection
  - Priority selection
- **IssueList.jsx**: Filterable issue list with search
- **IssueDetail.jsx**: Detailed issue view with:
  - Status management
  - Assignment controls
  - Comments system
  - Resolution notes and photos
  - Embedded map view

### Maps
- **MapView.jsx**: Interactive Leaflet map with:
  - Custom markers by status/category
  - Popups with issue details
  - Auto-fit bounds

### Notifications
- **NotificationBell.jsx**: Notification dropdown with:
  - Unread count badge
  - Real-time updates
  - Mark as read functionality

## ⚙️ Configuration

### Environment Variables (server/.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=civicconnect
DB_USER=postgres
DB_PASSWORD=your_password

# Server
PORT=5000
CLIENT_URL=http://localhost:5173

# JWT
JWT_SECRET=your_secret_key

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS (optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# AI Classifier (optional)
ENABLE_AI_CLASSIFIER=false
```

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database with PostGIS extension
2. Configure environment variables
3. Run database schema: `psql civicconnect < server/schema.sql`
4. Deploy to your preferred platform (Heroku, AWS, DigitalOcean, etc.)

### Frontend Deployment
1. Build the React app: `cd client && npm run build`
2. Deploy `client/dist` to static hosting (Netlify, Vercel, AWS S3, etc.)
3. Update API endpoints in production (create `client/src/config.js`)

## 🔮 Optional Features

### AI Image Classifier
The application includes a placeholder for AI image classification. To enable:

1. Set `ENABLE_AI_CLASSIFIER=true` in `.env`
2. Implement your ML model in `server/services/imageClassifier.js`
3. Options:
   - TensorFlow.js with a trained model
   - OpenAI Vision API
   - Google Cloud Vision API
   - AWS Rekognition

### SMS Notifications
To enable SMS notifications via Twilio:

1. Sign up for Twilio account
2. Get Account SID, Auth Token, and Phone Number
3. Add to `.env` file
4. Install Twilio: `npm install twilio` (optional dependency)

## 🧪 Testing

### Manual Testing
1. Register a new citizen account
2. Report an issue with photo and location
3. Login as staff/admin
4. View dashboard analytics
5. Assign issue to staff member
6. Update issue status
7. Add resolution notes and photo
8. Check notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@civicconnect.gov or create an issue in the repository.

## 🎯 Roadmap

- [ ] Real-time updates with WebSockets
- [ ] Mobile app (React Native)
- [ ] Advanced analytics with heatmaps
- [ ] Multi-language support
- [ ] Issue voting/prioritization by citizens
- [ ] Department-specific dashboards
- [ ] Export reports (PDF, CSV)
- [ ] Integration with external ticketing systems

---

**Built with ❤️ for better communities**
