import { useCallback, useEffect, useRef, useState } from 'react';
import Hero from '../components/Hero';
import SolarCard from '../components/SolarCard';
import { solarApi } from '../api';
import { useAuth } from '../context/useAuth';

const HomePage = () => {
  const [solarData, setSolarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState('Budapest');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const hasLoadedDefaultCity = useRef(false);
  const { token, user, loading: authLoading } = useAuth();

  const fetchData = useCallback(async (selectedCity, selectedDate) => {
    try {
      setLoading(true);
      setError(null);
      // Pass the token here
      const data = await solarApi.getSolarTimes(selectedCity, selectedDate, token);
      setSolarData(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authLoading || hasLoadedDefaultCity.current) {
      return;
    }

    const defaultCity = user?.favoriteCity?.trim() || 'Budapest';
    hasLoadedDefaultCity.current = true;
    setCity(defaultCity);
    fetchData(defaultCity, date);
  }, [authLoading, user?.favoriteCity, date, fetchData]);

  const handleSearch = () => {
    fetchData(city, date);
  };

  return (
    <main className="pt-[120px] pb-xl flex-grow">
      <Hero
        city={city}
        date={date}
        onCityChange={setCity}
        onDateChange={setDate}
        onSearch={handleSearch}
      />
      <section className="max-w-7xl mx-auto px-margin">
        <div className="max-w-4xl mx-auto">
          <SolarCard 
            city={solarData?.city || city}
            sunrise={solarData?.sunrise}
            sunset={solarData?.sunset}
            timezone={solarData?.timezone}
            solarPosition={solarData?.solarPosition}
            loading={loading}
            error={error}
          />
        </div>
      </section>
    </main>
  );
};

export default HomePage;
