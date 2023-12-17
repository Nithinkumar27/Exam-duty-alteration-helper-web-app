import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css'
import { Link } from 'react-router-dom'

function NavItem(props) {
  const { link, name, icon } = props;

  return (
    <li>
      <Link to={link} className="nav-link px-0 align-middle text-white">
        <i className={`fs-4 bi-${icon}`}></i> <span className="ms-1 d-none d-sm-inline">{name}</span>
      </Link>
    </li>
  );
}

export default NavItem;