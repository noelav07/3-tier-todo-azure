# Modern Todo List Application

A full-stack Todo List application built with a 3-tier architecture, featuring a modern UI and real-time updates.

## Architecture

This application follows a 3-tier architecture:

1. **Frontend (Presentation Layer)**
   - Pure JavaScript, HTML, and CSS
   - Modern, responsive UI with dark/light theme support
   - Real-time updates and smooth animations

2. **Backend (Application Layer)**
   - Node.js with Express
   - RESTful API endpoints
   - Input validation and error handling

3. **Database (Data Layer)**
   - PostgreSQL database
   - Efficient data storage and retrieval

## Features

-  Modern, responsive UI
-  Dark/Light theme toggle
-  Add, edit, and delete todos
-  Mobile-friendly design
-  Real-time updates
-  Smooth animations
-  Filter todos by status
-  Clear completed todos
-  Todo statistics

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Modern web browser

## Project Structure

```
.
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── config/
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo-app
   ```

2. **Set up the database**
   ```bash
   # Create a PostgreSQL database
   createdb todo_db
   ```

3. **Configure the backend**
   ```bash
   cd backend
   npm install
   # Create a .env file with your database credentials
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

5. **Open the frontend**
   - Open `frontend/index.html` in your browser
   - Or serve it using a local server

## API Endpoints

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `PATCH /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo
- `DELETE /api/todos/clear-completed` - Clear completed todos

## Development

### Frontend Development
- The frontend is built with vanilla JavaScript
- No build process required
- Just edit the files in the `frontend` directory

### Backend Development
```bash
cd backend
npm install
npm run dev
```

