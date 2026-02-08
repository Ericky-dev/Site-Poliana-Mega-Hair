import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp, FaMapMarkerAlt, FaClock, FaShieldAlt, FaFileContract } from 'react-icons/fa';
import { socialAPI } from '../services/api';
import './Footer.css';

function Footer() {
  const [links, setLinks] = useState({
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    tiktok: 'https://tiktok.com'
  });

  useEffect(() => {
    socialAPI.getLinks()
      .then(response => setLinks(response.data.links))
      .catch(() => {});
  }, []);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">Poliana Mega-Hair</h3>
          <p className="footer-slogan">
            <em>Não é só Beleza, é Transformação.</em>
          </p>
          <p className="footer-cta">
            Agende seu horário online!
          </p>
          <div className="social-links">
            <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="social-link">
              <FaInstagram />
            </a>
            <a href={links.facebook} target="_blank" rel="noopener noreferrer" className="social-link">
              <FaFacebookF />
            </a>
            <a href={links.tiktok} target="_blank" rel="noopener noreferrer" className="social-link">
              <FaTiktok />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-subtitle">Horário de Funcionamento</h4>
          <ul className="footer-list">
            <li><FaClock /> Segunda à Sexta: 9h - 18h</li>
            <li><FaClock /> Sábado: 9h - 16h</li>
            <li><FaClock /> Domingo: Fechado</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-subtitle">Contato</h4>
          <ul className="footer-list">
            <li>
              <FaWhatsapp /> <a href="https://wa.me/5511999999999">(11) 99999-9999</a>
            </li>
            <li>
              <FaMapMarkerAlt /> Recife-PE
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-legal">
        <Link to="/privacidade" className="legal-link">
          <FaShieldAlt /> Política de Privacidade
        </Link>
        <Link to="/termos" className="legal-link">
          <FaFileContract /> Termos de Uso
        </Link>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Poliana Mega-Hair. Todos os direitos reservados.</p>
        <p className="footer-signature">Desenvolvida por Gustavo</p>
      </div>
    </footer>
  );
}

export default Footer;
