import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser, FaPhone, FaFacebookF } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Login realizado com sucesso!');
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('As senhas não coincidem');
          setLoading(false);
          return;
        }
        await register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });
        toast.success('Conta criada com sucesso!');
      }
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    authAPI.facebookLogin();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>{isLogin ? 'Entrar' : 'Criar Conta'}</h1>
          <p>
            {isLogin
              ? 'Acesse sua conta para gerenciar seus agendamentos'
              : 'Crie sua conta para agendar com mais facilidade'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <label><FaUser /> Nome Completo</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Seu nome completo"
                  required={!isLogin}
                />
              </div>

              <div className="form-group">
                <label><FaPhone /> WhatsApp</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="(11) 99999-9999"
                  required={!isLogin}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label><FaEnvelope /> E-mail</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label><FaLock /> Senha</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              placeholder="Sua senha"
              required
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label><FaLock /> Confirmar Senha</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-control"
                placeholder="Confirme sua senha"
                required={!isLogin}
                minLength={6}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <div className="login-divider">
          <span>ou</span>
        </div>

        <button className="btn btn-facebook btn-block" onClick={handleFacebookLogin}>
          <FaFacebookF /> Continuar com Facebook
        </button>

        <div className="login-footer">
          <p>
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            <button
              type="button"
              className="btn-link"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
          <Link to="/" className="btn-link">Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
