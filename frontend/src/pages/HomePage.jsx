import { useState, useEffect, useCallback } from 'react';
import Hero from '../components/Hero';
import SolarCard from '../components/SolarCard';
import { solarApi } from '../api';
import {useAuth} from "../context/AuthContext.jsx";

const HomePage = () => {
  const [solarData, setSolarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState('Budapest');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { token } = useAuth();

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(city, date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
