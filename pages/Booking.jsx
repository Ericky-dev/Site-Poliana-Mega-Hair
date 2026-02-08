import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import ptBR from 'date-fns/locale/pt-BR';
import { format, addDays, isSunday } from 'date-fns';
import { FaCalendarAlt, FaClock, FaUser, FaPhone, FaEnvelope, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { servicesAPI, appointmentsAPI } from '../services/api';
import './Booking.css';

registerLocale('pt-BR', ptBR);

function Booking() {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    servicesAPI.getAll()
      .then(response => {
        const servicesList = response.data.services || [];
        setServices(servicesList);

        if (serviceId) {
          const service = servicesList.find(s => s.id === parseInt(serviceId));
          if (service) {
            setSelectedService(service);
            setStep(2);
          }
        }
      })
      .catch(() => {
        toast.error('Erro ao carregar serviços');
      });
  }, [serviceId]);

  useEffect(() => {
    if (selectedDate && selectedService) {
      setLoadingSlots(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      appointmentsAPI.getAvailable(dateStr, selectedService.id)
        .then(response => {
          setAvailableSlots(response.data.available_slots || []);
        })
        .catch(() => {
          toast.error('Erro ao carregar horários');
          setAvailableSlots([]);
        })
        .finally(() => {
          setLoadingSlots(false);
        });
    }
  }, [selectedDate, selectedService]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const response = await appointmentsAPI.create({
        service_id: selectedService.id,
        client_name: formData.name,
        client_phone: formData.phone,
        client_email: formData.email || null,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime
      });

      toast.success('Agendamento realizado com sucesso!');
      navigate(`/payment/${response.data.appointment.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const isDateDisabled = (date) => {
    return isSunday(date) || date < new Date();
  };

  return (
    <div className="booking">
      <h1 className="page-title">Agendar Horário</h1>

      {/* Progress Steps */}
      <div className="booking-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Serviço</span>
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Data/Hora</span>
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Dados</span>
        </div>
      </div>

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div className="booking-step">
          <h2>Escolha o Serviço</h2>
          <div className="service-options">
            {services.map(service => (
              <div
                key={service.id}
                className={`service-option ${selectedService?.id === service.id ? 'selected' : ''}`}
                onClick={() => handleServiceSelect(service)}
              >
                <div className="service-option-icon">
                  {service.name === 'Escova' && '💇‍♀️'}
                  {service.name === 'Permanente' && '💫'}
                  {service.name === 'Outros Serviços' && '✨'}
                </div>
                <div className="service-option-info">
                  <h3>{service.name}</h3>
                  <p>{service.duration_minutes} min</p>
                </div>
                <div className="service-option-price">
                  <span className="price">R$ {parseFloat(service.price).toFixed(2)}</span>
                  <span className="deposit">Sinal: R$ {service.deposit_amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Date and Time */}
      {step === 2 && (
        <div className="booking-step">
          <button className="btn-back" onClick={() => setStep(1)}>
            <FaArrowLeft /> Voltar
          </button>

          <h2>Escolha a Data e Horário</h2>

          <div className="datetime-container">
            <div className="date-picker-container">
              <h3><FaCalendarAlt /> Data</h3>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateSelect}
                minDate={new Date()}
                maxDate={addDays(new Date(), 60)}
                filterDate={(date) => !isDateDisabled(date)}
                inline
                locale="pt-BR"
              />
            </div>

            <div className="time-slots-container">
              <h3><FaClock /> Horário</h3>
              {!selectedDate ? (
                <p className="text-muted">Selecione uma data primeiro</p>
              ) : loadingSlots ? (
                <div className="loading">
                  <div className="spinner"></div>
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-muted">Nenhum horário disponível nesta data</p>
              ) : (
                <div className="time-slots">
                  {availableSlots.map(slot => (
                    <button
                      key={slot.time}
                      className={`time-slot ${!slot.available ? 'disabled' : ''} ${selectedTime === slot.time ? 'selected' : ''}`}
                      onClick={() => slot.available && handleTimeSelect(slot.time)}
                      disabled={!slot.available}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Client Data */}
      {step === 3 && (
        <div className="booking-step">
          <button className="btn-back" onClick={() => setStep(2)}>
            <FaArrowLeft /> Voltar
          </button>

          <h2>Seus Dados</h2>

          <div className="booking-summary">
            <h3>Resumo do Agendamento</h3>
            <p><strong>Serviço:</strong> {selectedService.name}</p>
            <p><strong>Data:</strong> {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            <p><strong>Horário:</strong> {selectedTime}</p>
            <p><strong>Valor:</strong> R$ {parseFloat(selectedService.price).toFixed(2)}</p>
            <p><strong>Sinal (30%):</strong> R$ {selectedService.deposit_amount}</p>
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label><FaUser /> Nome Completo *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div className="form-group">
              <label><FaPhone /> WhatsApp *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-control"
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div className="form-group">
              <label><FaEnvelope /> E-mail (opcional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-control"
                placeholder="seu@email.com"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Processando...' : 'Confirmar e Pagar Sinal'}
              {!loading && <FaArrowRight />}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Booking;
