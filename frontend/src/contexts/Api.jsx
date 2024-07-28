import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { createContext, useContext } from 'react';
import { useDispatch } from 'react-redux';

import {
  setAuthenticated,
  setUnAuthenticated,
} from '../store/slices/authSlice';

const ApiContext = createContext();
const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
});

export const useApi = () => {
  const api = useContext(ApiContext);
  if (!api) {
    throw new Error('useApi must be used within a ApiProvider');
  }

  return api;
};

export const ApiProvider = ({ children }) => {
  const dispatch = useDispatch();

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && !error.config._retry) {
        error.config._retry = true;

        try {
          const response = await api.post('/auth/refresh');
          const token = response.data.accessToken;
          const decodedToken = jwtDecode(token);

          const userResponse = await api.get(
            `/users/${encodeURIComponent(decodedToken._id)}`
          );
          const user = userResponse.data;
          dispatch(setAuthenticated({ token, user }));
          error.config.headers['Authorization'] = `Bearer ${token}`;

          return api.request(error.config);
        } catch (refreshError) {
          dispatch(setUnAuthenticated());
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};
