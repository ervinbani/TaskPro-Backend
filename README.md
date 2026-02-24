# TaskPro Backend API

Full-stack MERN project backend - A task management system with project collaboration features.

## ✨ Key Features

### 👥 **User Management**
- User registration and authentication with JWT
- Secure password hashing with bcrypt
- Account deletion with cascade cleanup

### 🗂️ **Project Management**
- Create, read, update, and delete projects
- Add/remove collaborators to projects
- Project ownership and access control
- Each project can have multiple collaborators

### ✅ **Task Management**
- Full CRUD operations on tasks
- **Task Properties:**
  - Title and description
  - Status tracking (To Do, In Progress, Done)
  - Priority levels (Low, Medium, High)
  - Due dates
  - Tags for categorization
  - Todo checklists with progress tracking
  - Comments and discussions
- Task assignment to project members (schema ready)

### 📝 **Todo Checklists**
- Add todos to any task
- Mark todos as complete/incomplete
- Track completion progress (percentage)
- Todo assignment to specific users
- Automatic timestamp tracking

### 💬 **Comments & Discussions**
- Add comments to tasks for collaboration
- Edit your own comments
- Delete your own comments (or project owner can delete any)
- Track comment author and timestamp
- Notifications when new comments added

### 🔔 **Real-time Notifications**
- Automatic notifications for:
  - Project invitations and removals
  - Task creation, updates, and deletions
  - Status changes
  - Todo completion
- Unread notification counter
- Mark individual or all notifications as read
- Notification history and management

### 🔐 **Security & Authorization**
- JWT-based authentication
- Role-based access control (project owners vs collaborators)
- Protected API endpoints
- CORS configuration for frontend integration

---

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
│   ├── taskController.js     # Task CRUD operations
│   └── notificationController.js  # Notification operations
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── errorHandler.js      # Centralized error handling
├── models/
│   ├── User.js              # User schema (username, email, password)
│   ├── Project.js           # Project schema (name, description, owner, collaborators)
│   ├── Task.js              # Task schema (title, description, status, project)
│   └── Notification.js      # Notification schema (recipient, sender, type, message)
├── routes/
│   ├── userRoutes.js        # User routes (register, login)
│   ├── projectRoutes.js     # Project routes
│   ├── taskRoutes.js        # Task routes
│   └── notificationRoutes.js  # Notification routes
├── utils/
│   └── notificationService.js  # Notification helper functions
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

### 8. Add Collaborator to Project

Add a user as a collaborator to your project (owner only).

**Endpoint:** `POST http://localhost:3000/api/projects/:id/collaborators`

**Example:** `POST http://localhost:3000/api/projects/65a1b2c3d4e5f6g7h8i9j0k2/collaborators`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body (JSON):**

```json
{
  "userId": "65a1b2c3d4e5f6g7h8i9j0k6"
}
```

**Expected Response (200):**

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
  "name": "Website Redesign v2",
  "description": "Updated description for the project",
  "owner": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "mario",
    "email": "mario@example.com"
  },
  "collaborators": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k6",
      "username": "luigi",
      "email": "luigi@example.com"
    }
  ],
  "createdAt": "2026-01-31T10:30:00.000Z",
  "updatedAt": "2026-01-31T11:00:00.000Z"
}
```

**Notes:**

- Only project owner can add collaborators
- Creates a `PROJECT_INVITE` notification for the added user
- Cannot add yourself as collaborator
- Cannot add the same user twice

---

### 9. Remove Collaborator from Project

Remove a collaborator from your project (owner only).

**Endpoint:** `DELETE http://localhost:3000/api/projects/:id/collaborators/:userId`

