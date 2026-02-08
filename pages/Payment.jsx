import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import PixPayment from '../components/PixPayment';
import { appointmentsAPI } from '../services/api';
import './Payment.css';

function Payment() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentsAPI.getById(appointmentId)
      .then(response => {
        setAppointment(response.data.appointment);
      })
      .catch(() => {
        navigate('/');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [appointmentId, navigate]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="payment-error">
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

  return (
    <div className="payment-page">
      <div className="payment-header">
        <FaCheckCircle className="success-icon" />
        <h1>Agendamento Realizado!</h1>
        <p>Faça o pagamento do sinal para confirmar</p>
      </div>

      <div className="payment-content">
        <div className="payment-details">
          <h3>Detalhes do Agendamento</h3>
          <div className="detail-item">
            <span className="detail-label">Serviço</span>
            <span className="detail-value">{appointment.service?.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Data</span>
            <span className="detail-value">{formattedDate}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Horário</span>
            <span className="detail-value">{appointment.appointment_time?.substring(0, 5)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Cliente</span>
            <span className="detail-value">{appointment.client_name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Telefone</span>
            <span className="detail-value">{appointment.client_phone}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Valor Total</span>
            <span className="detail-value price">
              R$ {parseFloat(appointment.service?.price).toFixed(2)}
            </span>
          </div>

          <div className="payment-info">
            <p>
              <strong>Importante:</strong> O pagamento do sinal de 30% confirma
              seu agendamento. O restante será pago no dia do atendimento.
            </p>
          </div>
        </div>

        <div className="payment-pix">
          {appointment.payment && (
            <PixPayment
              pixCode={appointment.payment.pix_code}
              amount={parseFloat(appointment.payment.amount)}
            />
          )}
        </div>
      </div>

      <div className="payment-footer">
        <Link to={`/confirmation/${appointment.id}`} className="btn btn-primary">
          Já paguei o sinal <FaArrowRight />
        </Link>
        <p className="payment-note">
          Você receberá uma mensagem no WhatsApp quando o pagamento for confirmado
        </p>
      </div>
    </div>
  );
}

export default Payment;
