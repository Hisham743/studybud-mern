import useHandleAxiosError from './useHandleAxiosError';
import useLogin from './useLogin';

import { useApi } from '../contexts/Api';

export default function useRegister() {
  const api = useApi();
  const handleAxiosError = useHandleAxiosError();
  const login = useLogin();

  const register = async (name, username, email, password) => {
    await api
      .post('/users', { name, username, email, password })
      .then(
        async () => await login(email, password, 'User registered successfully')
      )
      .catch((error) => handleAxiosError(error));
  };

  return register;
}
