import { useEffect, useRef, useState } from 'react';
import SunArc from './SunArc';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';

const InfoButton = ({ tooltipKey, activeTooltip, setActiveTooltip, tooltipDescriptions }) => {
    const [reference, setReference] = useState(null);
    const [floating, setFloating] = useState(null);

    const {
        x,
        y,
        strategy,
        refs,
    } = useFloating({
        placement: 'top',
        middleware: [offset(8), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    });

    return (
        <div className="relative inline-block">
            <button
                ref={refs.setReference}
                onClick={() =>
                    setActiveTooltip(activeTooltip === tooltipKey ? null : tooltipKey)
                }
                className="ml-xs text-on-surface-variant hover:text-secondary"
            >
                <span className="material-symbols-outlined text-[16px]">info</span>
            </button>

            {activeTooltip === tooltipKey && (
                <div
                    ref={refs.setFloating}
                    style={{
                        position: strategy,
                        top: y ?? 0,
                        left: x ?? 0,
                    }}
                    className="z-10 bg-on-surface text-surface-container-lowest rounded-lg px-md py-sm text-label-sm shadow-lg w-80 text-left"
                >
                    {tooltipDescriptions[tooltipKey]}
                </div>
            )}
        </div>
    );
};

const SolarDataField = ({
                          label,
                          value,
                          tooltipKey,
                          textColorClass = 'text-primary',
                          activeTooltip,
                          setActiveTooltip,
                          tooltipDescriptions,
                        }) => (
    <div>
      <div className="flex items-center gap-xs mb-xs">
        <p className="font-label-sm text-label-sm text-outline">{label}</p>

        <InfoButton
            tooltipKey={tooltipKey}
            activeTooltip={activeTooltip}
            setActiveTooltip={setActiveTooltip}
            tooltipDescriptions={tooltipDescriptions}
        />
      </div>

      <p
          className={`font-headline-sm text-headline-sm font-bold ${textColorClass}`}
      >
        {value}
      </p>
    </div>
);

const SolarCard = ({
                     city,
                     sunrise,
                     sunset,
                     timezone,
                     solarPosition,
                     loading,
                     error,
                   }) => {
  const [now, setNow] = useState(() => Date.now());
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setActiveTooltip(null);
      }
    };

    if (activeTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeTooltip]);

  if (loading) {
    return (
        <div className="bg-surface-container-lowest rounded-xl p-md celestial-shadow min-h-[400px] flex items-center justify-center">
          Loading...
        </div>
    );
  }

  if (error) {
    return (
        <div className="bg-surface-container-lowest rounded-xl p-md celestial-shadow min-h-[400px] flex items-center justify-center text-error text-center">
          Failed to load Budapest solar data.
          <br />
          Make sure the backend is running.
        </div>
    );
  }

    const tooltipDescriptions = {
        altitude:
            "How high the Sun is in the sky. 0° is on the horizon, 90° is directly overhead.",

        azimuth:
            "The Sun’s direction in the sky (like a compass). 0° = North, 90° = East, 180° = South, 270° = West.",

        declination:
            "How far the Sun is tilted north or south compared to Earth’s equator. It changes through the year.",

        hourAngle:
            "How far the Sun is from its highest point in the sky (solar noon).",

        equationOfTime:
            "The small difference between clock time and real Sun time, caused by Earth’s orbit.",
    };

  const formatTime = (timeStr) => {
    if (!timeStr) return null;

    try {
      const date = new Date(timeStr);

      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timeStr;
    }
  };

  const formattedSunrise = formatTime(sunrise);
  const formattedSunset = formatTime(sunset);

  const formatDegrees = (value) =>
      typeof value === 'number' ? `${value.toFixed(1)}°` : '--';

  const formatMinutes = (value) =>
      typeof value === 'number' ? `${value.toFixed(1)} min` : '--';

  const currentCityTime = (() => {
    try {
      return new Intl.DateTimeFormat([], {
        timeZone: timezone || undefined,
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(now));
    } catch {
      return new Date(now).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  })();

  return (
      <div ref={cardRef} className="bg-surface-container-lowest rounded-xl p-md celestial-shadow flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-primary">
              {city}
            </h2>

            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mt-xs">
              {timezone || 'Local'} solar position
            </p>
          </div>

          <div className="flex items-center gap-xs bg-secondary-container/10 px-sm py-xs rounded-full text-secondary">
          <span className="material-symbols-outlined text-[16px]">
            schedule
          </span>

            <span className="font-label-sm text-label-sm">
            {currentCityTime || '--:--'}
          </span>
          </div>
        </div>

        <SunArc
            sunrise={sunrise}
            sunset={sunset}
            timezone={timezone}
            sunriseLabel={formattedSunrise}
            sunsetLabel={formattedSunset}
        />



        {isExpanded && (
            <div className="mt-md pt-md border-t border-outline-variant/10">
              <div className="grid grid-cols-2 gap-md sm:grid-cols-3">
                <SolarDataField
                    label="Altitude"
                    value={formatDegrees(solarPosition?.elevation)}
                    tooltipKey="altitude"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    tooltipDescriptions={tooltipDescriptions}
                />

                <SolarDataField
                    label="Azimuth"
                    value={formatDegrees(solarPosition?.azimuth)}
                    tooltipKey="azimuth"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    tooltipDescriptions={tooltipDescriptions}
                />

                <SolarDataField
                    label="Declination"
                    value={formatDegrees(solarPosition?.declination)}
                    tooltipKey="declination"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    tooltipDescriptions={tooltipDescriptions}
                />

                <SolarDataField
                    label="Hour Angle"
                    value={formatDegrees(solarPosition?.hourAngle)}
                    tooltipKey="hourAngle"
                    textColorClass="text-secondary"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    tooltipDescriptions={tooltipDescriptions}
                />

                <SolarDataField
                    label="Equation of Time"
                    value={formatMinutes(solarPosition?.equationOfTime)}
                    tooltipKey="equationOfTime"
                    textColorClass="text-secondary"
                    activeTooltip={activeTooltip}
                    setActiveTooltip={setActiveTooltip}
                    tooltipDescriptions={tooltipDescriptions}
                />
              </div>
            </div>
        )}

        <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-md px-md py-sm bg-secondary text-surface-container-lowest rounded-lg font-label-lg text-label-lg font-semibold hover:bg-secondary/90 active:bg-secondary/80 transition-colors flex items-center justify-center gap-xs"
        >
        <span className="material-symbols-outlined text-[20px]">
          {isExpanded ? 'expand_less' : 'expand_more'}
        </span>

          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      </div>
  );
};

export default SolarCard;