**Example:** `DELETE http://localhost:3000/api/projects/65a1b2c3d4e5f6g7h8i9j0k2/collaborators/65a1b2c3d4e5f6g7h8i9j0k6`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response (200):**

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
  "name": "Website Redesign v2",
  "description": "Updated description for the project",
  "owner": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "mario",
    "email": "mario@example.com"
  },
  "collaborators": [],
  "createdAt": "2026-01-31T10:30:00.000Z",
  "updatedAt": "2026-01-31T11:05:00.000Z"
}
```

**Notes:**

- Only project owner can remove collaborators
- Creates a `PROJECT_REMOVED` notification for the removed user
- Cannot remove the project owner

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
  "status": "To Do",
  "priority": "High",
  "dueDate": "2026-02-28",
  "tags": ["design", "frontend"]
}
```

**Optional Fields:**

- `status` - Task status. Valid values: `"To Do"`, `"In Progress"`, `"Done"`. Default: `"To Do"`
- `priority` - Task priority. Valid values: `"Low"`, `"Medium"`, `"High"`. Default: `"Medium"`
- `dueDate` - Due date in ISO format (YYYY-MM-DD)
- `tags` - Array of tag strings for categorization

**Expected Response (201):**

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
  "title": "Design homepage mockup",
  "description": "Create a modern design for the homepage",
  "status": "To Do",
  "priority": "High",
  "dueDate": "2026-02-28T00:00:00.000Z",
  "tags": ["design", "frontend"],
  "assignedTo": [],
  "comments": [],
  "todos": [],
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

Update task details (status, description, priority, due date, tags, etc.).

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
  "title": "Design homepage mockup - updated",
  "status": "In Progress",
  "description": "Working on the mockup design",
  "priority": "High",
  "dueDate": "2026-03-01",
  "tags": ["design", "frontend", "urgent"]
}
```

**Note:** All fields are optional. Only include the fields you want to update.

**Expected Response (200):**

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
  "title": "Design homepage mockup - updated",
  "description": "Working on the mockup design",
  "status": "In Progress",
  "priority": "High",
  "dueDate": "2026-03-01T00:00:00.000Z",
  "tags": ["design", "frontend", "urgent"],
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

### 13. Add Todo to Task

Add a new todo item to a task's checklist.

**Endpoint:** `POST http://localhost:3000/api/tasks/:id/todos`

**Example:** `POST http://localhost:3000/api/tasks/65a1b2c3d4e5f6g7h8i9j0k3/todos`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body (JSON):**

```json
{
  "text": "Create wireframes for homepage"
}
```

**Expected Response (200):**

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
  "title": "Design homepage mockup",
  "description": "Create mockup for the new homepage",
  "status": "To Do",
  "project": "65a1b2c3d4e5f6g7h8i9j0k2",
  "todos": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k8",
      "text": "Create wireframes for homepage",
      "completed": false,
      "createdAt": "2026-01-31T11:00:00.000Z"
    }
  ],
  "todoProgress": 0,
  "createdAt": "2026-01-31T10:40:00.000Z",
  "updatedAt": "2026-01-31T11:00:00.000Z"
}
```

**Notes:**

- Maximum 50 todos per task
- Creates notification for project collaborators when todo is added
- Returns updated task with new todo included

---

### 14. Update Todo

Update a todo item in a task (change text or toggle completion status).

**Endpoint:** `PUT http://localhost:3000/api/tasks/:id/todos/:todoId`

**Example:** `PUT http://localhost:3000/api/tasks/65a1b2c3d4e5f6g7h8i9j0k3/todos/65a1b2c3d4e5f6g7h8i9j0k8`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body (JSON) - Toggle completion:**

```json
{
  "completed": true
}
```

**OR Body (JSON) - Update text:**

```json
{
  "text": "Create detailed wireframes with annotations"
}
```

