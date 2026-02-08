import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      loginWithToken(token);
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="loading">
      <div className="spinner"></div>
      <p style={{ marginTop: '20px', color: '#757575' }}>
        Processando login...
      </p>
    </div>
  );
}

export default AuthCallback;
