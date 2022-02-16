import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import EventEmitter from '../events';
import storage from '../storage';
import { events } from '../types/events';
import { User } from '../types/user';

const NavHeader = (): React.ReactElement => {
  const [user, setUser] = useState<User | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = storage.user;
    if (storedUser) {
      setUser(storedUser);
    }

    EventEmitter.on(events.loggedIn, (user: User) => {
      setUser(user);
    });

    EventEmitter.on(events.loggedOut, () => {
      setUser(undefined);
    });
  }, []);

  const onLogout = async () => {
    await api.auth.logout();
    navigate('/');
  };

  const headerLinks = user ? (
    <>
      <Link to={`/users/${user.id}`} className="nav-link">{`${user.firstName} ${user.lastName}`}</Link>
      {' | '}
      <Link to="/" className="nav-link" onClick={onLogout}>
        Logout
      </Link>
    </>
  ) : (
    <Link to="login" className="nav-link">
      Login
    </Link>
  );

  return (
    <nav className="navbar border-bottom border-primary">
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1">Bldr</span>
        <span className="navbar-brand me-0">{headerLinks}</span>
      </div>
    </nav>
  );
};

export default NavHeader;
