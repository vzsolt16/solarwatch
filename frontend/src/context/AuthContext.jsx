import { useEffect, useState } from 'react';
import { profileApi } from '../api';
import { AuthContext } from './authContextValue';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(token));

  const persistUser = (profile) => {
    setUser(profile);
    localStorage.setItem('user', JSON.stringify(profile));
  };

  const login = (authResponse) => {
    localStorage.setItem('token', authResponse.token);
    setToken(authResponse.token);
    persistUser({
      email: authResponse.email,
      userName: authResponse.userName,
      favoriteCity: authResponse.favoriteCity ?? null,
    });
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const updateProfile = (profile) => {
    persistUser({
      email: profile.email,
      userName: profile.userName,
      favoriteCity: profile.favoriteCity ?? null,
    });
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);

      try {
        const profile = await profileApi.getProfile(token);

        if (!cancelled) {
          persistUser({
            email: profile.email,
            userName: profile.userName,
            favoriteCity: profile.favoriteCity ?? null,
          });
        }
      } catch (error) {
        if (!cancelled && error.status === 401) {
          logout();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
