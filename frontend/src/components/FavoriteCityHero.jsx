import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CitySolarTile from './CitySolarTile';
import { profileApi, solarApi } from '../api';

const FavoriteCityHero = ({ user, token, updateProfile }) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cityInput, setCityInput] = useState(user?.favoriteCity ?? '');
    const [saving, setSaving] = useState(false);
    const [solarData, setSolarData] = useState(null);
    const [loadingSolar, setLoadingSolar] = useState(false);

    useEffect(() => {
        if (user?.favoriteCity) {
            fetchSolarData(user.favoriteCity);
        } else {
            setSolarData(null);
        }
    }, [user?.favoriteCity]);

    const fetchSolarData = async (cityName) => {
        setLoadingSolar(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const data = await solarApi.getSolarTimes(cityName, today, token);
            setSolarData(data);
        } catch (error) {
            console.error('Failed to fetch solar data:', error);
        } finally {
            setLoadingSolar(false);
        }
    };

    const handleSave = async () => {
        if (!cityInput.trim()) return;
        setSaving(true);
        try {
            const profile = await profileApi.updateFavoriteCity(cityInput, token);
            updateProfile(profile);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to update favorite city:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async () => {
        try {
            await profileApi.deleteFavoriteCity(token);
            updateProfile({ ...user, favoriteCity: null });
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to remove favorite city:', error);
        }
    };

    const handleTileClick = () => {
        if (user?.favoriteCity) {
            navigate('/');
        } else {
            setIsModalOpen(true);
        }
    };

    return (
        <section className="max-w-7xl mx-auto px-margin py-lg">
            <div className="mb-md border-b border-outline-variant/30 pb-lg">
                <div>
                    <div className="flex items-center gap-sm">
                        <p className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                            Favorite City
                        </p>

                        {user?.favoriteCity && (
                            <button
                                onClick={() => {
                                    setCityInput(user.favoriteCity);
                                    setIsModalOpen(true);
                                }}
                                className="p-xs rounded-lg hover:bg-surface-container text-primary transition-colors"
                            >
          <span className="material-symbols-outlined text-[18px]">
            edit
          </span>
                            </button>
                        )}
                    </div>

                    <h2 className="font-headline-lg text-headline-lg text-primary">
                        {user?.favoriteCity || 'No city selected'}
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-md mt-lg">
                {loadingSolar ? (
                    <div className="bg-surface-container-lowest animate-pulse rounded-xl p-md min-h-[180px]" />
                ) : (
                    <CitySolarTile
                        city={user?.favoriteCity}
                        country={solarData?.country || 'Location'}
                        sunrise={solarData?.sunrise}
                        sunset={solarData?.sunset}
                        timezone={solarData?.timezone}
                        isPlaceholder={!user?.favoriteCity}
                        onClick={handleTileClick}
                    />
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-md">

                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    />

                    <div className="relative w-full max-w-md min-w-[340px] isolate bg-surface-container-lowest rounded-3xl p-8 shadow-2xl border border-outline-variant/20">

                        {/* Header */}
                        <div className="flex items-start justify-between mb-xl">
                            <h3 className="font-headline-sm text-xl text-primary pr-6">
                                {user?.favoriteCity ? 'Change City' : 'Add Favorite City'}
                            </h3>

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors"
                            >
          <span className="material-symbols-outlined text-[18px]">
            close
          </span>

                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col gap-lg">

                            <div>
                                <label className="block font-label-md text-secondary mb-sm">
                                    City Name
                                </label>

                                <input
                                    autoFocus
                                    value={cityInput}
                                    onChange={(e) => setCityInput(e.target.value)}
                                    placeholder="Budapest"
                                    className="w-full rounded-xl border border-outline-variant bg-surface px-md py-[10px] text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col gap-sm">

                                <button
                                    onClick={handleSave}
                                    disabled={saving || !cityInput.trim()}
                                    className="w-full py-sm rounded-xl bg-primary text-on-primary font-label-md hover:shadow-md hover:shadow-primary/20 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>

                                {user?.favoriteCity && (
                                    <button
                                        onClick={handleRemove}
                                        className="w-full py-sm rounded-xl border border-error/30 text-error font-label-md hover:bg-error/5 transition-all"
                                    >
                                        Remove
                                    </button>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default FavoriteCityHero;