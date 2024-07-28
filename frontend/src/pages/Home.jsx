import { useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';

import Feed from '../components/Feed';
import Topics from '../components/Topics';
import Activities from '../components/Activities';

export default function Home() {
  const rooms = useSelector((state) => state.rooms.value);
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <main className="layout layout--3">
      <div className="container">
        <Topics />

        <div className="roomList">
          <div className="mobile-menu">
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
                  name="query"
                  placeholder="Search for rooms..."
                  type="search"
                  value={searchParams.get('query') ?? ''}
                  onChange={(e) => setSearchParams({ query: e.target.value })}
                />
              </label>
            </form>
            <div className="mobile-menuItems">
              <Link className="btn btn--main btn--pill" to="/topics">
                Browse Topics
              </Link>
              <Link className="btn btn--main btn--pill" to="/activities">
                Recent Activities
              </Link>
            </div>
          </div>

          <div className="roomList__header">
            <div>
              <h2>Study Room</h2>
              <p>{rooms.length} Rooms available</p>
            </div>
            <Link className="btn btn--main" to="/create-room">
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 32 32"
              >
                <title>add</title>
                <path d="M16.943 0.943h-1.885v14.115h-14.115v1.885h14.115v14.115h1.885v-14.115h14.115v-1.885h-14.115v-14.115z"></path>
              </svg>
              Create Room
            </Link>
          </div>
          <Feed page="home" />
        </div>

        <Activities page="home" />
      </div>
    </main>
  );
}
