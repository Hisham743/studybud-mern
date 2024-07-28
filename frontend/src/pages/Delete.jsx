import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';

import useFetchData from '../hooks/useFetchData';
import useHandleAxiosError from '../hooks/useHandleAxiosError';
import { useApi } from '../contexts/Api';
import { useSocket } from '../contexts/Socket';
import { setErrors } from '../store/slices/errorsSlice';

export default function Delete({ object: objectName }) {
  const api = useApi();
  const socket = useSocket();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const {
    isAuthenticated,
    user: currentUser,
    token,
  } = useSelector((state) => state.auth.value);

  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isAuthenticated) {
        navigate('/login');
        dispatch(setErrors(['You need to login first']));
      }

      setAuthCheckComplete(true);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, dispatch, navigate]);

  const [object, setObject] = useState(null);
  const isLoading = useFetchData({
    path: `/${
      objectName === 'room' ? 'rooms' : 'messages'
    }/${encodeURIComponent(id)}`,
    stateSetter: setObject,
  });

  useEffect(() => {
    if (!isLoading) {
      if (!object) navigate('/');
      else if (
        authCheckComplete &&
        currentUser?._id !==
          object[objectName === 'room' ? 'host' : 'sender']._id
      ) {
        navigate('/');
        dispatch(
          setErrors([
            objectName === 'room'
              ? 'You cannot delete a room hosted by someone else'
              : "You cannot delete someone else's message",
          ])
        );
      }
    }
  }, [
    isLoading,
    authCheckComplete,
    object,
    objectName,
    currentUser,
    navigate,
    dispatch,
  ]);

  const handleAxiosError = useHandleAxiosError();
  const handleSubmit = (e) => {
    e.preventDefault();
    if (objectName === 'room') {
      api
        .delete(`/rooms/${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          navigate('/');
          dispatch(setErrors(['Room deleted successfully']));
        })
        .catch((error) => {
          navigate(`/room/${encodeURIComponent(id)}`);
          handleAxiosError(error);
        });
    } else {
      api
        .patch(
          `/messages/${encodeURIComponent(id)}`,
          { isDeleted: true },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
          socket.emit('delete msg', object);
          dispatch(setErrors(['Message deleted successfully']));
        })
        .catch((error) => {
          handleAxiosError(error);
        })
        .finally(() =>
          navigate(`/room/${encodeURIComponent(object.room._id)}`)
        );
    }
  };

  return !authCheckComplete ? (
    <></>
  ) : (
    <main className="delete-item layout">
      <div className="container">
        <div className="layout__box">
          <div className="layout__boxHeader">
            <div className="layout__boxTitle">
              <Link onClick={() => navigate(-1)}>
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                >
                  <title>arrow-left</title>
                  <path d="M13.723 2.286l-13.723 13.714 13.719 13.714 1.616-1.611-10.96-10.96h27.625v-2.286h-27.625l10.965-10.965-1.616-1.607z"></path>
                </svg>
              </Link>
              <h3>Back</h3>
            </div>
          </div>
          <div className="layout__body">
            <form className="form" onSubmit={handleSubmit}>
              <div className="form__group">
                <p>Are you sure you want to delete &#34;{objectName}&#34;?</p>
              </div>

              <div className="for__group">
                <input
                  className="btn btn--main"
                  type="submit"
                  value="Confirm"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