**Expected Response (200):**

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
  "title": "Design homepage mockup",
  "description": "Create mockup for the new homepage",
  "status": "To Do",
  "project": "65a1b2c3d4e5f6g7h8i9j0k2",
  "todos": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k8",
      "text": "Create wireframes for homepage",
      "completed": true,
      "completedAt": "2026-01-31T11:30:00.000Z",
      "completedBy": "65a1b2c3d4e5f6g7h8i9j0k1",
      "createdAt": "2026-01-31T11:00:00.000Z"
    }
  ],
  "todoProgress": 100,
  "createdAt": "2026-01-31T10:40:00.000Z",
  "updatedAt": "2026-01-31T11:30:00.000Z"
}
```

**Notes:**

- Can update either `text` or `completed` status
- When marking as completed, automatically records `completedAt` timestamp and `completedBy` user
- When all todos are completed, creates special "ALL_TODOS_COMPLETED" notification
- Returns updated task with modified todo

---

### 15. Delete Todo

Remove a todo item from a task.

**Endpoint:** `DELETE http://localhost:3000/api/tasks/:id/todos/:todoId`

**Example:** `DELETE http://localhost:3000/api/tasks/65a1b2c3d4e5f6g7h8i9j0k3/todos/65a1b2c3d4e5f6g7h8i9j0k8`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response (200):**

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
  "title": "Design homepage mockup",
  "description": "Create mockup for the new homepage",
  "status": "To Do",
  "project": "65a1b2c3d4e5f6g7h8i9j0k2",
  "todos": [],
  "todoProgress": 0,
  "createdAt": "2026-01-31T10:40:00.000Z",
  "updatedAt": "2026-01-31T11:35:00.000Z"
}
```

**Notes:**

- Only task owner or project owner can delete todos
- Returns updated task with todo removed
- Updates `todoProgress` automatically

---

## 💬 Comment Endpoints

**All comment endpoints require authentication!**

### 16. Add Comment to Task

Add a comment/discussion to a task.

**Endpoint:** `POST http://localhost:3000/api/tasks/:id/comments`

**Example:** `POST http://localhost:3000/api/tasks/65a1b2c3d4e5f6g7h8i9j0k3/comments`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body (JSON):**

```json
{
  "description": "I've completed the wireframes, please review!"
}
```

**Expected Response (201):**

```json
{
  "message": "Comment added successfully",
  "comment": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k9",
    "description": "I've completed the wireframes, please review!",
    "owner": {
      "username": "mario",
      "email": "mario@example.com"
    },
    "createdAt": "2026-01-31T12:00:00.000Z"
  },
  "task": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "title": "Design homepage mockup",
    "comments": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k9",
        "description": "I've completed the wireframes, please review!",
        "owner": {
          "username": "mario",
          "email": "mario@example.com"
        },
        "createdAt": "2026-01-31T12:00:00.000Z"
      }
    ]
  }
}
```

**Notes:**

- Comment automatically includes current user's info
- Creates notification for other project collaborators
- Description is required and cannot be empty

---

### 17. Update Comment

Update a comment you created (or project owner can update any comment).

**Endpoint:** `PUT http://localhost:3000/api/tasks/:id/comments/:commentId`

**Example:** `PUT http://localhost:3000/api/tasks/65a1b2c3d4e5f6g7h8i9j0k3/comments/65a1b2c3d4e5f6g7h8i9j0k9`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body (JSON):**

```json
{
  "description": "Updated: Wireframes are ready for review!"
}
```

**Expected Response (200):**

```json
{
  "message": "Comment updated successfully",
  "comment": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k9",
    "description": "Updated: Wireframes are ready for review!",
    "owner": {
      "username": "mario",
      "email": "mario@example.com"
    },
    "createdAt": "2026-01-31T12:00:00.000Z"
  },
  "task": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "title": "Design homepage mockup",
    "comments": [...]
  }
}
```

**Notes:**

