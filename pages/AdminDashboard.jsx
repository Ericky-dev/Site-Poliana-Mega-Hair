import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCheck,
  FaTimes,
  FaEye,
  FaFilter,
  FaSync,
  FaCut,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEnvelope,
  FaDownload,
  FaCopy,
  FaUsers
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { appointmentsAPI, servicesAPI, adminAPI } from '../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: 60
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    revenue: 0
  });
  const [emailStats, setEmailStats] = useState({ registered_users: 0, appointment_emails: 0 });
  const [emails, setEmails] = useState([]);
  const [emailSource, setEmailSource] = useState('all');
  const [emailsCopied, setEmailsCopied] = useState(false);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await appointmentsAPI.getAll(params);
      const data = response.data.appointments || [];
      setAppointments(data);

      // Calculate stats
      const allAppointments = await appointmentsAPI.getAll({});
      const all = allAppointments.data.appointments || [];

      setStats({
        total: all.length,
        pending: all.filter(a => a.status === 'pending').length,
        confirmed: all.filter(a => a.status === 'confirmed').length,
        revenue: all
          .filter(a => a.payment?.status === 'paid')
          .reduce((sum, a) => sum + parseFloat(a.payment?.amount || 0), 0)
      });
    } catch (error) {
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    setLoading(true);
    try {
      const response = await servicesAPI.getAll();
      setServices(response.data.services || []);
    } catch (error) {
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const loadEmails = async () => {
    setLoading(true);
    try {
      const [statsRes, emailsRes] = await Promise.all([
        adminAPI.getEmailStats(),
        adminAPI.exportEmails('json', emailSource)
      ]);
      setEmailStats(statsRes.data);
      setEmails(emailsRes.data.emails || []);
    } catch (error) {
      toast.error('Erro ao carregar emails');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmails = async () => {
    const emailList = emails.map(e => e.email).join(', ');
    try {
      await navigator.clipboard.writeText(emailList);
      setEmailsCopied(true);
      toast.success('Emails copiados!');
      setTimeout(() => setEmailsCopied(false), 3000);
    } catch (error) {
      toast.error('Erro ao copiar emails');
    }
  };

  const handleDownloadCsv = async () => {
    try {
      const response = await adminAPI.exportEmails('csv', emailSource);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'emails_poliana_megahair.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('CSV baixado com sucesso!');
    } catch (error) {
      toast.error('Erro ao baixar CSV');
    }
  };

  useEffect(() => {
    if (activeTab === 'appointments') {
      loadAppointments();
    } else if (activeTab === 'services') {
      loadServices();
    } else if (activeTab === 'emails') {
      loadEmails();
    }
  }, [filter, activeTab, emailSource]);

  const handleConfirm = async (id) => {
    try {
      await appointmentsAPI.confirm(id);
      toast.success('Pagamento confirmado!');
      loadAppointments();
      setSelectedAppointment(null);
    } catch (error) {
      toast.error('Erro ao confirmar pagamento');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return;
    }

    try {
      await appointmentsAPI.cancel(id);
      toast.success('Agendamento cancelado');
      loadAppointments();
      setSelectedAppointment(null);
    } catch (error) {
      toast.error('Erro ao cancelar agendamento');
    }
  };

  const handleComplete = async (id) => {
    try {
      await appointmentsAPI.complete(id);
      toast.success('Agendamento marcado como concluído');
      loadAppointments();
    } catch (error) {
      toast.error('Erro ao concluir agendamento');
    }
  };

  // Service management functions
  const openServiceModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        name: service.name,
        description: service.description || '',
        price: service.price.toString(),
        duration_minutes: service.duration_minutes
      });
    } else {
      setEditingService(null);
      setServiceForm({
        name: '',
        description: '',
        price: '',
        duration_minutes: 60
      });
    }
    setShowServiceModal(true);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();

    if (!serviceForm.name || !serviceForm.price) {
      toast.error('Preencha nome e preço');
      return;
    }

    try {
      const data = {
        name: serviceForm.name,
        description: serviceForm.description,
        price: parseFloat(serviceForm.price),
        duration_minutes: parseInt(serviceForm.duration_minutes)
      };

      if (editingService) {
        await servicesAPI.update(editingService.id, data);
        toast.success('Serviço atualizado com sucesso!');
      } else {
        await servicesAPI.create(data);
        toast.success('Serviço criado com sucesso!');
      }

      setShowServiceModal(false);
      loadServices();
    } catch (error) {
      toast.error('Erro ao salvar serviço');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) {
      return;
    }

    try {
      await servicesAPI.delete(id);
      toast.success('Serviço excluído com sucesso!');
      loadServices();
    } catch (error) {
      toast.error('Erro ao excluir serviço');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      confirmed: 'badge-confirmed',
      cancelled: 'badge-cancelled',
      completed: 'badge-completed'
    };
    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
      completed: 'Concluído'
    };
    return <span className={`badge ${badges[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1 className="page-title">Painel Administrativo</h1>
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <FaCalendarAlt /> Agendamentos
          </button>
          <button
            className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <FaCut /> Serviços
          </button>
          <button
            className={`tab-btn ${activeTab === 'emails' ? 'active' : ''}`}
            onClick={() => setActiveTab('emails')}
          >
            <FaEnvelope /> Marketing
          </button>
        </div>
      </div>

      {activeTab === 'appointments' && (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FaCalendarAlt />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total de Agendamentos</span>
              </div>
            </div>

            <div className="stat-card pending">
              <div className="stat-icon">
                <FaCalendarAlt />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.pending}</span>
                <span className="stat-label">Aguardando Pagamento</span>
              </div>
            </div>

            <div className="stat-card confirmed">
              <div className="stat-icon">
                <FaCheck />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.confirmed}</span>
                <span className="stat-label">Confirmados</span>
              </div>
            </div>

            <div className="stat-card revenue">
              <div className="stat-icon">
                <FaMoneyBillWave />
              </div>
              <div className="stat-info">
                <span className="stat-value">R$ {stats.revenue.toFixed(2)}</span>
                <span className="stat-label">Sinais Recebidos</span>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="filter-bar">
            <FaFilter />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendentes</option>
              <option value="confirmed">Confirmados</option>
              <option value="completed">Concluídos</option>
              <option value="cancelled">Cancelados</option>
            </select>
            <button className="btn btn-secondary" onClick={loadAppointments}>
              <FaSync /> Atualizar
            </button>
          </div>

          {/* Appointments Table */}
          <div className="appointments-table-container">
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum agendamento encontrado</p>
              </div>
            ) : (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Serviço</th>
                    <th>Data/Hora</th>
                    <th>Pagamento</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(appointment => (
                    <tr key={appointment.id}>
                      <td>#{appointment.id.toString().padStart(5, '0')}</td>
                      <td>
                        <div className="client-info">
                          <span className="client-name">{appointment.client_name}</span>
                          <span className="client-phone">{appointment.client_phone}</span>
                        </div>
                      </td>
                      <td>{appointment.service?.name}</td>
                      <td>
                        <div className="datetime-info">
                          <span>{format(new Date(appointment.appointment_date + 'T12:00:00'), 'dd/MM/yyyy')}</span>
                          <span>{appointment.appointment_time?.substring(0, 5)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="payment-info">
                          <span className={`payment-status ${appointment.payment?.status || 'pending'}`}>
                            {appointment.payment?.status === 'paid' ? 'Pago' : 'Pendente'}
                          </span>
                          <span className="payment-amount">
                            R$ {parseFloat(appointment.payment?.amount || 0).toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td>{getStatusBadge(appointment.status)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-action view"
                            onClick={() => setSelectedAppointment(appointment)}
                            title="Ver detalhes"
                          >
                            <FaEye />
                          </button>
                          {appointment.status === 'pending' && (
                            <>
                              <button
                                className="btn-action confirm"
                                onClick={() => handleConfirm(appointment.id)}
                                title="Confirmar pagamento"
                              >
                                <FaCheck />
                              </button>
                              <button
                                className="btn-action cancel"
                                onClick={() => handleCancel(appointment.id)}
                                title="Cancelar"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          {appointment.status === 'confirmed' && (
                            <button
                              className="btn-action complete"
                              onClick={() => handleComplete(appointment.id)}
                              title="Marcar como concluído"
                            >
                              <FaCheck />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {activeTab === 'services' && (
        <>
          {/* Services Tab */}
          <div className="services-header">
            <h2>Gerenciar Serviços</h2>
            <button className="btn btn-primary" onClick={() => openServiceModal()}>
              <FaPlus /> Novo Serviço
            </button>
          </div>

          <div className="services-table-container">
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : services.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum serviço cadastrado</p>
                <button className="btn btn-primary" onClick={() => openServiceModal()}>
                  <FaPlus /> Adicionar Serviço
                </button>
              </div>
            ) : (
              <table className="services-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Preço</th>
                    <th>Sinal (30%)</th>
                    <th>Duração</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(service => (
                    <tr key={service.id}>
                      <td><strong>{service.name}</strong></td>
                      <td>{service.description || '-'}</td>
                      <td className="price">R$ {parseFloat(service.price).toFixed(2)}</td>
                      <td className="deposit">R$ {parseFloat(service.deposit_amount || service.price * 0.3).toFixed(2)}</td>
                      <td>{service.duration_minutes} min</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-action edit"
                            onClick={() => openServiceModal(service)}
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn-action delete"
                            onClick={() => handleDeleteService(service.id)}
                            title="Excluir"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {activeTab === 'emails' && (
        <>
          {/* Email Marketing Tab */}
          <div className="email-stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-info">
                <span className="stat-value">{emailStats.registered_users}</span>
                <span className="stat-label">Usuários Cadastrados</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FaEnvelope />
              </div>
              <div className="stat-info">
                <span className="stat-value">{emailStats.appointment_emails}</span>
                <span className="stat-label">Emails de Agendamentos</span>
              </div>
            </div>
            <div className="stat-card revenue">
              <div className="stat-icon">
                <FaEnvelope />
              </div>
              <div className="stat-info">
                <span className="stat-value">{emails.length}</span>
                <span className="stat-label">Total de Emails Únicos</span>
              </div>
            </div>
          </div>

          <div className="email-controls">
            <div className="email-filter">
              <label>Filtrar por origem:</label>
              <select
                value={emailSource}
                onChange={(e) => setEmailSource(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todos os Emails</option>
                <option value="users">Usuários Cadastrados</option>
                <option value="appointments">Emails de Agendamentos</option>
              </select>
            </div>
            <div className="email-actions">
              <button
                className={`btn ${emailsCopied ? 'btn-success' : 'btn-secondary'}`}
                onClick={handleCopyEmails}
                disabled={emails.length === 0}
              >
                {emailsCopied ? <><FaCheck /> Copiado!</> : <><FaCopy /> Copiar Emails</>}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleDownloadCsv}
                disabled={emails.length === 0}
              >
                <FaDownload /> Baixar CSV
              </button>
            </div>
          </div>

          <div className="email-info-box">
            <h4>Como usar esses emails para marketing:</h4>
            <ol>
              <li>Clique em "Baixar CSV" para obter a lista completa</li>
              <li>Importe no seu serviço de email marketing (Mailchimp, SendGrid, etc.)</li>
              <li>Ou copie os emails e cole diretamente em ferramentas de disparo</li>
            </ol>
            <p className="lgpd-notice">
              <strong>Aviso LGPD:</strong> Utilize esses dados apenas para comunicações
              relacionadas aos serviços do salão. Os clientes têm direito de solicitar
              remoção a qualquer momento.
            </p>
          </div>

          <div className="emails-table-container">
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : emails.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum email encontrado</p>
              </div>
            ) : (
              <table className="emails-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Origem</th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((email, index) => (
                    <tr key={index}>
                      <td>{email.name}</td>
                      <td>{email.email}</td>
                      <td>{email.phone || '-'}</td>
                      <td>
                        <span className={`badge ${email.source === 'registered_user' ? 'badge-confirmed' : 'badge-pending'}`}>
                          {email.source === 'registered_user' ? 'Cadastrado' : 'Agendamento'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Agendamento #{selectedAppointment.id.toString().padStart(5, '0')}</h2>
              <button className="modal-close" onClick={() => setSelectedAppointment(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="label">Cliente:</span>
                <span className="value">{selectedAppointment.client_name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Telefone:</span>
                <span className="value">{selectedAppointment.client_phone}</span>
              </div>
              <div className="detail-row">
                <span className="label">E-mail:</span>
                <span className="value">{selectedAppointment.client_email || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Serviço:</span>
                <span className="value">{selectedAppointment.service?.name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Data:</span>
                <span className="value">
                  {format(new Date(selectedAppointment.appointment_date + 'T12:00:00'), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Horário:</span>
                <span className="value">{selectedAppointment.appointment_time?.substring(0, 5)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Valor Total:</span>
                <span className="value">R$ {parseFloat(selectedAppointment.service?.price).toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Sinal:</span>
                <span className="value">R$ {parseFloat(selectedAppointment.payment?.amount || 0).toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className="value">{getStatusBadge(selectedAppointment.status)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Pagamento:</span>
                <span className="value">
                  {selectedAppointment.payment?.status === 'paid' ? 'Pago' : 'Pendente'}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              {selectedAppointment.status === 'pending' && (
                <>
                  <button
                    className="btn btn-success"
                    onClick={() => handleConfirm(selectedAppointment.id)}
                  >
                    <FaCheck /> Confirmar Pagamento
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleCancel(selectedAppointment.id)}
                  >
                    <FaTimes /> Cancelar
                  </button>
                </>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedAppointment(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="modal-overlay" onClick={() => setShowServiceModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h2>
              <button className="modal-close" onClick={() => setShowServiceModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleServiceSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome do Serviço *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                    placeholder="Ex: Mega Hair, Escova, Corte..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Descrição</label>
                  <textarea
                    className="form-control"
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                    placeholder="Descrição do serviço (opcional)"
                    rows={3}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Preço (R$) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                    {serviceForm.price && (
                      <small className="form-hint">
                        Sinal (30%): R$ {(parseFloat(serviceForm.price) * 0.3).toFixed(2)}
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Duração (minutos)</label>
                    <select
                      className="form-control"
                      value={serviceForm.duration_minutes}
                      onChange={(e) => setServiceForm({...serviceForm, duration_minutes: e.target.value})}
                    >
                      <option value={30}>30 minutos</option>
                      <option value={60}>1 hora</option>
                      <option value={90}>1h 30min</option>
                      <option value={120}>2 horas</option>
                      <option value={150}>2h 30min</option>
                      <option value={180}>3 horas</option>
                      <option value={240}>4 horas</option>
                      <option value={300}>5 horas</option>
                      <option value={360}>6 horas</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  <FaCheck /> {editingService ? 'Salvar Alterações' : 'Criar Serviço'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowServiceModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
