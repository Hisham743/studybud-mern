import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import useFetchData from '../hooks/useFetchData';
import useHandleAxiosError from '../hooks/useHandleAxiosError';
import { setErrors } from '../store/slices/errorsSlice';
import { useApi } from '../contexts/Api';

export default function CreateUpdateRoom({ page }) {
  const api = useApi();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleAxiosError = useHandleAxiosError();

  const {
    isAuthenticated,
    user: currentUser,
    token,
  } = useSelector((state) => state.auth.value);
  const { id } = useParams();

  const [topic, setTopic] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [topics, setTopics] = useState([]);
  const isLoadingTopics = useFetchData({
    path: '/topics',
    stateSetter: setTopics,
  });

  const [isLoadingRoom, setIsLoadinRoom] = useState(page === 'update');
  const getRoomAndValidateUser = useCallback(
    async (id) => {
      setIsLoadinRoom(true);
      await api
        .get(`/rooms/${encodeURIComponent(id)}`)
        .then((response) => {
          const room = response.data;
          if (currentUser?._id !== room.host._id) {
            navigate('/');
            dispatch(
              setErrors(['You cannot alter a room hosted by someone else'])
            );
          }

          setTopic(room.topic.name);
          setName(room.name);
          setDescription(room.description ?? '');
        })
        .catch((error) => {
          navigate('/');
          handleAxiosError(error);
        })
        .finally(() => setIsLoadinRoom(false));
    },
    [api, handleAxiosError, navigate, dispatch, currentUser?._id]
  );

  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isAuthenticated) {
        navigate('/login');
        dispatch(setErrors(['You need to login first']));
      } else if (page === 'update') {
        getRoomAndValidateUser(id);
      }

      setAuthCheckComplete(true);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, dispatch, navigate, page, getRoomAndValidateUser, id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (page === 'create') {
      api
        .post(
          '/rooms',
          { topic, name, description },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          navigate(`/room/${encodeURIComponent(response.data._id)}`);
          dispatch(setErrors([`Room created successfully`]));
        })
        .catch((error) => handleAxiosError(error));
    } else {
      api
        .patch(
          `/rooms/${encodeURIComponent(id)}`,
          { topic, name, description },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
          navigate(`/room/${encodeURIComponent(id)}`);
          dispatch(setErrors([`Room updated successfully`]));
        })
        .catch((error) => handleAxiosError(error));
    }
  };

  return !authCheckComplete || isLoadingTopics || isLoadingRoom ? (
    <></>
  ) : (
    <main className="create-room layout">
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
              <h3>Create Study Room</h3>
            </div>
          </div>

          <div className="layout__body">
            <form className="form" onSubmit={handleSubmit}>
              <div className="form__group">
                <label htmlFor="room_topic">Enter a Topic</label>
                <input
                  required
                  autoFocus
                  type="text"
                  id="topic"
                  name="topic"
                  list="topic-list"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                <datalist id="topic-list">
                  <select id="room_topic">
                    {topics.map((topic, index) => (
                      <option key={index} value={topic.name}>
                        topic.name
                      </option>
                    ))}
                  </select>
                </datalist>
              </div>

              <div className="form__group">
                <label>Room Name</label>
                <input
                  required
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form__group">
                <label>Room Description</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form__action">
                <Link className="btn btn--dark" onClick={() => navigate(-1)}>
                  Cancel
                </Link>
                <button className="btn btn--main" type="submit">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
