import { useState } from 'react';
import { Link } from 'react-router-dom';

const AuthForm = ({ type, onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const isLogin = type === 'login';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-[448px] bg-surface-container-lowest rounded-xl shadow-sm shadow-primary/10 overflow-hidden flex flex-col">
      {/* Celestial Header Image */}
      <div className="h-[160px] w-full relative overflow-hidden flex-shrink-0">
        <img 
          alt="Celestial Horizon" 
          className="absolute inset-0 w-full h-full object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxwtqRvDL-XwHwKOagpJxb7dXyyWjWMdDOTey_frQQoVVI8OU8VpQRYnOmx60DizqbuHZ1eo0V66iWVOuHNkKwnno5qttsP20Uhf8eAN4gYTMrr4xi37fiqpOCfa0I5P_JnQv63xjZ-_7rnLGu7gxAN8WLBsCkSYXXW8o-tmruoIwTeap9dEM1_V5dmtBQYT3axn-B33sJT2mLbyNH1B266rMH1YfWywL195UgLoMs7HDHd1dlVNMvrhj-B19_qvN-Ma_zHFbogH2X"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent"></div>
      </div>
      
      {/* Interaction Card */}
      <div className="p-lg flex flex-col gap-lg">
        <div className="text-center">
          <h1 className="font-headline-md text-headline-md text-primary mb-base">
            {isLogin ? 'Welcome Back' : 'Join SolarWatch'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {isLogin ? 'Precision celestial insights await your return.' : 'Create an account to track the sun across the globe.'}
          </p>
        </div>

        {/* Toggle Selector */}
        <div className="flex bg-surface-container-low p-xs rounded-lg">
          <Link 
            to="/login"
            className={`flex-1 py-sm rounded-lg text-center font-label-lg text-label-lg transition-all ${isLogin ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'}`}
          >
            Sign In
          </Link>
          <Link 
            to="/register"
            className={`flex-1 py-sm rounded-lg text-center font-label-lg text-label-lg transition-all ${!isLogin ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'}`}
          >
            Register
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          {!isLogin && (
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant ml-xs">Username</label>
              <input 
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-md py-sm bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all font-body-md text-body-md rounded-t-lg outline-none" 
                placeholder="observer" 
                type="text"
              />
            </div>
          )}
          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant ml-xs">Email Address</label>
            <input 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-md py-sm bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all font-body-md text-body-md rounded-t-lg outline-none" 
              placeholder="observer@solarwatch.com" 
              type="email"
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant ml-xs">Password</label>
            <input 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-md py-sm bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all font-body-md text-body-md rounded-t-lg outline-none" 
              placeholder="••••••••" 
              type="password"
            />
          </div>
          
          {error && <p className="text-error text-label-sm text-center">{error}</p>}
          
          <button 
            disabled={loading}
            className="w-full py-md bg-primary text-on-primary font-label-lg text-label-lg rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-primary/20 disabled:opacity-50" 
            type="submit"
          >
            {loading ? 'Processing...' : (isLogin ? 'Continue to Almanac' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
