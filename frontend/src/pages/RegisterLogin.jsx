import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import useLogin from '../hooks/useLogin';
import useRegister from '../hooks/useRegister';
import { addError, setErrors } from '../store/slices/errorsSlice';

export default function RegisterLogin({ page }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((state) => state.auth.value);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    let timeoutId;
    if (isAuthenticated) {
      timeoutId = setTimeout(() => {
        setShouldRedirect(true);
      }, 1);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (shouldRedirect) {
      navigate('/');
      dispatch(
        setErrors([
          page === 'login'
            ? 'You are already logged in'
            : 'You need to logout before you register a new account',
        ])
      );
    }
  }, [shouldRedirect, navigate, page, dispatch]);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');

  const login = useLogin();
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    await login(email, password1);
    setPassword1('');
  };

  const register = useRegister();
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (password1 === password2) {
      await register(name, username, email, password1);
    } else {
      dispatch(addError("The passwords don't match"));
      setPassword1('');
      setPassword2('');
    }
  };

  return (
    <main className="auth layout">
      {page === 'login' ? (
        <div className="container">
          <div className="layout__box">
            <div className="layout__boxHeader">
              <div className="layout__boxTitle">
                <h3>Login</h3>
              </div>
            </div>
            <div className="layout__body">
              <form
                key="login"
                className="form"
                onSubmit={(e) => handleLoginSubmit(e)}
              >
                <div className="form__group form__group">
                  <label>Email</label>
                  <input
                    required
                    autoFocus={page == 'login'}
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>

                <div className="form__group">
                  <label htmlFor="password">Password</label>
                  <input
                    required
                    id="password"
                    name="password"
                    type="password"
                    value={password1}
                    onChange={(e) => setPassword1(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>

                <button className="btn btn--main" type="submit">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                  >
                    <title>lock</title>
                    <path d="M27 12h-1v-2c0-5.514-4.486-10-10-10s-10 4.486-10 10v2h-1c-0.553 0-1 0.447-1 1v18c0 0.553 0.447 1 1 1h22c0.553 0 1-0.447 1-1v-18c0-0.553-0.447-1-1-1zM8 10c0-4.411 3.589-8 8-8s8 3.589 8 8v2h-16v-2zM26 30h-20v-16h20v16z"></path>
                    <path d="M15 21.694v4.306h2v-4.306c0.587-0.348 1-0.961 1-1.694 0-1.105-0.895-2-2-2s-2 0.895-2 2c0 0.732 0.413 1.345 1 1.694z"></path>
                  </svg>
                  Login
                </button>
              </form>

              <div className="auth__action">
                <p>Haven&apos;t signed up yet?</p>
                <Link to="/register" className="btn btn--link">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container">
          <div className="layout__box">
            <div className="layout__boxHeader">
              <div className="layout__boxTitle">
                <h3>Register</h3>
              </div>
            </div>
            <div className="layout__body">
              <form
                key="register"
                className="form"
                onSubmit={(e) => handleRegisterSubmit(e)}
              >
                <div className="form__group form__group">
                  <label>Name</label>
                  <input
                    required
                    autoFocus={page == 'register'}
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    autoComplete="name"
                  />
                </div>

                <div className="form__group form__group">
                  <label>Username</label>
                  <input
                    required
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. john_doe743"
                    autoComplete="username"
                  />
                </div>

                <div className="form__group form__group">
                  <label>Email</label>
                  <input
                    required
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. johndoe@emil.com"
                    autoComplete="email"
                  />
                </div>

                <div className="form__group form__group">
                  <label>Password</label>
                  <input
                    required
                    id="password1"
                    name="password1"
                    type="password"
                    value={password1}
                    onChange={(e) => setPassword1(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>

                <div className="form__group form__group">
                  <label>Confirm Password</label>
                  <input
                    required
                    id="password2"
                    name="password2"
                    type="password"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>

                <button className="btn btn--main" type="submit">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                  >
                    <title>lock</title>
                    <path d="M27 12h-1v-2c0-5.514-4.486-10-10-10s-10 4.486-10 10v2h-1c-0.553 0-1 0.447-1 1v18c0 0.553 0.447 1 1 1h22c0.553 0 1-0.447 1-1v-18c0-0.553-0.447-1-1-1zM8 10c0-4.411 3.589-8 8-8s8 3.589 8 8v2h-16v-2zM26 30h-20v-16h20v16z"></path>
                    <path d="M15 21.694v4.306h2v-4.306c0.587-0.348 1-0.961 1-1.694 0-1.105-0.895-2-2-2s-2 0.895-2 2c0 0.732 0.413 1.345 1 1.694z"></path>
                  </svg>
                  Register
                </button>
              </form>

              <div className="auth__action">
                <p>Already signed up?</p>
                <Link to="/login" className="btn btn--link">
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
