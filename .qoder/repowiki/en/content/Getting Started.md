# Getting Started

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [QUICKSTART.md](file://QUICKSTART.md)
- [backend/package.json](file://backend/package.json)
- [frontend/package.json](file://frontend/package.json)
- [backend/server.js](file://backend/server.js)
- [backend/config/database.js](file://backend/config/database.js)
- [database/schema.sql](file://database/schema.sql)
- [frontend/vite.config.js](file://frontend/vite.config.js)
- [frontend/src/services/api.js](file://frontend/src/services/api.js)
- [backend/controllers/auth.controller.js](file://backend/controllers/auth.controller.js)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Development vs Production](#development-vs-production)
8. [Common Setup Scenarios](#common-setup-scenarios)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Conclusion](#conclusion)

## Introduction
Craque-Vision is a multi-sport talent discovery platform connecting athletes, clubs, and scouts. This guide will help you set up the complete development environment locally, including both backend and frontend services, database configuration, and initial application startup.

## Prerequisites
Before installing Craque-Vision, ensure you have the following prerequisites:

### Node.js Requirements
- **Backend requires Node.js v16 or higher**
- Verify your Node.js version: `node --version`
- The backend uses modern JavaScript features and npm scripts for development

### Database Requirements
- **PostgreSQL database server**
- The application expects a PostgreSQL instance running locally or remotely
- Database schema will be initialized using the provided SQL script

### Operating System Compatibility
- Compatible with Windows, macOS, and Linux
- No special system dependencies beyond Node.js and PostgreSQL

**Section sources**
- [README.md:33-35](file://README.md#L33-L35)
- [backend/package.json:1-25](file://backend/package.json#L1-L25)

## Installation

### Step 1: Clone and Navigate
Navigate to the project root directory where you've placed the Craque-Vision repository.

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 4: Environment Configuration
Both backend and frontend require environment variable configuration:

**Backend Environment Setup:**
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

**Frontend Environment Setup:**
```bash
cd frontend
cp .env.example .env
# Configure API base URL if needed
```

**Section sources**
- [README.md:37-61](file://README.md#L37-L61)
- [QUICKSTART.md:15-46](file://QUICKSTART.md#L15-L46)

## Environment Variables

### Backend Required Variables
The backend requires the following environment variables configured in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host address | localhost |
| `DB_PORT` | PostgreSQL port number | 5432 |
| `DB_NAME` | Database name | craque_vision |
| `DB_USER` | Database username | postgres |
| `DB_PASSWORD` | Database password | (required) |
| `JWT_SECRET` | Secret key for JWT tokens | (required) |
| `PORT` | Backend server port | 5000 |

### Frontend Required Variables
The frontend requires the following environment variable:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | http://localhost:5000/api |

### Environment Variable Examples
Create `.env` files based on the `.env.example` templates found in both backend and frontend directories. The frontend uses Vite's environment variable prefix (`VITE_`) for client-side configuration.

**Section sources**
- [backend/config/database.js:4-10](file://backend/config/database.js#L4-L10)
- [backend/controllers/auth.controller.js:4-5](file://backend/controllers/auth.controller.js#L4-L5)
- [frontend/src/services/api.js:4](file://frontend/src/services/api.js#L4)
- [frontend/vite.config.js:6-14](file://frontend/vite.config.js#L6-L14)

## Database Setup

### Step 1: Create Database
First, create the PostgreSQL database:

```sql
CREATE DATABASE craque_vision;
```

### Step 2: Initialize Schema
Execute the database schema script to create all required tables:

```bash
psql -d craque_vision -f database/schema.sql
```

### Database Schema Overview
The schema includes the following key tables:
- **users**: User accounts with role-based access control
- **athletes**: Athlete profiles with sports and personal information
- **videos**: Video uploads with moderation status
- **subscriptions**: Payment plans for scouts and clubs
- **favorites**: Scout favorite athletes tracking
- **likes**: Video engagement tracking

### Database Migration Notes
- The schema script drops existing tables before creation (useful for development)
- Includes indexes for improved query performance
- Contains triggers to automatically update timestamps
- Includes a default admin user account for initial access

**Section sources**
- [QUICKSTART.md:5-13](file://QUICKSTART.md#L5-L13)
- [database/schema.sql:1-185](file://database/schema.sql#L1-L185)

## Running the Application

### Starting the Backend Server
```bash
cd backend
npm run dev
```

The backend will start on port 5000 by default. You can customize this via the `PORT` environment variable.

### Starting the Frontend Application
```bash
cd frontend
npm run dev
```

The frontend will start on port 3000 by default with automatic proxy configuration for API requests.

### Application Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Default Admin Credentials**: Provided in the database initialization script

### Development Workflow
1. Start PostgreSQL database
2. Run backend server: `cd backend && npm run dev`
3. Run frontend: `cd frontend && npm run dev`
4. Both applications will auto-reload during development

**Section sources**
- [QUICKSTART.md:31](file://QUICKSTART.md#L31)
- [QUICKSTART.md:48](file://QUICKSTART.md#L48)
- [backend/server.js:35](file://backend/server.js#L35)
- [frontend/vite.config.js:7](file://frontend/vite.config.js#L7)

## Development vs Production

### Development Mode
- Backend uses nodemon for automatic restarts during development
- Frontend uses Vite's development server with hot module replacement
- Auto-proxy configuration for API requests
- Environment variables loaded from `.env` files

### Production Mode
- Backend: Use `npm start` to run with Node.js directly
- Frontend: Build with `npm run build` for production deployment
- Environment variables must be set in the deployment environment
- No development dependencies are required for production

### Production Configuration Requirements
- Set `NODE_ENV=production` in production environments
- Ensure database connectivity is properly configured
- Configure CORS policies appropriately for production domains
- Set secure JWT secrets and database passwords

**Section sources**
- [backend/package.json:7-8](file://backend/package.json#L7-L8)
- [frontend/package.json:20-24](file://frontend/package.json#L20-L24)

## Common Setup Scenarios

### Scenario 1: Default Local Setup
For standard local development with default settings:

1. Install Node.js v16+ and PostgreSQL
2. Create database and run schema script
3. Configure environment variables with defaults
4. Start both backend and frontend servers

### Scenario 2: Custom Database Configuration
If your PostgreSQL runs on a different host or port:

1. Update `DB_HOST`, `DB_PORT`, and `DB_NAME` in backend `.env`
2. Ensure database credentials are correct
3. Restart backend server

### Scenario 3: Custom Ports
To change default ports:

1. Backend: Set `PORT` environment variable (default: 5000)
2. Frontend: Modify port in `frontend/vite.config.js`
3. Update frontend API URL if needed

### Scenario 4: Remote Database
For remote PostgreSQL instances:

1. Configure database connection variables
2. Ensure network connectivity to the database server
3. Update firewall rules if necessary
4. Test connection with psql client

**Section sources**
- [backend/config/database.js:4-10](file://backend/config/database.js#L4-L10)
- [frontend/vite.config.js:6-14](file://frontend/vite.config.js#L6-L14)

## Troubleshooting Guide

### Database Connection Issues
**Problem**: Backend cannot connect to PostgreSQL
**Solutions**:
1. Verify PostgreSQL is running: `psql -U postgres -c "SELECT 1;"`
2. Check database credentials in `.env` file
3. Ensure database exists: `createdb craque_vision`
4. Verify schema was applied: `psql -d craque_vision -f database/schema.sql`

### Port Conflicts
**Problem**: Port 5000 or 3000 already in use
**Solutions**:
1. Change backend port via `PORT` environment variable
2. Modify frontend port in `vite.config.js`
3. Use `lsof -i :5000` to identify conflicting processes

### Environment Variable Issues
**Problem**: Application fails to start due to missing variables
**Solutions**:
1. Copy `.env.example` to `.env` in both backend and frontend
2. Fill in all required values
3. Verify variable names match exactly what the code expects

### CORS Errors
**Problem**: Frontend cannot communicate with backend
**Solutions**:
1. Ensure backend CORS is enabled (already configured)
2. Verify frontend proxy is working correctly
3. Check browser developer console for specific CORS errors

### JWT Token Issues
**Problem**: Authentication failures or token verification errors
**Solutions**:
1. Ensure `JWT_SECRET` is set in backend `.env`
2. Use the same JWT secret consistently across deployments
3. Clear browser storage if switching between environments

### API Proxy Issues
**Problem**: Frontend cannot reach backend API
**Solutions**:
1. Verify backend server is running on the expected port
2. Check Vite proxy configuration in `vite.config.js`
3. Ensure API endpoints match backend route definitions

**Section sources**
- [backend/config/database.js:4-10](file://backend/config/database.js#L4-L10)
- [frontend/vite.config.js:8-12](file://frontend/vite.config.js#L8-L12)
- [backend/controllers/auth.controller.js:4-5](file://backend/controllers/auth.controller.js#L4-L5)

## Conclusion
You now have all the information needed to set up Craque-Vision locally. The key steps are: installing prerequisites, configuring environment variables, setting up the PostgreSQL database, and starting both backend and frontend servers. For production deployment, ensure proper environment variable management, database connectivity, and security configurations. If you encounter issues, use the troubleshooting guide to diagnose common problems.