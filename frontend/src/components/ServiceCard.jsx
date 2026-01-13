import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaArrowRight } from 'react-icons/fa';
import './ServiceCard.css';

function ServiceCard({ service }) {
  const navigate = useNavigate();

  const handleBook = () => {
    navigate(`/booking/${service.id}`);
  };

  return (
    <div className="service-card">
      <div className="service-icon">
        {service.name === 'Escova' && '💇‍♀️'}
        {service.name === 'Permanente' && '💫'}
        {service.name === 'Outros Serviços' && '✨'}
        {!['Escova', 'Permanente', 'Outros Serviços'].includes(service.name) && '💅'}
      </div>
      <h3 className="service-name">{service.name}</h3>
      <p className="service-description">{service.description}</p>
      <div className="service-details">
        <span className="service-duration">
          <FaClock /> {service.duration_minutes} min
        </span>
        <div className="service-pricing">
          <span className="service-price">R$ {parseFloat(service.price).toFixed(2)}</span>
          <span className="service-deposit">Sinal: R$ {service.deposit_amount}</span>
        </div>
      </div>
      <button className="btn btn-primary service-btn" onClick={handleBook}>
        Agendar <FaArrowRight />
      </button>
    </div>
  );
}

export default ServiceCard;
