import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import useFetchData from '../hooks/useFetchData';

export default function Topics() {
  const [topicQuery, setTopicQuery] = useState('');
  const [topics, setTopics] = useState([]);

  const isLoading = useFetchData({
    path: '/topics',
    stateSetter: setTopics,
  });

  const totalRoomCount = topics.reduce((acc, currentValue) => {
    return acc + currentValue.roomCount;
  }, 0);

  const navigate = useNavigate();
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      navigate(`/?topic=${encodeURIComponent(topicQuery)}`);
    }
  };

  return isLoading ? (
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
              <h3>Browse Topics</h3>
            </div>
          </div>

          <div className="topics-page layout__body">
            <form className="header__search">
              <label>
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                >
                  <title>search</title>
                  <path d="M32 30.586l-10.845-10.845c1.771-2.092 2.845-4.791 2.845-7.741 0-6.617-5.383-12-12-12s-12 5.383-12 12c0 6.617 5.383 12 12 12 2.949 0 5.649-1.074 7.741-2.845l10.845 10.845 1.414-1.414zM12 22c-5.514 0-10-4.486-10-10s4.486-10 10-10c5.514 0 10 4.486 10 10s-4.486 10-10 10z"></path>
                </svg>

                <input
                  type="search"
                  autoFocus
                  value={topicQuery}
                  name="query"
                  placeholder="Search topics"
                  onChange={(e) => setTopicQuery(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e)}
                />
              </label>
            </form>

            <ul className="topics__list">
              <li>
                <Link to="/" className="active">
                  All <span>{totalRoomCount}</span>
                </Link>
              </li>
              {topics.map(
                (topic, index) =>
                  topic.name
                    .toLowerCase()
                    .includes(topicQuery.toLocaleLowerCase()) && (
                    <li key={index}>
                      <Link to={`/?topic=${encodeURIComponent(topic.name)}`}>
                        {topic.name} <span>{topic.roomCount}</span>
                      </Link>
                    </li>
                  )
              )}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
