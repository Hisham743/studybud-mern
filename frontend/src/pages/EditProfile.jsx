import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import defaultAvatar from '../assets/avatar.svg';
import useFetchData from '../hooks/useFetchData';
import useHandleAxiosError from '../hooks/useHandleAxiosError';
import { useApi } from '../contexts/Api';
import { setErrors } from '../store/slices/errorsSlice';
import { setCurrentUser } from '../store/slices/authSlice';

export default function EditProfile() {
  const photoPreview = document.querySelector('#preview-avatar');

  const api = useApi();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    isAuthenticated,
    user: currentUser,
    token,
  } = useSelector((state) => state.auth.value);
  const { id } = useParams();

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

  const [user, setUser] = useState(null);
  const isLoadingUser = useFetchData({
    path: `/users/${encodeURIComponent(id)}`,
    stateSetter: setUser,
  });

  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (!isLoadingUser) {
      if (!user) navigate('/');
      else if (authCheckComplete && currentUser?._id !== user._id) {
        navigate('/');
        dispatch(setErrors(['You cannot alter other user accounts']));
      } else {
        setName(user.name);
        setUsername(user.username);
        setEmail(user.email);
        setBio(user.bio ?? '');
      }
    }
  }, [
    isLoadingUser,
    authCheckComplete,
    user,
    currentUser,
    photoPreview,
    navigate,
    dispatch,
  ]);

  const handleAxiosError = useHandleAxiosError();
  const [isProcessing, setIsProcessing] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isProcessing) {
      setIsProcessing(true);
      api
        .patch(
          `/users/${encodeURIComponent(id)}`,
          { name, username, email, bio, avatar },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        )
        .then((response) => {
          navigate(`/user-profile/${encodeURIComponent(id)}`);
          dispatch(setErrors([`Profile updated successfully`]));
          dispatch(setCurrentUser(response.data));
        })
        .catch((error) => handleAxiosError(error))
        .finally(() => setIsProcessing(false));
    }
  };

  return isLoadingUser || !authCheckComplete ? (
    <></>
  ) : (
    <main className="update-account layout">
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
              <h3>Edit your profile</h3>
            </div>
          </div>
          <div className="layout__body">
            <form className="form" onSubmit={handleSubmit}>
              <div className="form__group form__avatar profile__avatar">
                <div className="avatar avatar--large active">
                  <img
                    id="preview-avatar"
                    src={user.avatar || defaultAvatar}
                    alt="Avatar preview"
                  />
                </div>
                <label
                  onClick={() =>
                    navigate(`/user-profile/${encodeURIComponent(id)}`)
                  }
                >
                  {user.username}
                </label>
                <input
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  id="avatar"
                  name="avatar"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    // 5 MB
                    if (file.size > 5242880) {
                      dispatch(
                        setErrors(['Image file should be of less than 5MB'])
                      );
                    } else {
                      photoPreview.src = URL.createObjectURL(file);
                      setAvatar(file);
                    }
                  }}
                />
              </div>

              <div className="form__group">
                <label>Name</label>
                <input
                  required
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>

              <div className="form__group">
                <label>Username</label>
                <input
                  required
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>

              <div className="form__group">
                <label>Email</label>
                <input
                  required
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="form__group">
                <label>Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className="form__action">
                <Link className="btn btn--dark" onClick={() => navigate(-1)}>
                  Cancel
                </Link>
                <button
                  disabled={isProcessing}
                  className="btn btn--main"
                  type="submit"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
