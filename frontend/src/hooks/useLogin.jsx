import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';

import useHandleAxiosError from './useHandleAxiosError';
import { useApi } from '../contexts/Api';
import { setAuthenticated } from '../store/slices/authSlice';
import { setErrors } from '../store/slices/errorsSlice';

export default function useLogin() {
  const api = useApi();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleAxiosError = useHandleAxiosError();

  const login = async (email, password, msg = 'User login successful') => {
    await api
      .post('/auth/login', { email, password })
      .then(async (response) => {
        const token = response.data.accessToken;
        const decodedToken = jwtDecode(token);

        let user;
        await api
          .get(`/users/${encodeURIComponent(decodedToken._id)}`)
          .then((response) => (user = response.data));

        dispatch(setAuthenticated({ token, user }));
        navigate('/');
        dispatch(setErrors([msg]));
      })
      .catch((error) => handleAxiosError(error));
  };

  return login;
}
