import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { authApi } from '../api/auth';
import { useAuth } from '../context/useAuth';

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      // Automatically login after registration if the API returns a token
      // Or just redirect to login page. Usually registration might not return token.
      // Let's assume registration is successful and then we might need to login.
      // BUT the requirement says "after a successful registration/login the user should be redirected to the homepage"
      // This implies registration should also log them in or the API returns a token.
      // If the API doesn't return a token on register, we can try to login immediately.
      
      try {
        const loginResponse = await authApi.login({
          email: formData.email,
          password: formData.password
        });
        login(loginResponse);
      } catch {
        // If auto-login fails, redirect to login page
        navigate('/login');
        return;
      }
      
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-grow flex items-center justify-center pt-[120px] pb-xl px-margin">
      <AuthForm 
        type="register" 
        onSubmit={handleSubmit} 
        loading={loading} 
        error={error} 
      />
    </div>
  );
};

export default RegisterPage;
