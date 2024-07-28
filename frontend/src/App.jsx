import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Navbar from './components/Navbar.jsx';
import Errors from './components/Errors.jsx';
import Home from './pages/Home.jsx';
import Topics from './pages/Topics.jsx';
import Activities from './pages/Activities.jsx';
import Room from './pages/Room.jsx';
import CreateUpdateRoom from './pages/CreateUpdateRoom.jsx';
import Delete from './pages/Delete.jsx';
import RegisterLogin from './pages/RegisterLogin.jsx';
import UserProfile from './pages/UserProfile.jsx';
import EditProfile from './pages/EditProfile.jsx';
import useRefreshAuth from './hooks/useRefreshAuth.jsx';
import { SocketProvider } from './contexts/Socket.jsx';
import { setErrors } from './store/slices/errorsSlice.js';

export default function App() {
  const dispatch = useDispatch();
  const refreshAuth = useRefreshAuth();
  const errors = useSelector((state) => state.errors.value);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(setErrors([]));
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [dispatch, errors]);

  return (
    <BrowserRouter>
      <Navbar />
      <Errors />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/topics" element={<Topics />} />
        <Route path="/activities" element={<Activities />} />

        <Route
          path="/delete-message/:id"
          element={
            <SocketProvider>
              <Delete object="message" />
            </SocketProvider>
          }
        />

        <Route
          path="/room/:id"
          element={
            <SocketProvider>
              <Room />
            </SocketProvider>
          }
        />
        <Route
          path="/create-room"
          element={<CreateUpdateRoom page="create" />}
        />
        <Route
          path="/update-room/:id"
          element={<CreateUpdateRoom page="update" />}
        />
        <Route path="/delete-room/:id" element={<Delete object="room" />} />

        <Route path="/register" element={<RegisterLogin page="register" />} />
        <Route path="/login" element={<RegisterLogin page="login" />} />
        <Route path="/user-profile/:id" element={<UserProfile />} />
        <Route path="/edit-profile/:id" element={<EditProfile />} />
      </Routes>
    </BrowserRouter>
  );
}
