import { useEffect, useState } from 'react';
import SunArc from './SunArc';

const SolarCard = ({ city, sunrise, sunset, timezone, loading, error }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  if (loading) return <div className="bg-surface-container-lowest rounded-xl p-md celestial-shadow min-h-[400px] flex items-center justify-center">Loading...</div>;
  if (error) return <div className="bg-surface-container-lowest rounded-xl p-md celestial-shadow min-h-[400px] flex items-center justify-center text-error text-center">Failed to load Budapest solar data.<br/>Make sure the backend is running.</div>;

  const formatTime = (timeStr) => {
    if (!timeStr) return null;
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  const formattedSunrise = formatTime(sunrise);
  const formattedSunset = formatTime(sunset);
  const currentCityTime = (() => {
    try {
      return new Intl.DateTimeFormat([], {
        timeZone: timezone || undefined,
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(now));
    } catch {
      return new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  })();

  return (
    <div className="bg-surface-container-lowest rounded-xl p-md celestial-shadow flex flex-col justify-between min-h-[400px]">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-headline-md text-headline-md font-bold text-primary">{city}</h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mt-xs">{timezone || 'Local'} solar position</p>
        </div>
        <div className="flex items-center gap-xs bg-secondary-container/10 px-sm py-xs rounded-full text-secondary">
          <span className="material-symbols-outlined text-[16px]">schedule</span>
          <span className="font-label-sm text-label-sm">{currentCityTime || '--:--'}</span>
        </div>
      </div>
      
      <SunArc
        sunrise={sunrise}
        sunset={sunset}
        timezone={timezone}
        sunriseLabel={formattedSunrise}
        sunsetLabel={formattedSunset}
      />

      <div className="grid grid-cols-3 gap-md pt-md border-t border-outline-variant/10">
        <div>
          <p className="font-label-sm text-label-sm text-outline mb-xs">Altitude</p>
          <p className="font-headline-sm text-headline-sm font-bold text-primary">24.5°</p>
        </div>
        <div>
          <p className="font-label-sm text-label-sm text-outline mb-xs">Azimuth</p>
          <p className="font-headline-sm text-headline-sm font-bold text-primary">182.1°</p>
        </div>
        <div>
          <p className="font-label-sm text-label-sm text-outline mb-xs">UV Index</p>
          <p className="font-headline-sm text-headline-sm font-bold text-secondary">Low (2)</p>
        </div>
      </div>
    </div>
  );
};

export default SolarCard;
