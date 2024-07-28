import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { setErrors } from '../store/slices/errorsSlice';

export default function useHandleAxiosError() {
  const dispatch = useDispatch();

  return useCallback(
    (error) => {
      const errorData = error.response.data;
      const errors = errorData.errors
        ? errorData.errors.map((e) => e.msg)
        : [errorData.msg];
      dispatch(setErrors(errors));
    },
    [dispatch]
  );
}
