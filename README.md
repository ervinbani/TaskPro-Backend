# TaskPro Backend API

Full-stack MERN project backend - A task management system with project collaboration features.

## 🚀 Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT (jsonwebtoken)** - Authentication
- **bcrypt** - Password hashing
- **dotenv** - Environment variables

## 📁 Project Structure

```
TaskPro-Backend/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── userController.js     # User logic (register, login)
│   ├── projectController.js  # Project CRUD operations
│   └── taskController.js     # Task CRUD operations
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── errorHandler.js      # Centralized error handling
├── models/
│   ├── User.js              # User schema (username, email, password)
│   ├── Project.js           # Project schema (name, description, owner, collaborators)
│   └── Task.js              # Task schema (title, description, status, project)
├── routes/
│   ├── userRoutes.js        # User routes (register, login)
│   ├── projectRoutes.js     # Project routes
│   └── taskRoutes.js        # Task routes
├── .env                     # Environment variables
├── .gitignore              # Git ignore file
├── package.json            # Dependencies
└── server.js               # Entry point
```

## ⚙️ Setup & Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
# For local MongoDB installation:
MONGO_URI=mongodb://localhost:27017/taskpro

# Or for MongoDB Atlas (cloud database):
# MONGO_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/taskpro?retryWrites=true&w=majority

# JWT Secret Key
# Generate a strong random string for production
# You can use: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# Frontend URL for CORS
# Development:
CLIENT_URL=http://localhost:3001
# Production (example):
# CLIENT_URL=https://your-frontend-app.netlify.app

# GitHub OAuth (Optional - for social login)
# Get these credentials from: https://github.com/settings/developers
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:3001/api/users/auth/github/callback
```

#### Environment Variables Explained:

| Variable               | Description                               | Example                        |
| ---------------------- | ----------------------------------------- | ------------------------------ |
| `PORT`                 | Port number where the server will run     | `3000` or `5000`               |
| `NODE_ENV`             | Environment mode (development/production) | `development`                  |
| `MONGO_URI`            | MongoDB connection string                 | See examples above             |
| `JWT_SECRET`           | Secret key for JWT token generation       | Use a long random string       |
| `CLIENT_URL`           | Frontend application URL for CORS         | `http://localhost:3001`        |
| `GITHUB_CLIENT_ID`     | GitHub OAuth App Client ID (optional)     | From GitHub Developer Settings |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Secret (optional)        | From GitHub Developer Settings |
| `GITHUB_CALLBACK_URL`  | OAuth callback URL (optional)             | Your callback endpoint         |

#### MongoDB Setup Options:

**Option 1: Local MongoDB**

1. Install MongoDB locally
2. Use: `MONGO_URI=mongodb://localhost:27017/taskpro`

**Option 2: MongoDB Atlas (Recommended)**

1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Get connection string and replace `<username>`, `<password>`, and database name
5. Whitelist your IP address (or allow access from anywhere for development)

**Security Note:** Never commit your `.env` file to version control! It's already included in `.gitignore`.

### 3. Start MongoDB

Make sure MongoDB is running locally or use MongoDB Atlas connection string.

### 4. Start Server

#### Development Mode (with auto-reload)

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

Server will run on `http://localhost:3000`

**Available Scripts:**

- `npm start` - Starts the server using Node.js
- `npm run dev` - Starts the server using nodemon (auto-reloads on file changes)
- `npm test` - Run tests (not yet configured)

---

## 🧪 API Testing Guide

Use **Postman**, **Thunder Client**, or **curl** to test the endpoints.

---

## 📋 User Endpoints

### 1. Register User

Create a new user account.

**Endpoint:** `POST http://localhost:3000/api/user/register` -- (test ok)

**Headers:**

```
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "username": "mario",
  "email": "mario@example.com",
  "password": "password123"
}
```

**Expected Response (201):**

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "username": "mario",
  "email": "mario@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the `token` for subsequent requests!**

---

### 2. Login User

Login with existing credentials.

**Endpoint:** `POST http://localhost:3000/api/user/login` --testok

**Headers:**

```
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "email": "mario@example.com",
  "password": "password123"
}
```

**Expected Response (200):**

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "username": "mario",
  "email": "mario@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Delete Account

Permanently delete your account and all associated data.

**⚠️ WARNING: This action cannot be undone!**

**What gets deleted:**

- Your user account
- All projects you own (and their tasks)
- Your collaborator status from other users' projects

**What is preserved:**

- Projects owned by other users remain intact

**Endpoint:** `DELETE http://localhost:3000/api/user/account`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**No body required**

**Expected Response (200):**

```json
{
  "message": "Account deleted successfully. All your projects and tasks have been removed."
}
```

**Note:** After deletion, your JWT token will be invalid and you'll need to create a new account to use the application.

---

## 🗂️ Project Endpoints

**All project endpoints require authentication!**

### 4. Create Project

Create a new project (user becomes owner).

**Endpoint:** `POST http://localhost:3000/api/projects` --test ok

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body (JSON):**

