# 🚀 Quick Start Commands

## Initial Setup (One-time)

```bash
# 1. Run setup script
setup.bat

# 2. Create database and run schema
createdb civicconnect
psql civicconnect < server/schema.sql
```

## Run Application

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## Access

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

## Login Credentials

**Admin**: `admin@civicconnect.gov` / `admin123`  
**Staff**: `staff@civicconnect.gov` / `staff123`

---

That's it! 🎉



