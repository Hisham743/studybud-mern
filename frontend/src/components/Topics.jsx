import { useState } from 'react';
import { Link } from 'react-router-dom';

import useFetchData from '../hooks/useFetchData';

export default function Topics() {
  const [topics, setTopics] = useState([]);

  const isLoading = useFetchData({
    path: '/topics',
    stateSetter: setTopics,
  });

  const totalRoomCount = topics.reduce((acc, currentValue) => {
    return acc + currentValue.roomCount;
  }, 0);

  return isLoading ? (
    <></>
  ) : (
    <div className="topics">
      <div className="topics__header">
        <h2>Browse Topics</h2>
      </div>
      <ul className="topics__list">
        <li>
          <Link to="/" className="active">
            All <span>{totalRoomCount}</span>
          </Link>
        </li>
        {topics.map((topic, index) => (
          <li key={index}>
            <Link to={`/?topic=${encodeURIComponent(topic.name)}`}>
              {topic.name} <span>{topic.roomCount}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link className="btn btn--link" to="/topics">
        More
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 32 32"
        >
          <title>chevron-down</title>
          <path d="M16 21l-13-13h-3l16 16 16-16h-3l-13 13z"></path>
        </svg>
      </Link>
    </div>
  );
}