```json
{
  "name": "Website Redesign",
  "description": "Redesign company website with modern UI"
}
```

**Expected Response (201):**

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
  "name": "Website Redesign",
  "description": "Redesign company website with modern UI",
  "owner": "65a1b2c3d4e5f6g7h8i9j0k1",
  "collaborators": [],
  "createdAt": "2026-01-31T10:30:00.000Z",
  "updatedAt": "2026-01-31T10:30:00.000Z"
}
```

**Save the project `_id` for task creation!**

---

### 4. Get All Projects

Get all projects where user is owner or collaborator.

**Endpoint:** `GET http://localhost:3000/api/projects` --test ok

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response (200):**

```json
[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Website Redesign",
    "description": "Redesign company website with modern UI",
    "owner": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "username": "mario",
      "email": "mario@example.com"
    },
    "collaborators": [],
    "createdAt": "2026-01-31T10:30:00.000Z",
    "updatedAt": "2026-01-31T10:30:00.000Z"
  }
]
```

---

### 5. Get Single Project

Get details of a specific project.

**Endpoint:** `GET http://localhost:3000/api/projects/:id` -- test ok

**Example:** `GET http://localhost:3000/api/projects/65a1b2c3d4e5f6g7h8i9j0k2`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response (200):**

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
  "name": "Website Redesign",
  "description": "Redesign company website with modern UI",
  "owner": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "mario",
    "email": "mario@example.com"
  },
  "collaborators": [],
  "createdAt": "2026-01-31T10:30:00.000Z",
  "updatedAt": "2026-01-31T10:30:00.000Z"
}
```

---

### 6. Update Project

Update project details (only owner can update).

**Endpoint:** `PUT http://localhost:3000/api/projects/:id` --test ok

**Example:** `PUT http://localhost:3000/api/projects/65a1b2c3d4e5f6g7h8i9j0k2`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body (JSON):**

```json
{
  "name": "Website Redesign v2",
  "description": "Updated description for the project"
}
```

**Expected Response (200):**

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
  "name": "Website Redesign v2",
  "description": "Updated description for the project",
  "owner": "65a1b2c3d4e5f6g7h8i9j0k1",
  "collaborators": [],
  "createdAt": "2026-01-31T10:30:00.000Z",
  "updatedAt": "2026-01-31T10:35:00.000Z"
}
```

---

### 7. Delete Project

Delete a project (only owner can delete).

**Endpoint:** `DELETE http://localhost:3000/api/projects/:id` --- test ok

**Example:** `DELETE http://localhost:3000/api/projects/65a1b2c3d4e5f6g7h8i9j0k2`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response (200):**

```json
{
  "message": "Project removed successfully"
}
```

---

## ✅ Task Endpoints

**All task endpoints require authentication!**

### 8. Create Task

Create a new task in a project.

**Endpoint:** `POST http://localhost:3000/api/tasks/projects/:projectId/tasks` --testok

**Example:** `POST http://localhost:3000/api/tasks/projects/65a1b2c3d4e5f6g7h8i9j0k2/tasks`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body (JSON):**

```json
{
  "title": "Design homepage mockup",
  "description": "Create a modern design for the homepage",
  "status": "To Do"
}
```

**Note:** `status` is optional. Valid values: `"To Do"`, `"In Progress"`, `"Done"`. Default: `"To Do"`

**Expected Response (201):**

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
  "title": "Design homepage mockup",
  "description": "Create a modern design for the homepage",
  "status": "To Do",
  "project": "65a1b2c3d4e5f6g7h8i9j0k2",
  "createdAt": "2026-01-31T10:40:00.000Z",
  "updatedAt": "2026-01-31T10:40:00.000Z"
}
```

---

### 9. Get All Tasks for a Project

Get all tasks belonging to a specific project.

**Endpoint:** `GET http://localhost:3000/api/tasks/projects/:projectId/tasks`

**Example:** `GET http://localhost:3000/api/tasks/projects/65a1b2c3d4e5f6g7h8i9j0k2/tasks`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response (200):**

```json
[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "title": "Design homepage mockup",
    "description": "Create a modern design for the homepage",
    "status": "To Do",
    "project": "65a1b2c3d4e5f6g7h8i9j0k2",
    "createdAt": "2026-01-31T10:40:00.000Z",
    "updatedAt": "2026-01-31T10:40:00.000Z"
  },
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k4",
    "title": "Setup database",
    "description": "Configure MongoDB database",
    "status": "In Progress",
    "project": "65a1b2c3d4e5f6g7h8i9j0k2",
    "createdAt": "2026-01-31T10:45:00.000Z",
    "updatedAt": "2026-01-31T10:45:00.000Z"
  }
]
```

---

### 10. Get Single Task

Get details of a specific task.

**Endpoint:** `GET http://localhost:3000/api/tasks/:id` ---test ok

