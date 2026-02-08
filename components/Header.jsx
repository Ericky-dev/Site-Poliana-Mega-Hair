import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">🌸</span>
          <span className="logo-text">Poliana Mega-Hair</span>
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            Início
          </Link>
          <Link to="/booking" className="nav-link" onClick={() => setMenuOpen(false)}>
            Agendar
          </Link>

          {user ? (
            <>
              {isAdmin() && (
                <Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>
                  Painel Admin
                </Link>
              )}
              <div className="user-menu">
                <span className="user-name">
                  <FaUser /> {user.name}
                </span>
                <button className="btn-logout" onClick={handleLogout}>
                  <FaSignOutAlt /> Sair
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="nav-link btn-login" onClick={() => setMenuOpen(false)}>
              <FaUser /> Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
