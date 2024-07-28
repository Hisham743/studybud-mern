import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import defaultAvatar from '../assets/avatar.svg';
import useFetchData from '../hooks/useFetchData';
import Topics from '../components/Topics';
import Feed from '../components/Feed';
import Activities from '../components/Activities';

export default function UserProfile() {
  const { user: currentUser } = useSelector((state) => state.auth.value);
  const { id } = useParams();

  const [user, setUser] = useState({});
  const isLoading = useFetchData({
    path: `/users/${encodeURIComponent(id)}`,
    stateSetter: setUser,
  });

  return isLoading ? (
    <></>
  ) : (
    <main className="profile-page layout layout--3">
      <div className="container">
        <Topics />

        <div className="roomList">
          <div className="profile">
            <div className="profile__avatar">
              <div className="avatar avatar--large active">
                <img src={user.avatar || defaultAvatar} />
              </div>
            </div>
            <div className="profile__info">
              <h3>{user.name}</h3>
              <p>@{user.username}</p>
              {currentUser?._id === user._id ? (
                <Link
                  to={`/edit-profile/${user._id}`}
                  className="btn btn--main btn--pill"
                >
                  Edit Profile
                </Link>
              ) : null}
            </div>
            {user.bio ? (
              <div className="profile__about">
                <h3>About</h3>
                <p>{user.bio}</p>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="roomList__header">
            <div>
              <h2>Study Rooms Hosted by {user.username}</h2>
            </div>
          </div>

          <Feed page="profile" userId={id} />
        </div>

        <Activities page="profile" userId={id} />
      </div>
    </main>
  );
}
