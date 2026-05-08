import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login({
        email: formData.email,
        password: formData.password
      });
      login(response.token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-grow flex items-center justify-center pt-[120px] pb-xl px-margin">
      <AuthForm 
        type="login" 
        onSubmit={handleSubmit} 
        loading={loading} 
        error={error} 
      />
    </div>
  );
};

export default LoginPage;
