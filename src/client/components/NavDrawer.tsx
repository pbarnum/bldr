import {
  faArrowLeft,
  faBars,
  faFileCode,
  faSave,
  faTachometerAlt,
  faTools,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import storage from '../storage';
import { User } from '../types/user';

export enum NavButtons {
  Users = 'Users',
  Dashboard = 'Dashboard',
  Templates = 'Templates',
  Generate = 'Generate',
  Compiled = 'Compiled',
  Login = 'Login',
}

const navItemClassName = 'nav-link d-flex flex-row align-items-center';

interface NavDrawerProps {
  user: User | undefined;
}

const NavDrawer = (props: NavDrawerProps): React.ReactElement => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(true);
  const [, setQP] = useSearchParams();

  const toggleDrawer = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setDrawerIsOpen(!drawerIsOpen);
  };

  const linkClicked = () => {
    setQP('', { replace: true });
  };

  return (
    <>
      <div className={`navbar border-end border-primary bldr-nav-drawer-${drawerIsOpen ? 'out' : 'in'}`}>
        <div className="p-2 d-flex flex-row-reverse bldr-drawer-button">
          <a href="#" role="button" className="bldr-nav-drawer-button" onClick={toggleDrawer}>
            <FontAwesomeIcon size="lg" icon={drawerIsOpen ? faArrowLeft : faBars} />
          </a>
        </div>
        <ul className="nav nav-pills nav-fill text-truncate">
          {props.user ? (
            <>
              {storage.isAdmin ? (
                <li className="nav-item">
                  <NavLink end to={`/users`} onClick={linkClicked} className={navItemClassName}>
                    <div className="bldr-nav-drawer-icon">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div className="bldr-nav-drawer-text">{NavButtons.Users}</div>
                  </NavLink>
                </li>
              ) : (
                <></>
              )}
              <li className="nav-item">
                <NavLink end to={'/dashboard'} onClick={linkClicked} className={navItemClassName}>
                  <div className="bldr-nav-drawer-icon">
                    <FontAwesomeIcon icon={faTachometerAlt} />
                  </div>
                  <div className="bldr-nav-drawer-text">{NavButtons.Dashboard}</div>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  end
                  to={`/users/${props.user.id}/templates`}
                  onClick={linkClicked}
                  className={navItemClassName}
                >
                  <div className="bldr-nav-drawer-icon">
                    <FontAwesomeIcon size="lg" icon={faFileCode} />
                  </div>
                  <div className="bldr-nav-drawer-text">{NavButtons.Templates}</div>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink end to={`/users/${props.user.id}/generate`} onClick={linkClicked} className={navItemClassName}>
                  <div className="bldr-nav-drawer-icon">
                    <FontAwesomeIcon size="lg" icon={faTools} />
                  </div>
                  <div className="bldr-nav-drawer-text">{NavButtons.Generate}</div>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink end to={`/users/${props.user.id}/compiled`} onClick={linkClicked} className={navItemClassName}>
                  <div className="bldr-nav-drawer-icon">
                    <FontAwesomeIcon size="lg" icon={faSave} />
                  </div>
                  <div className="bldr-nav-drawer-text">{NavButtons.Compiled}</div>
                </NavLink>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <NavLink to="/login" onClick={linkClicked} className={navItemClassName}>
                <div className="bldr-nav-drawer-icon">
                  <FontAwesomeIcon size="lg" icon={faUser} />
                </div>
                <div className="bldr-nav-drawer-text">Login</div>
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </>
  );
};

export default NavDrawer;