**Example:** `GET http://localhost:3000/api/tasks/65a1b2c3d4e5f6g7h8i9j0k3`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response (200):**

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
  "title": "Design homepage mockup",
  "description": "Create a modern design for the homepage",
  "status": "To Do",
  "project": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Website Redesign",
    "description": "Redesign company website with modern UI",
    "owner": "65a1b2c3d4e5f6g7h8i9j0k1",
    "collaborators": []
  },
  "createdAt": "2026-01-31T10:40:00.000Z",
  "updatedAt": "2026-01-31T10:40:00.000Z"
}
```

---

### 11. Update Task

Update task details (status, description, etc.).

**Endpoint:** `PUT http://localhost:3000/api/tasks/:id` ---test ok

**Example:** `PUT http://localhost:3000/api/tasks/65a1b2c3d4e5f6g7h8i9j0k3`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body (JSON):**

```json
{
  "status": "In Progress",
  "description": "Working on the mockup design"
}
```

**Expected Response (200):**

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
  "title": "Design homepage mockup",
  "description": "Working on the mockup design",
  "status": "In Progress",
  "project": "65a1b2c3d4e5f6g7h8i9j0k2",
  "createdAt": "2026-01-31T10:40:00.000Z",
  "updatedAt": "2026-01-31T10:50:00.000Z"
}
```

---

### 12. Delete Task

Delete a task from a project.

**Endpoint:** `DELETE http://localhost:3000/api/tasks/:id`

**Example:** `DELETE http://localhost:3000/api/tasks/65a1b2c3d4e5f6g7h8i9j0k3`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response (200):**

```json
{
  "message": "Task removed successfully"
}
```

---

## 🔒 Authorization & Security

### Authentication Flow:

1. Register or Login to get JWT token
2. Include token in `Authorization` header: `Bearer YOUR_TOKEN`
3. Token expires after 30 days

### Authorization Rules:

**Projects:**

- Anyone authenticated can create projects
- Owner and collaborators can view projects
- Only owner can update/delete projects

**Tasks:**

- Owner and collaborators can create tasks
- Owner and collaborators can view/update/delete tasks
- Tasks are isolated by project access

### Password Security:

- Passwords are hashed using bcrypt with salt rounds
- Passwords are never returned in API responses
- Pre-save hook automatically hashes passwords before storage

---

## 🧪 Complete Testing Workflow

### Step 1: Register User

```
POST /api/user/register
Body: { username, email, password }
→ Save the token
```

### Step 2: Create Project

```
POST /api/projects
Headers: Authorization: Bearer TOKEN
Body: { name, description }
→ Save the project ID
```

### Step 3: Create Tasks

```
POST /api/tasks/projects/:projectId/tasks
Headers: Authorization: Bearer TOKEN
Body: { title, description, status }
→ Create multiple tasks
```

### Step 4: Update Task Status

```
PUT /api/tasks/:id
Headers: Authorization: Bearer TOKEN
Body: { status: "In Progress" }
```

### Step 5: View Project with Tasks

```
GET /api/projects/:id
GET /api/tasks/projects/:projectId/tasks
Headers: Authorization: Bearer TOKEN
```

---

## ⚠️ Common Errors

### 401 Unauthorized

- Missing or invalid JWT token
- Token expired
- Solution: Login again to get new token

### 403 Forbidden

- Trying to access/modify resource you don't own
- Solution: Only access your own projects/tasks

### 404 Not Found

- Invalid project or task ID
- Resource doesn't exist
- Solution: Check the ID is correct

### 400 Bad Request

- Missing required fields
- Invalid data format
- Solution: Check request body matches examples

---

## 📝 API Summary

| Method | Endpoint                               | Auth    | Description              |
| ------ | -------------------------------------- | ------- | ------------------------ |
| POST   | `/api/user/register`                   | Public  | Register new user        |
| POST   | `/api/user/login`                      | Public  | Login user               |
| DELETE | `/api/user/account`                    | Private | Delete account (cascade) |
| POST   | `/api/projects`                        | Private | Create project           |
| GET    | `/api/projects`                        | Private | Get all projects         |
| GET    | `/api/projects/:id`                    | Private | Get project by ID        |
| PUT    | `/api/projects/:id`                    | Private | Update project           |
| DELETE | `/api/projects/:id`                    | Private | Delete project           |
| POST   | `/api/tasks/projects/:projectId/tasks` | Private | Create task              |
| GET    | `/api/tasks/projects/:projectId/tasks` | Private | Get project tasks        |
| GET    | `/api/tasks/:id`                       | Private | Get task by ID           |
| PUT    | `/api/tasks/:id`                       | Private | Update task              |
| DELETE | `/api/tasks/:id`                       | Private | Delete task              |

---

## 🎯 Next Steps

1. Test all endpoints with Postman/Thunder Client
2. Implement collaboration features (add/remove collaborators)
3. Add task filtering and sorting
4. Implement task assignment to specific users
5. Add task due dates and priorities
6. Create frontend with React

---

## 📄 License

This project is created for educational purposes as part of the MERN Stack Capstone Project.
