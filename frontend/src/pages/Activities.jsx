import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { useSelector } from 'react-redux';

import defaultAvatar from '../assets/avatar.svg';
import useFetchData from '../hooks/useFetchData';

export default function Activities() {
  const { user: currentUser } = useSelector((state) => state.auth.value);

  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);

  const isLoading = useFetchData({
    path: '/messages',
    params: {
      query: searchParams.get('query'),
      topic: searchParams.get('topic'),
    },
    stateSetter: setMessages,
    dependencies: [searchParams],
  });

  return isLoading ? (
    <></>
  ) : (
    <main className="layout">
      <div className="container">
        <div className="layout__box">
          <div className="layout__boxHeader">
            <div className="layout__boxTitle">
              <Link to="/">
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
              <h3>Recent Activities</h3>
            </div>
          </div>

          <div className="activities-page layout__body">
            {messages.map((message, index) => (
              <div key={index} className="activities__box">
                <div className="activities__boxHeader roomListRoom__header">
                  <Link
                    to={`/user-profile/${encodeURIComponent(
                      message.sender._id
                    )}`}
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
                        {formatDistanceToNow(message.createdAt, {
                          addSuffix: true,
                        })}
                      </span>
                    </p>
                  </Link>
                  {currentUser?._id === message.sender._id &&
                  !message.isDeleted ? (
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
        </div>
      </div>
    </main>
  );
}
