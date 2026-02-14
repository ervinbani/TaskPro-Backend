# TaskPro Backend - Project Presentation

**Duration:** 5-10 minutes  
**Project Type:** Full-Stack MERN Application Backend  
**Course:** Per Scholas

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technologies Used](#technologies-used)
3. [Key Features](#key-features)
4. [Architecture & Design Patterns](#architecture--design-patterns)
5. [Implementation Highlights](#implementation-highlights)
6. [Challenges Faced](#challenges-faced)
7. [Future Improvements](#future-improvements)
8. [Demo & API Endpoints](#demo--api-endpoints)

---

## 🎯 Project Overview

**TaskPro Backend** is a RESTful API built for a collaborative task management system. The application enables users to:

- Create and manage projects
- Organize tasks within projects
- Collaborate with team members
- Track task progress with status, priority, and due dates

**Purpose:** To provide a robust, secure backend that supports team collaboration and project management workflows.

---

## 🛠️ Technologies Used

### Core Stack

- **Node.js** (v18+) - Runtime environment
- **Express.js** (v5.2.1) - Web framework for building RESTful APIs
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** (v9.1.5) - ODM for MongoDB with schema validation

### Security & Authentication

- **JWT (jsonwebtoken)** - Token-based authentication
- **bcrypt** (v6.0.0) - Password hashing with salt

### Additional Tools

- **CORS** - Cross-origin resource sharing for frontend integration
- **dotenv** - Environment variable management
- **Nodemon** - Development auto-reload

---

## ✨ Key Features

### 1. **User Authentication & Profile Management**

- User registration with email validation
- Secure login with JWT token generation
- Password hashing using bcrypt (10 salt rounds)
- Protected routes with JWT middleware
- **Profile management:**
  - Update username and email
  - Change password with current password verification
  - **Account deletion with cascade:**
    - Deletes all owned projects and their tasks
    - Removes user from collaborator lists in other projects
    - Complete data cleanup for privacy compliance

### 2. **Project Management**

- Create, read, update, and delete projects
- Owner-based access control
- Collaborator system for team projects
- Project tagging for organization
- Automatic timestamp tracking (createdAt, updatedAt)

### 3. **Task Management**

- Full CRUD operations for tasks within projects
- Task properties:
  - Title and description
  - Status tracking: "To Do", "In Progress", "Done"
  - Priority levels: "Low", "Medium", "High"
  - **Due date** (optional) - recently added feature
  - Tags for categorization
  - Comments system with user attribution
- Task-project relationship with references

### 4. **Authorization & Access Control**

- Role-based permissions (Owner vs Collaborator)
- Project-level access verification
- Secure data isolation between users

---

## 🏗️ Architecture & Design Patterns

### MVC Pattern Implementation

```
Models (Data Layer)
  ↓
Controllers (Business Logic)
  ↓
Routes (API Endpoints)
  ↓
Middleware (Authentication & Error Handling)
```

### Project Structure

```
TaskPro-Backend/
├── config/          # Database connection
├── controllers/     # Business logic layer
├── middleware/      # Auth & error handling
├── models/          # Mongoose schemas
├── routes/          # API endpoints
└── server.js        # Application entry point
```

### Design Decisions

**1. Separation of Concerns**

- Controllers handle business logic
- Routes define endpoints
- Middleware manages cross-cutting concerns
- Models define data structure and validation

**2. Schema Design**

- User schema with embedded password hashing
- Project schema with owner and collaborators array
- Task schema with embedded comments and project reference
- Consistent use of timestamps across all models

**3. Security-First Approach**

- All routes except register/login are protected
- JWT tokens expire and require refresh
- Passwords never stored in plain text
- User data sanitized (passwords excluded from responses)

---

## 🔨 Implementation Highlights

### 1. **Authentication Middleware**

```javascript
// JWT verification on every protected route
const protect = async (req, res, next) => {
  // Extract token from Authorization header
  // Verify token validity
  // Attach user to request object
  // Proceed or reject based on verification
};
```

### 2. **Helper Functions for Access Control**

```javascript
// Reusable function to check project access
const checkProjectAccess = async (projectId, userId) => {
  // Verify project exists
  // Check if user is owner OR collaborator
  // Return authorization status
};
```

### 3. **Collaborator Management**

- Add/remove collaborators by email
- Email validation before adding
- Prevent duplicate collaborators
- Prevent owner from being added as collaborator
- Collaborative task access for all project members

### 4. **Data Validation**

- Schema-level validation with Mongoose
- Controller-level business logic validation
- Custom error messages for better UX
- Enum validation for status and priority fields

### 5. **Error Handling**

- Centralized error handler middleware
- Consistent error response format
- Appropriate HTTP status codes
- Detailed error messages for debugging

---

## 🚧 Challenges Faced

### 1. **Authorization Logic**

**Challenge:** Implementing proper access control where owners and collaborators have different permissions.

**Solution:**

- Created helper function `checkProjectAccess()`
- Separated owner-only operations (update, delete, add collaborators)
- Shared operations for both roles (view, create tasks)

### 2. **Nested Resource Routing**

**Challenge:** Tasks belong to projects, requiring complex routing structure.

**Solution:**

- Implemented nested routes: `/api/projects/:projectId/tasks`
- Task operations verify project access before proceeding
- Maintained RESTful principles while ensuring security

### 3. **Collaborator Email Validation**

**Challenge:** Adding collaborators by email without exposing sensitive data.

**Solution:**

- Find user by email without returning password
- Validate user existence before adding
- Prevent adding non-existent users
- Return clear error messages

### 4. **Data Relationships**

**Challenge:** Managing references between Users, Projects, and Tasks.

**Solution:**

- Used Mongoose ObjectId references
- Implemented `.populate()` for related data
- Maintained referential integrity
- Cascading considerations for deletions

### 5. **Token Expiration Handling**

**Challenge:** Managing JWT expiration and invalid tokens gracefully.

**Solution:**

- Try-catch blocks around token verification
- Clear error messages for expired vs invalid tokens
- Frontend can handle token refresh based on error type

### 6. **Account Deletion with Data Integrity**

**Challenge:** Safely deleting user accounts while maintaining database integrity and cleaning up all related data.

**Solution:**

- Implemented cascade deletion logic:
  - Delete all projects owned by the user
  - Delete all tasks within those projects
  - Remove user from collaborators in other projects
  - Finally delete the user account
- Transaction-like approach ensures complete cleanup
- Preserves other users' projects and data
- GDPR/privacy compliance through complete data removal

---

## 🚀 Future Improvements

### Short-term Enhancements

1. **Input Validation Library**
   - Implement express-validator for robust input validation
   - Add sanitization for XSS prevention

2. **Task Filtering & Sorting**
   - Filter tasks by status, priority, due date
   - Sort tasks by multiple criteria
   - Search functionality for tasks and projects

3. **Due Date Features**
   - Email notifications for approaching deadlines
   - Overdue task highlighting
   - Calendar view integration

4. **Task Assignment**
   - Assign specific tasks to collaborators
   - Track task ownership within projects

### Long-term Roadmap

1. **Advanced Features**
   - Subtasks and task dependencies
   - File attachments for tasks
   - Activity logs and audit trails
   - Real-time updates with WebSockets

2. **Performance Optimization**
   - Implement caching with Redis
   - Database indexing for frequently queried fields
   - Pagination for large datasets
   - Rate limiting for API protection

3. **Testing & Quality**
   - Unit tests with Jest
   - Integration tests for API endpoints
   - E2E testing suite
   - CI/CD pipeline implementation

4. **Enhanced Security**
   - Refresh token implementation
   - OAuth integration (Google, GitHub)
   - Two-factor authentication
   - Role-based access control (RBAC) expansion

5. **Analytics & Reporting**
   - Project completion metrics
   - User activity dashboards
   - Time tracking integration
   - Export functionality (PDF, CSV)

---

## 🌐 Demo & API Endpoints

### Base URL

```
Production: https://taskpro-backend.onrender.com
Local: http://localhost:5000
```

### User Routes

```http
POST   /api/user/register          # Register new user
POST   /api/user/login             # Login user
GET    /api/user/profile           # Get current user profile
PUT    /api/user/profile           # Update user profile (username, email)
PUT    /api/user/update-password   # Change password
DELETE /api/user/account           # Delete account (cascade)
```

### Project Routes

```http
POST   /api/projects                    # Create project
GET    /api/projects                    # Get all user's projects
GET    /api/projects/:id                # Get specific project
PUT    /api/projects/:id                # Update project (owner only)
DELETE /api/projects/:id                # Delete project (owner only)
POST   /api/projects/:id/collaborators  # Add collaborator
DELETE /api/projects/:id/collaborators  # Remove collaborator
```

### Task Routes

```http
POST   /api/projects/:projectId/tasks   # Create task in project
GET    /api/projects/:projectId/tasks   # Get all project tasks
GET    /api/tasks/:id                   # Get specific task
PUT    /api/tasks/:id                   # Update task
DELETE /api/tasks/:id                   # Delete task
```

### Example Requests

**Create a Task with Due Date:**

```json
POST /api/projects/507f1f77bcf86cd799439011/tasks
Authorization: Bearer <token>

{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "In Progress",
  "priority": "High",
  "dueDate": "2026-02-15",
  "tags": ["documentation", "priority"]
}
```

**Response:**

```json
{
  "_id": "507f191e810c19729de860ea",
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "In Progress",
  "priority": "High",
  "dueDate": "2026-02-15T00:00:00.000Z",
  "project": "507f1f77bcf86cd799439011",
  "tags": ["documentation", "priority"],
  "comments": [],
  "createdAt": "2026-02-04T10:30:00.000Z",
  "updatedAt": "2026-02-04T10:30:00.000Z"
}
```

---

## 🎓 What I Learned

### Technical Skills

- Building RESTful APIs with Express.js
- MongoDB schema design and relationships
- JWT authentication implementation
- Middleware pattern and custom middleware creation
- Error handling best practices
- Security considerations in web applications

### Software Engineering Practices

- MVC architecture implementation
- Code organization and modularity
- API design principles
- Version control with Git
- Environment configuration management
- Documentation importance

### Problem Solving

- Debugging asynchronous code
- Managing data relationships in NoSQL
- Implementing authorization logic
- Balancing security and usability
- Planning scalable architecture

---

## 📝 Conclusion

TaskPro Backend demonstrates a complete understanding of:

- **Backend development fundamentals** with Node.js and Express
- **Database design** with MongoDB and Mongoose
- **Security practices** with JWT and bcrypt
- **RESTful API design** principles
- **Collaborative features** implementation

The project is production-ready, deployed, and actively maintained with ongoing improvements planned.

**Repository:** [GitHub Link]  
**Live API:** https://taskpro-backend.onrender.com  
**Frontend:** [Frontend Repository/URL if applicable]

---

## ❓ Questions & Discussion

Thank you for your attention! I'm happy to answer any questions about:

- Technical implementation details
- Design decisions and trade-offs
- Challenges overcome
- Future development plans
- Deployment and DevOps

---

_Developed by: [Your Name]_  
_Course: Per Scholas - Full-Stack Development_  
_Date: February 2026_
