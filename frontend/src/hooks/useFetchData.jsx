import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import useHandleAxiosError from './useHandleAxiosError';
import { useApi } from '../contexts/Api';

export default function useFetchData(options) {
  const {
    path,
    params = {},
    dispatchAction,
    stateSetter,
    dependencies = [],
  } = options;

  const api = useApi();
  const dispatch = useDispatch();
  const handleAxiosError = useHandleAxiosError();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await api
        .get(path, { params })
        .then((response) => {
          dispatchAction
            ? dispatch(dispatchAction(response.data))
            : stateSetter(response.data);
        })
        .catch((error) => handleAxiosError(error))
        .finally(() => setIsLoading(false));
    };

    fetchData();
  }, [
    api,
    dispatch,
    handleAxiosError,
    path,
    JSON.stringify(params),
    dispatchAction,
    stateSetter,
    ...dependencies,
  ]);

  return isLoading;
}
