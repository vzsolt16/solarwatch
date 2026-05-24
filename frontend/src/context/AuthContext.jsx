import { useEffect, useState } from 'react';
import { profileApi, authApi } from '../api';
import { AuthContext } from './authContextValue';

export const AuthProvider = ({ children }) => {
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
  const [loading, setLoading] = useState(true);

  const persistUser = (profile) => {
    setUser(profile);
    localStorage.setItem('user', JSON.stringify(profile));
  };

  const login = (authResponse) => {
    persistUser({
      email: authResponse.email,
      userName: authResponse.userName,
      favoriteCity: authResponse.favoriteCity ?? null,
    });
    setLoading(false);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
    }
  };

  const updateProfile = (profile) => {
    persistUser({
      email: profile.email,
      userName: profile.userName,
      favoriteCity: profile.favoriteCity ?? null,
    });
  };

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);

      try {
        const profile = await profileApi.getProfile();

        if (!cancelled) {
          persistUser({
            email: profile.email,
            userName: profile.userName,
            favoriteCity: profile.favoriteCity ?? null,
          });
        }
      } catch (error) {
        if (!cancelled && error.status === 401) {
          localStorage.removeItem('user');
          setUser(null);
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
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
