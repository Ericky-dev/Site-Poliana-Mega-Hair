import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaWhatsapp, FaCreditCard } from 'react-icons/fa';
import ServiceCard from '../components/ServiceCard';
import InstagramFeed from '../components/InstagramFeed';
import { servicesAPI } from '../services/api';
import './Home.css';

function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    servicesAPI.getAll()
      .then(response => {
        setServices(response.data.services || []);
      })
      .catch(() => {
        setServices([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Poliana Mega-Hair</h1>
          <p className="hero-subtitle hero-slogan">
            Não é só BELEZA, é TRANSFORMAÇÃO
          </p>
          <p className="hero-subtitle">
            Agende online de forma rápida e prática!
          </p>
          <Link to="/booking" className="btn btn-primary hero-btn">
            <FaCalendarAlt /> Agendar Agora
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature">
          <div className="feature-icon">
            <FaCalendarAlt />
          </div>
          <h3>Agendamento Online</h3>
          <p>Escolha o melhor horário sem precisar ligar</p>
        </div>
        <div className="feature">
          <div className="feature-icon">
            <FaCreditCard />
          </div>
          <h3>Pagamento via PIX</h3>
          <p>Pague o sinal de forma rápida e segura</p>
        </div>
        <div className="feature">
          <div className="feature-icon">
            <FaWhatsapp />
          </div>
          <h3>Confirmação Instantânea</h3>
          <p>Receba a confirmação pelo WhatsApp</p>
        </div>
      </section>

      {/* Services */}
      <section className="services-section">
        <h2 className="section-title">Nossos Serviços</h2>
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="services-grid">
            {services.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* CTA */}
      <section className="cta">
        <h2>Pronta para se sentir ainda mais bonita?</h2>
        <p>Agende seu horário agora mesmo!</p>
        <Link to="/booking" className="btn btn-primary">
          <FaCalendarAlt /> Agendar Horário
        </Link>
      </section>
    </div>
  );
}

export default Home;