- Can only edit your own comments (unless you're project owner)
- Project owner can edit any comment
- Description is required

---

### 18. Delete Comment

Delete a comment from a task.

**Endpoint:** `DELETE http://localhost:3000/api/tasks/:id/comments/:commentId`

**Example:** `DELETE http://localhost:3000/api/tasks/65a1b2c3d4e5f6g7h8i9j0k3/comments/65a1b2c3d4e5f6g7h8i9j0k9`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response (200):**

```json
{
  "message": "Comment deleted successfully",
  "task": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "title": "Design homepage mockup",
    "comments": [],
    "createdAt": "2026-01-31T10:40:00.000Z",
    "updatedAt": "2026-01-31T12:15:00.000Z"
  }
}
```

**Notes:**

- Can only delete your own comments (unless you're project owner)
- Project owner can delete any comment
- Returns updated task with comment removed

---

## 🔔 Notification Endpoints

**All notification endpoints require authentication!**

**How it works:** When users perform actions (add collaborators, create/update/delete tasks, etc.), notifications are automatically created for relevant users. The frontend should poll these endpoints periodically (every 30 seconds) to check for new notifications.

### 19. Get Unread Notification Count

Get the count of unread notifications (for badge display).

**Endpoint:** `GET http://localhost:3000/api/notifications/unread/count`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response (200):**

```json
{
  "count": 3
}
```

**Usage:** Call this endpoint every 30 seconds to update the notification badge in your UI.

---

### 20. Get All Notifications

Get all notifications for the logged-in user.

**Endpoint:** `GET http://localhost:3000/api/notifications`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Query Parameters (optional):**

- `limit` - Number of notifications to return (default: 20)
- `skip` - Number of notifications to skip for pagination (default: 0)
- `unreadOnly` - Set to "true" to get only unread notifications (default: "false")

**Example:** `GET http://localhost:3000/api/notifications?limit=10&unreadOnly=true`

**Expected Response (200):**

```json
[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "recipient": "65a1b2c3d4e5f6g7h8i9j0k1",
    "sender": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k6",
      "username": "luigi",
      "email": "luigi@example.com"
    },
    "type": "PROJECT_INVITE",
    "message": "luigi has added you to the project 'Website Redesign'",
    "project": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "name": "Website Redesign"
    },
    "task": null,
    "isRead": false,
    "readAt": null,
    "data": {},
    "createdAt": "2026-01-31T11:00:00.000Z",
    "updatedAt": "2026-01-31T11:00:00.000Z"
  },
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k7",
    "recipient": "65a1b2c3d4e5f6g7h8i9j0k1",
    "sender": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k6",
      "username": "luigi",
      "email": "luigi@example.com"
    },
    "type": "TASK_STATUS_CHANGED",
    "message": "luigi moved 'Design homepage mockup' to In Progress",
    "project": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "name": "Website Redesign"
    },
    "task": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "title": "Design homepage mockup"
    },
    "isRead": true,
    "readAt": "2026-01-31T11:05:00.000Z",
    "data": {
      "oldStatus": "To Do",
      "newStatus": "In Progress"
    },
    "createdAt": "2026-01-31T11:02:00.000Z",
    "updatedAt": "2026-01-31T11:05:00.000Z"
  }
]
```

---

### 21. Mark Notification as Read

Mark a specific notification as read.

**Endpoint:** `PUT http://localhost:3000/api/notifications/:id/read`

**Example:** `PUT http://localhost:3000/api/notifications/65a1b2c3d4e5f6g7h8i9j0k5/read`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response (200):**

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
  "recipient": "65a1b2c3d4e5f6g7h8i9j0k1",
  "sender": "65a1b2c3d4e5f6g7h8i9j0k6",
  "type": "PROJECT_INVITE",
  "message": "luigi has added you to the project 'Website Redesign'",
  "project": "65a1b2c3d4e5f6g7h8i9j0k2",
  "task": null,
  "isRead": true,
  "readAt": "2026-01-31T11:10:00.000Z",
  "data": {},
  "createdAt": "2026-01-31T11:00:00.000Z",
  "updatedAt": "2026-01-31T11:10:00.000Z"
}
```

---

### 22. Mark All Notifications as Read

Mark all notifications as read for the logged-in user.

**Endpoint:** `PUT http://localhost:3000/api/notifications/mark-all-read`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response (200):**

```json
{
  "message": "All notifications marked as read",
  "modifiedCount": 5
}
```

---

### 23. Delete a Notification

Delete a specific notification.

**Endpoint:** `DELETE http://localhost:3000/api/notifications/:id`

**Example:** `DELETE http://localhost:3000/api/notifications/65a1b2c3d4e5f6g7h8i9j0k5`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response (200):**

```json
{
  "message": "Notification deleted successfully"
}
```

---

### 24. Clear All Read Notifications

Delete all read notifications for the logged-in user.

**Endpoint:** `DELETE http://localhost:3000/api/notifications/clear-read`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response (200):**

```json
{
  "message": "Read notifications cleared",
  "deletedCount": 10
}
```

---

### 📋 Notification Types

The system generates the following notification types:

| Type                  | Description                                       | Triggered By                         |
| --------------------- | ------------------------------------------------- | ------------------------------------ |
| `PROJECT_INVITE`      | You were added as a collaborator to a project     | Owner adds you to project            |
| `PROJECT_REMOVED`     | You were removed from a project                   | Owner removes you from project       |
| `PROJECT_UPDATED`     | A project you're part of was updated              | Owner updates project details        |
| `PROJECT_DELETED`     | A project you were part of was deleted            | Owner deletes project                |
| `TASK_CREATED`        | A new task was created in your project            | Collaborator creates task            |
| `TASK_UPDATED`        | A task in your project was updated                | Collaborator updates task            |
| `TASK_ASSIGNED`       | You were assigned to a task (future feature)      | Task assignment (not yet implemented)|
| `TASK_STATUS_CHANGED` | A task status changed (To Do → In Progress, etc.) | Collaborator changes task status     |
| `TASK_DELETED`        | A task was deleted from your project              | Collaborator deletes task            |
| `TODO_ADDED`          | A new todo was added to a task                    | Collaborator adds todo               |
| `TODO_ASSIGNED`       | A todo was assigned to you (future feature)       | Todo assignment (implemented)        |
| `TODO_COMPLETED`      | A todo item was marked as completed               | Collaborator completes todo          |
| `ALL_TODOS_COMPLETED` | All todos in a task were completed                | Last todo completion                 |

**Note:** You won't receive notifications for your own actions.

---

## �🔒 Authorization & Security

### Authentication Flow:

1. Register or Login to get JWT token
2. Include token in `Authorization` header: `Bearer YOUR_TOKEN`
3. Token expires after 30 days (configurable via JWT_SECRET)

### Authorization Rules:

**Projects:**

- ✅ Anyone authenticated can create projects
- ✅ Owner and collaborators can view projects
- ✅ Only owner can update project details
- ✅ Only owner can delete projects (cascade deletes all tasks)
- ✅ Only owner can add/remove collaborators
- ❌ Collaborators cannot add other collaborators

**Tasks:**

- ✅ Owner and collaborators can create tasks in a project
- ✅ Owner and collaborators can view all tasks in a project
- ✅ Owner and collaborators can update any task in a project
- ✅ Owner and collaborators can delete any task in a project
- ✅ Task actions trigger notifications to other project members
- ✅ Tasks can only be created in projects where user has access

**Todos:**

- ✅ Owner and collaborators can add todos to tasks
- ✅ Owner and collaborators can mark todos complete/incomplete
- ✅ System tracks who completed each todo
- ✅ Automatic progress calculation (percentage completed)
- ✅ Notifications sent when todos added or completed

**Comments:**

- ✅ Owner and collaborators can add comments to tasks
- ✅ Users can only edit/delete their own comments
- ✅ Project owner can edit/delete any comment
- ✅ Comments include author info (username, email)
- ✅ Notifications sent when new comment added

**Notifications:**

- ✅ Users can only see their own notifications
- ✅ Users can only mark their own notifications as read
- ✅ Notifications auto-created for relevant project events
- ✅ Old notifications auto-delete after 30 days (configurable)

### Password Security:

- Passwords are hashed using bcrypt with 10 salt rounds
- Passwords are never returned in API responses
- Pre-save hook automatically hashes passwords before storage
- Password comparison uses secure bcrypt.compare method

---

## 🧪 Complete Testing Workflow

### Step 1: Register Two Users

```
POST /api/user/register
Body: { username: "mario", email: "mario@example.com", password: "password123" }
→ Save mario's token as TOKEN_1

POST /api/user/register
Body: { username: "luigi", email: "luigi@example.com", password: "password456" }
→ Save luigi's token as TOKEN_2
→ Save luigi's user ID
```

### Step 2: Create Project (as Mario)

```
POST /api/projects
Headers: Authorization: Bearer TOKEN_1
Body: { name: "Website Redesign", description: "Redesign company website" }
→ Save the project ID
```

### Step 3: Add Luigi as Collaborator (as Mario)

```
POST /api/projects/:projectId/collaborators
Headers: Authorization: Bearer TOKEN_1
Body: { userId: "luigi_user_id" }
→ Luigi receives PROJECT_INVITE notification
```

### Step 4: Create Tasks with Various Properties

```
POST /api/tasks/projects/:projectId/tasks
Headers: Authorization: Bearer TOKEN_1
Body: { 
  title: "Design homepage", 
  description: "Create mockup",
  priority: "High",
  dueDate: "2026-03-01",
  tags: ["design", "frontend"],
  status: "To Do"
}
→ Save task ID
→ Create multiple tasks with different priorities and tags
```

### Step 5: Add Todos to Task

```
POST /api/tasks/:taskId/todos
Headers: Authorization: Bearer TOKEN_1
Body: { text: "Create wireframes" }

POST /api/tasks/:taskId/todos
Headers: Authorization: Bearer TOKEN_1
Body: { text: "Design color scheme" }
```

### Step 6: Update Task Properties (as Luigi)

```
PUT /api/tasks/:id
Headers: Authorization: Bearer TOKEN_2
Body: { 
  status: "In Progress",
  priority: "High",
  tags: ["design", "frontend", "urgent"]
}
→ Mario receives TASK_STATUS_CHANGED notification
```

### Step 7: Complete Todos

```
PUT /api/tasks/:taskId/todos/:todoId
Headers: Authorization: Bearer TOKEN_2
Body: { completed: true }
→ When all todos completed, sends ALL_TODOS_COMPLETED notification
```

### Step 8: Add Comments to Task

```
POST /api/tasks/:taskId/comments
Headers: Authorization: Bearer TOKEN_1
Body: { description: "Great progress on the wireframes!" }
→ Luigi receives notification about new comment

POST /api/tasks/:taskId/comments
Headers: Authorization: Bearer TOKEN_2
Body: { description: "Thanks! Should be ready by tomorrow." }
→ Mario receives notification

PUT /api/tasks/:taskId/comments/:commentId
Headers: Authorization: Bearer TOKEN_2
Body: { description: "Update: Ready for review now!" }
→ Only owner or project owner can edit
```

### Step 9: Check Notifications

```
GET /api/notifications/unread/count
Headers: Authorization: Bearer TOKEN_1
→ See unread notification count

GET /api/notifications
Headers: Authorization: Bearer TOKEN_1
→ View all notifications

PUT /api/notifications/mark-all-read
Headers: Authorization: Bearer TOKEN_1
```

### Step 10: View Project with All Data

```
GET /api/projects/:id
Headers: Authorization: Bearer TOKEN_1
→ See project with collaborators

GET /api/tasks/projects/:projectId/tasks
Headers: Authorization: Bearer TOKEN_1
→ See all tasks with priorities, tags, due dates, todos, and comments
```

### Step 11: Remove Collaborator (as Mario)

```
DELETE /api/projects/:projectId/collaborators/:luigiId
Headers: Authorization: Bearer TOKEN_1
→ Luigi receives PROJECT_REMOVED notification
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

| Method | Endpoint                                        | Auth    | Description                          |
| ------ | ----------------------------------------------- | ------- | ------------------------------------ |
| POST   | `/api/user/register`                            | Public  | Register new user                    |
| POST   | `/api/user/login`                               | Public  | Login user                           |
| DELETE | `/api/user/account`                             | Private | Delete account (cascade)             |
| POST   | `/api/projects`                                 | Private | Create project                       |
| GET    | `/api/projects`                                 | Private | Get all projects                     |
| GET    | `/api/projects/:id`                             | Private | Get project by ID                    |
| PUT    | `/api/projects/:id`                             | Private | Update project                       |
| DELETE | `/api/projects/:id`                             | Private | Delete project                       |
| POST   | `/api/projects/:id/collaborators`               | Private | Add collaborator to project          |
| DELETE | `/api/projects/:id/collaborators/:userId`       | Private | Remove collaborator from project     |
| POST   | `/api/tasks/projects/:projectId/tasks`          | Private | Create task (with priority, tags)    |
| GET    | `/api/tasks/projects/:projectId/tasks`          | Private | Get project tasks                    |
| GET    | `/api/tasks/:id`                                | Private | Get task by ID                       |
| PUT    | `/api/tasks/:id`                                | Private | Update task (status, priority, etc.) |
| DELETE | `/api/tasks/:id`                                | Private | Delete task                          |
| POST   | `/api/tasks/:id/todos`                          | Private | Add todo to task                     |
| PUT    | `/api/tasks/:id/todos/:todoId`                  | Private | Update todo (text/completed)         |
| DELETE | `/api/tasks/:id/todos/:todoId`                  | Private | Delete todo from task                |
| POST   | `/api/tasks/:id/comments`                       | Private | Add comment to task                  |
| PUT    | `/api/tasks/:id/comments/:commentId`            | Private | Update comment (own or project owner)|
| DELETE | `/api/tasks/:id/comments/:commentId`            | Private | Delete comment (own or project owner)|
| GET    | `/api/notifications/unread/count`               | Private | Get unread count (for badge)         |
| GET    | `/api/notifications`                            | Private | Get all notifications                |
| PUT    | `/api/notifications/:id/read`                   | Private | Mark notification as read            |
| PUT    | `/api/notifications/mark-all-read`              | Private | Mark all as read                     |
| DELETE | `/api/notifications/:id`                        | Private | Delete notification                  |
| DELETE | `/api/notifications/clear-read`                 | Private | Clear all read notifications         |

---

## 🎯 Next Steps

### 🚧 Ready to Implement (Schema Already Exists)

The following features have database schemas in place but need controller/route implementation:

1. **Task Assignment System**
   - Assign tasks to specific project members
   - `assignedTo` field exists in Task model
   - Endpoints needed: `POST /api/tasks/:id/assign`, `DELETE /api/tasks/:id/assign/:userId`

### 📈 Future Enhancements

1. **Advanced Features**
   - Task filtering and sorting (by priority, due date, status, tags)
   - Search functionality across tasks and projects
   - Task dependencies (blocked by, blocking)
   - File attachments to tasks
   - Activity timeline/audit log

2. **Analytics & Reporting**
   - Project progress dashboards
   - Task completion statistics
   - User productivity metrics
   - Export reports (PDF, CSV)

3. **Collaboration Features**
   - Real-time updates with WebSockets
   - @mentions in comments
   - Email notifications
   - Activity feed

4. **User Experience**
   - Password reset functionality
   - Email verification
   - User profile customization
   - Dark mode preferences

5. **API Improvements**
   - Pagination for large datasets
   - Rate limiting
   - API versioning
   - GraphQL endpoint

6. **Create Frontend**
   - React-based UI
   - Drag-and-drop Kanban board
   - Calendar view for due dates
   - Mobile responsive design

---

## 📄 License

This project is created for educational purposes as part of the MERN Stack Capstone Project.
