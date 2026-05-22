import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { profileApi } from '../api';
import { useAuth } from '../context/useAuth';

const ProfilePage = () => {
  const { user, token, loading, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [favoriteCityInput, setFavoriteCityInput] = useState(user?.favoriteCity ?? '');
  const [hasEditedFavoriteCity, setHasEditedFavoriteCity] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const favoriteCity = hasEditedFavoriteCity ? favoriteCityInput : (user?.favoriteCity ?? favoriteCityInput);

  if (!token && !loading) {
    return <Navigate to="/login" replace />;
  }

  if (loading && !user) {
    return (
      <main className="pt-[120px] pb-xl flex-grow">
        <section className="max-w-7xl mx-auto px-margin">
          <div className="max-w-5xl mx-auto bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-lg shadow-sm shadow-primary/5">
            Loading profile...
          </div>
        </section>
      </main>
    );
  }

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage('');

    try {
      const profile = await profileApi.updateFavoriteCity(favoriteCity, token);
      updateProfile(profile);
      setFavoriteCityInput(profile.favoriteCity ?? '');
      setHasEditedFavoriteCity(false);
      setSuccessMessage('Favorite city updated.');
    } catch (err) {
      const validationError = err.data?.errors?.City?.[0];
      setError(validationError || err.message || 'Could not update favorite city.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage('');

    try {
      const profile = await profileApi.deleteFavoriteCity(token);
      updateProfile(profile);
      setFavoriteCityInput('');
      setHasEditedFavoriteCity(false);
      setSuccessMessage('Favorite city removed.');
    } catch (err) {
      setError(err.message || 'Could not remove favorite city.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <main className="pt-[120px] pb-xl flex-grow">
      <section className="max-w-7xl mx-auto px-margin">
        <div className="max-w-5xl mx-auto flex flex-col gap-lg">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-lg md:p-xl shadow-sm shadow-primary/5">
            <div className="flex flex-col gap-md md:flex-row md:items-end md:justify-between">
              <div className="flex items-center gap-md">
                <div className="h-20 w-20 rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[36px]">person</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm uppercase tracking-[0.18em] text-secondary">Profile</p>
                  <h1 className="font-headline-lg text-headline-lg text-primary">{user?.userName}</h1>
                  <p className="font-body-md text-body-md text-on-surface-variant">{user?.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-xs rounded-full border border-outline px-md py-sm font-label-lg text-label-lg text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Log Out
              </button>
            </div>
          </div>

          <div className="grid gap-md lg:grid-cols-[1.3fr_0.9fr]">
            <section className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-lg shadow-sm shadow-primary/5">
              <div className="mb-md">
                <p className="font-label-sm text-label-sm uppercase tracking-[0.18em] text-secondary">Favorite City</p>
                <h2 className="font-headline-sm text-headline-sm text-primary mt-xs">Set your default home-page city</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                  When you sign in, SolarWatch will automatically load this city on the home page. If you remove it, the app falls back to Budapest.
                </p>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="favorite-city">
                    City name
                  </label>
                  <input
                    id="favorite-city"
                    type="text"
                    value={favoriteCity}
                    onChange={(event) => {
                      setHasEditedFavoriteCity(true);
                      setFavoriteCityInput(event.target.value);
                    }}
                    placeholder="New York"
                    className="w-full rounded-2xl border border-outline-variant/40 bg-surface px-md py-sm font-body-md text-body-md text-on-surface outline-none transition focus:border-secondary"
                    disabled={saving}
                    required
                  />
                </div>

                {error && <p className="text-label-sm text-error">{error}</p>}
                {successMessage && <p className="text-label-sm text-secondary">{successMessage}</p>}

                <div className="flex flex-col gap-sm sm:flex-row">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-lg py-sm font-label-lg text-label-lg text-on-primary hover:opacity-90 transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : (user?.favoriteCity ? 'Update Favorite City' : 'Save Favorite City')}
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving || !user?.favoriteCity}
                    className="inline-flex items-center justify-center rounded-full border border-outline px-lg py-sm font-label-lg text-label-lg text-on-surface-variant hover:border-primary hover:text-primary transition disabled:opacity-50"
                  >
                    Remove Favorite City
                  </button>
                </div>
              </form>
            </section>

            <aside className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-lg shadow-sm shadow-primary/5">
              <p className="font-label-sm text-label-sm uppercase tracking-[0.18em] text-secondary">Current Default</p>
              <div className="mt-md rounded-2xl bg-surface px-md py-md">
                <p className="font-label-sm text-label-sm text-outline">Home page city</p>
                <p className="font-headline-md text-headline-md text-primary mt-xs">
                  {user?.favoriteCity || 'Budapest'}
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant mt-sm">
                  {user?.favoriteCity
                    ? 'Your saved favorite city is ready to load automatically after login.'
                    : 'No favorite city saved yet. SolarWatch will use Budapest until you set one.'}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProfilePage;
