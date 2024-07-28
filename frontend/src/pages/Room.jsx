import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import useFetchData from '../hooks/useFetchData';
import defaultAvatar from '../assets/avatar.svg';
import useHandleAxiosError from '../hooks/useHandleAxiosError';
import { useApi } from '../contexts/Api';
import { useSocket } from '../contexts/Socket';
import { setErrors } from '../store/slices/errorsSlice';

export default function Room() {
  const api = useApi();
  const socket = useSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleAxiosError = useHandleAxiosError();

  const { user: currentUser, token } = useSelector((state) => state.auth.value);
  const { id } = useParams();

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const conversationThread = useRef(null);

  const isLoadingRoom = useFetchData({
    path: `/rooms/${encodeURIComponent(id)}`,
    stateSetter: setRoom,
  });
  const isLoadingMessages = useFetchData({
    path: `/rooms/${encodeURIComponent(id)}/messages`,
    stateSetter: setMessages,
  });

  useEffect(() => {
    if (!isLoadingRoom) {
      if (!room) {
        navigate('/');
        dispatch(setErrors(['Room does not exist or was deleted by the host']));
      } else {
        socket.emit('join room', room._id);
        socket.on('receive msg', (msg) => {
          setMessages((messages) => [msg, ...messages]);
          if (
            room.participants.every(
              (participant) => participant._id != msg.sender._id
            )
          ) {
            setRoom((room) => {
              return {
                ...room,
                participants: [...room.participants, msg.sender],
              };
            });
          }
        });
        socket.on('remove msg', (msg) => {
          setMessages((messages) => {
            const index = messages.findIndex(
              (message) => message._id === msg._id
            );
            return [
              ...messages.slice(0, index),
              {
                ...messages[index],
                isDeleted: true,
                body: 'This message was deleted',
              },
              ...messages.slice(index + 1),
            ];
          });
        });

        return () => {
          socket.emit('leave room', room._id);
          socket.off('recieve msg');
          socket.off('add participant');
        };
      }
    }
  }, [dispatch, navigate, isLoadingRoom, room, socket]);

  const [inputMessage, setInputMessage] = useState('');
  const handleMessageTyping = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await api
        .post(
          `/rooms/${encodeURIComponent(id)}/messages`,
          { body: inputMessage },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => socket.emit('send msg', response.data))
        .catch((error) => {
          if (error.response.status === 401) navigate('/login');
          handleAxiosError(error);
        })
        .finally(() => {
          setInputMessage('');
        });
    }
  };

  useEffect(() => {
    conversationThread.current?.scrollTo({
      top: conversationThread.current.scrollHeight,
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }, [messages, conversationThread]);

  return isLoadingRoom || isLoadingMessages || !room ? (
    <></>
  ) : (
    <main className="profile-page layout layout--2">
      <div className="container">
        <div className="room">
          <div className="room__top">
            <div className="room__topLeft">
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
              <h3>Study Room</h3>
            </div>

            {currentUser?._id === room.host._id ? (
              <div className="room__topRight">
                <Link to={`/update-room/${room._id}`}>
                  <svg
                    enableBackground="new 0 0 24 24"
                    height="32"
                    viewBox="0 0 24 24"
                    width="32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>edit</title>
                    <g>
                      <path d="m23.5 22h-15c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h15c.276 0 .5.224.5.5s-.224.5-.5.5z" />
                    </g>
                    <g>
                      <g>
                        <path d="m2.5 22c-.131 0-.259-.052-.354-.146-.123-.123-.173-.3-.133-.468l1.09-4.625c.021-.09.067-.173.133-.239l14.143-14.143c.565-.566 1.554-.566 2.121 0l2.121 2.121c.283.283.439.66.439 1.061s-.156.778-.439 1.061l-14.142 14.141c-.065.066-.148.112-.239.133l-4.625 1.09c-.038.01-.077.014-.115.014zm1.544-4.873-.872 3.7 3.7-.872 14.042-14.041c.095-.095.146-.22.146-.354 0-.133-.052-.259-.146-.354l-2.121-2.121c-.19-.189-.518-.189-.707 0zm3.081 3.283h.01z" />
                      </g>
                      <g>
                        <path d="m17.889 10.146c-.128 0-.256-.049-.354-.146l-3.535-3.536c-.195-.195-.195-.512 0-.707s.512-.195.707 0l3.536 3.536c.195.195.195.512 0 .707-.098.098-.226.146-.354.146z" />
                      </g>
                    </g>
                  </svg>
                </Link>
                <Link to={`/delete-room/${room._id}`}>
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
          <div className="room__box scroll">
            <div className="room__header scroll">
              <div className="room__info">
                <h3>{room.name}</h3>
                <span>
                  {formatDistanceToNow(room.createdAt, { addSuffix: true })}
                </span>
              </div>
              <div className="room__hosted">
                <p>Hosted By</p>
                <Link
                  to={`/user-profile/${encodeURIComponent(room.host._id)}`}
                  className="room__author"
                >
                  <div
                    className={`avatar avatar--small ${
                      currentUser?._id === room.host._id ? 'active' : ''
                    }`}
                  >
                    <img src={room.host.avatar || defaultAvatar} />
                  </div>
                  <span>@{room.host.username}</span>
                </Link>
              </div>
              <div className="room__details">{room.description}</div>
              <span className="room__topics">{room.topic.name}</span>
            </div>

            <div className="room__conversation">
              <div ref={conversationThread} className="threads scroll">
                {[...messages].reverse().map((message, index) => (
                  <div key={index} className="thread">
                    <div className="thread__top">
                      <div className="thread__author">
                        <Link
                          to={`/user-profile/${encodeURIComponent(
                            message.sender._id
                          )}`}
                          className="thread__authorInfo"
                        >
                          <div
                            className={`avatar avatar--small ${
                              currentUser?._id === message.sender._id
                                ? 'active'
                                : ''
                            }`}
                          >
                            <img src={message.sender.avatar || defaultAvatar} />
                          </div>
                          <span>@{message.sender.username}</span>
                        </Link>
                        <span className="thread__date">
                          {formatDistanceToNow(message.createdAt, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      {currentUser?._id === message.sender._id &&
                      !message.isDeleted ? (
                        <div className="thread__delete">
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
                    <div className="thread__details">{message.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="room__message">
            <form>
              <input
                autoFocus
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                name="body"
                placeholder="Write your message here..."
                onKeyDown={handleMessageTyping}
              />
            </form>
          </div>
        </div>

        <div className="participants">
          <h3 className="participants__top">
            Participants <span>({room.participants.length} Joined)</span>
          </h3>
          <div className="participants__list scroll">
            {room.participants.map((participant, index) => (
              <Link
                key={index}
                to={`/user-profile/${participant._id}`}
                className="participant"
              >
                <div
                  className={`avatar avatar--medium ${
                    currentUser?._id === participant._id ? 'active' : ''
                  }`}
                >
                  <img src={participant.avatar || defaultAvatar} />
                </div>
                <p>
                  {participant.name}
                  <span>@{participant.username}</span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
