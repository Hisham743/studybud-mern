import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import defaultAvatar from '../assets/avatar.svg';
import useFetchData from '../hooks/useFetchData';

export default function Activities({ page, userId }) {
  const { user: currentUser } = useSelector((state) => state.auth.value);

  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);

  const isLoading = useFetchData({
    ...(page !== 'profile'
      ? { path: '/messages', dependencies: [searchParams] }
      : {
          path: `/users/${encodeURIComponent(userId)}/messages`,
          dependencies: [searchParams, userId],
        }),

    params: {
      query: searchParams.get('query'),
      topic: searchParams.get('topic'),
    },
    stateSetter: setMessages,
  });

  return isLoading ? (
    <></>
  ) : (
    <div className="activities">
      <div className="activities__header">
        <h2>Recent Activities</h2>
      </div>

      {messages.map((message, index) => (
        <div key={index} className="activities__box">
          <div className="activities__boxHeader roomListRoom__header">
            <Link
              to={`/user-profile/${encodeURIComponent(message.sender._id)}`}
              className="roomListRoom__author"
            >
              <div
                className={`avatar avatar--small ${
                  currentUser?._id === message.sender._id ? 'active' : ''
                }`}
              >
                <img src={message.sender.avatar || defaultAvatar} />
              </div>
              <p>
                @{message.sender.username}
                <span>
                  {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                </span>
              </p>
            </Link>
            {currentUser?._id === message.sender._id && !message.isDeleted ? (
              <div className="roomListRoom__actions">
                <Link to={`/delete-message/${message._id}`}>
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                  >
                    <title>remove</title>
                    <path d="M27.314 6.019l-1.333-1.333-9.98 9.981-9.981-9.981-1.333 1.333 9.981 9.981-9.981 9.98 1.333 1.333 9.981-9.98 9.98 9.98 1.333-1.333-9.98-9.98 9.98-9.981z"></path>
                  </svg>
                </Link>
              </div>
            ) : null}
          </div>
          <div className="activities__boxContent">
            <p>replied to post</p>
            <p>
              <Link to={`/room/${encodeURIComponent(message.room._id)}`}>
                “{message.room.name}”
              </Link>
            </p>
            <div className="activities__boxRoomContent">
              {message.body.length <= 100
                ? message.body
                : `${message.body.substring(0, 100)}...`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
