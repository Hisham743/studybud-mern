import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useApi } from '../contexts/Api';
import { setUnAuthenticated } from '../store/slices/authSlice';

export default function useLogout() {
  const api = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = async () => {
    dispatch(setUnAuthenticated());
    await api.post('/auth/logout');
    navigate('/');
  };

  return logout;
}
