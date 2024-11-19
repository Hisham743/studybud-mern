# StudyBud MERN

This project is a MERN (MongoDB, Express.js, React, Node.js) stack reimplementation of the StudyBud project, originally created by [Traversy Media](https://www.youtube.com/@TraversyMedia) as a Django tutorial.

## Important Note

This project is a learning exercise and is not an original work. It closely follows the structure, features, and design of the original StudyBud project, with the primary difference being the technology stack used for implementation.

- The original project: Django-based StudyBud by Traversy Media
- This version: MERN stack implementation

The purpose of this project is educational, demonstrating how to implement the same functionality in a different technology stack. It is not intended for commercial use or as an original product.

### Code Attribution

- Backend: Reimplemented in Node.js/Express.js (original work)
- Frontend JavaScript/JSX: Reimplemented in React (original work)
- HTML: Adapted from the original project's Django templates to JSX
- CSS: Used directly from the original project
- Features and functionality: Mirror the original project

For the original Django tutorial and project, please visit: [Python Django 7 Hour Course](https://www.youtube.com/watch?v=PtQiiknWUcI)

## Project Structure

The project is divided into two main parts:

1. Backend (Node.js/Express.js)
2. Frontend (React/Vite)

## Prerequisites

- Node.js
- MongoDB
- npm
- Docker (optional, for containerized deployment)

## Installation

### Local Development

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   cd backend && npm install
   cd frontend && npm install
   ```

### Docker Deployment

Alternatively, you can use Docker for easy deployment:

```bash
docker-compose up --build
```

## Configuration

### Backend (.env file in the backend directory)

Create a `.env` file in the backend directory with the following variables:

```
DB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
JWT_SECRET=your_jwt_secret
FRONTEND_ORIGIN=http://localhost:3000
PORT=4000
NODE_ENV="development"
```

### Frontend Environment Files

Create two environment files in the frontend directory:

- `.env.development`
- `.env.production`

With the following variables:

```
VITE_BACKEND_URL=http://localhost:4000
PORT=3000
```

### Root Environment File (for Docker)

Create a `.env` file in the project root for docker port forwarding configuration:

```
BACKEND_PORT=4000
FRONTEND_PORT=3000
```

> **Important Note:** Ensure that the `PORT` values in `/backend/.env` and `/frontend/.env.production` match the `BACKEND_PORT` and `FRONTEND_PORT` values in the root `.env` file. This is crucial for consistent port mapping in Docker and local development.

## Running the Application

### Local Development

To run both the backend and frontend concurrently:

```bash
npm run dev
```

To run the backend only:

```bash
npm run backend
```

To run the frontend only:

```bash
npm run frontend
```

### Docker Deployment

```bash
docker-compose up
```

## Features

- User authentication (register, login)
- Real-time messaging using Socket.IO
- Room creation and management
- User profiles
- Topics and activities

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO
- JSON Web Tokens (JWT) for authentication
- Cloudinary for image storage and management

### Frontend

- React
- Vite
- React Router
- Redux Toolkit
- Axios
- Socket.IO Client

### DevOps

- Docker
- Docker Compose

## API Endpoints

The backend provides various API endpoints for users, rooms, messages, topics, and authentication. You can view all available endpoints by making a GET request to `/api` when the server is running.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Note: The license applies to the MERN implementation code. The HTML structure (adapted to JSX), CSS styles, and overall project structure are derived from the original StudyBud project by Traversy Media and may be subject to different terms.
