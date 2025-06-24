# Task Pilot

A full-stack project management platform for teams and organizations. Built with React, Node.js, Express, MongoDB, Tailwind CSS, and Ant Design.

## Features
- User authentication (JWT, roles: admin, manager, employee)
- Project CRUD (create, read, update, delete)
- Task management within projects (statuses: To Do, Doing, Testing, Completed)
- Role-based access control
- Responsive, modern UI (light/dark mode, icons, Ant Design, Tailwind)
- Real-time feedback with notifications

## Tech Stack
- **Frontend:** React, Tailwind CSS, Ant Design, React Router, Axios
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or Atlas)

### Installation
1. **Clone the repo:**
   ```sh
   git clone <your-repo-url>
   cd project-management
   ```
2. **Install dependencies:**
   ```sh
   cd server && npm install
   cd ../client && npm install
   ```
3. **Configure environment:**
   - In `server/`, create a `.env` file:
     ```env
     MONGO_URI=mongodb://localhost:27017/taskpilot
     JWT_SECRET=your_jwt_secret
     PORT=5000
     ```
4. **Run the backend:**
   ```sh
   cd server
   node index.js
   ```
5. **Run the frontend:**
   ```sh
   cd client
   npm start
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000)

## API Documentation

### Auth
- `POST /api/auth/signup` — Register a new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user info (auth required)

### Projects
- `GET /api/projects` — List all projects (auth required)
- `POST /api/projects` — Create project (admin/manager)
- `GET /api/projects/:id` — Get project by ID
- `PUT /api/projects/:id` — Update project (admin/manager)
- `DELETE /api/projects/:id` — Delete project (admin/manager)
- `GET /api/projects/:id/progress` — Get project progress

### Tasks
- `GET /api/tasks/project/:projectId` — List tasks for a project
- `POST /api/tasks` — Create task
- `PUT /api/tasks/:id` — Update task
- `DELETE /api/tasks/:id` — Delete task
- `PATCH /api/tasks/:id/toggle` — Cycle task status

## Postman Collection
A ready-to-import Postman collection is provided in `postman_collection.json` in the root directory. Import it into Postman to test all endpoints easily.

## License
MIT

---

For any issues, please open an issue or contact the maintainer.
