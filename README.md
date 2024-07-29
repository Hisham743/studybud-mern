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

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   cd backend && npm install
   cd frontend && npm install
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

### Frontend (.env file in the frontend directory)

Create a `.env` file in the frontend directory with the following variable:

```
VITE_BACKEND_URL=http://localhost:4000
```

## Running the Application

To run both the backend and frontend concurrently:

```
npm run dev
```

To run the backend only:

```
npm run backend
```

To run the frontend only:

```
npm run frontend
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

## API Endpoints

The backend provides various API endpoints for users, rooms, messages, topics, and authentication. You can view all available endpoints by making a GET request to `/api` when the server is running.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Note: The license applies to the MERN implementation code. The HTML structure (adapted to JSX), CSS styles, and overall project structure are derived from the original StudyBud project by Traversy Media and may be subject to different terms.
