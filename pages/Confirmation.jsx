import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FaCheckCircle, FaClock, FaCalendarAlt, FaPhone, FaHome } from 'react-icons/fa';
import { appointmentsAPI } from '../services/api';
import './Confirmation.css';

function Confirmation() {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentsAPI.getById(appointmentId)
      .then(response => {
        setAppointment(response.data.appointment);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [appointmentId]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="confirmation-error">
        <h2>Agendamento não encontrado</h2>
        <Link to="/" className="btn btn-primary">Voltar ao Início</Link>
      </div>
    );
  }

  const formattedDate = format(
    new Date(appointment.appointment_date + 'T12:00:00'),
    "EEEE, dd 'de' MMMM 'de' yyyy",
    { locale: ptBR }
  );

  const isPaid = appointment.payment?.status === 'paid';
  const isConfirmed = appointment.status === 'confirmed';

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <div className={`status-icon ${isConfirmed ? 'confirmed' : 'pending'}`}>
            {isConfirmed ? <FaCheckCircle /> : <FaClock />}
          </div>
          <h1>
            {isConfirmed ? 'Agendamento Confirmado!' : 'Aguardando Confirmação'}
          </h1>
          <p>
            {isConfirmed
              ? 'Seu pagamento foi confirmado. Te esperamos!'
              : 'Aguardando a confirmação do pagamento do sinal.'}
          </p>
        </div>

        <div className="confirmation-details">
          <div className="confirmation-id">
            <span>Código do Agendamento</span>
            <strong>#{appointment.id.toString().padStart(5, '0')}</strong>
          </div>

          <div className="confirmation-info">
            <div className="info-item">
              <FaCalendarAlt className="info-icon" />
              <div>
                <span className="info-label">Data</span>
                <span className="info-value">{formattedDate}</span>
              </div>
            </div>

            <div className="info-item">
              <FaClock className="info-icon" />
              <div>
                <span className="info-label">Horário</span>
                <span className="info-value">{appointment.appointment_time?.substring(0, 5)}</span>
              </div>
            </div>

            <div className="info-item full">
              <div className="service-info">
                <span className="info-label">Serviço</span>
                <span className="info-value">{appointment.service?.name}</span>
              </div>
            </div>
          </div>

          <div className="payment-status">
            <span className="status-label">Status do Pagamento</span>
            <span className={`status-badge ${isPaid ? 'paid' : 'pending'}`}>
              {isPaid ? 'Pago' : 'Pendente'}
            </span>
          </div>

          {!isPaid && (
            <div className="pending-message">
              <p>
                Se você já realizou o pagamento, aguarde alguns minutos para a confirmação.
                Caso contrário, <Link to={`/payment/${appointment.id}`}>clique aqui</Link> para
                acessar o código PIX.
              </p>
            </div>
          )}
        </div>

        <div className="confirmation-footer">
          <div className="contact-info">
            <FaPhone />
            <span>Dúvidas? Entre em contato: (11) 99999-9999</span>
          </div>

          <Link to="/" className="btn btn-primary">
            <FaHome /> Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Confirmation;
