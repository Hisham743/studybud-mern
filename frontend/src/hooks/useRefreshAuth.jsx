import { jwtDecode } from 'jwt-decode';
import { useDispatch } from 'react-redux';
import { useCallback } from 'react';

import { useApi } from '../contexts/Api';
import {
  setAuthenticated,
  setUnAuthenticated,
} from '../store/slices/authSlice';

export default function useRefreshAuth() {
  const api = useApi();
  const dispatch = useDispatch();

  const refreshAuth = useCallback(async () => {
    let success;

    await api
      .post('/auth/refresh')
      .then(async (response) => {
        const token = response.data.accessToken;
        const decodedToken = jwtDecode(token);

        let user;
        await api
          .get(`/users/${encodeURIComponent(decodedToken._id)}`)
          .then((response) => (user = response.data));

        dispatch(setAuthenticated({ token, user }));
        success = true;
      })
      .catch(() => {
        dispatch(setUnAuthenticated());
        success = false;
      });

    return success;
  }, [api, dispatch]);

  return refreshAuth;
}
