import { useEffect, useRef, useState } from 'react';
import SunArc from './SunArc';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';

const InfoButton = ({ tooltipKey, activeTooltip, setActiveTooltip, tooltipDescriptions }) => {

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
                className="ml-xs text-outline hover:text-secondary"
            >
                <span className="material-symbols-outlined text-[16px]">info</span>
            </button>

            {activeTooltip === tooltipKey && (
                <div
                    // eslint-disable-next-line react-hooks/refs
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

const LightPhaseCard = ({
                          label,
                          icon,
                          rangeLabel,
                          description,
                          isActive,
                        }) => (
    <div
        className={`rounded-2xl border px-md py-md transition-colors ${
            isActive
                ? 'border-secondary/30 bg-secondary-container/15'
                : 'border-outline-variant/10 bg-surface'
        }`}
    >
      <div className="flex items-center justify-between gap-sm">
        <div className="flex items-center gap-sm">
          <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  isActive ? 'bg-secondary text-surface-container-lowest' : 'bg-secondary-container/10 text-secondary'
              }`}
          >
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          </div>

          <div>
            <p className="font-title-sm text-title-sm font-semibold text-primary">
              {label}
            </p>

            <p className="font-label-sm text-label-sm uppercase tracking-[0.16em] text-secondary">
              {rangeLabel}
            </p>
          </div>
        </div>

          <span
              className={`inline-flex items-center justify-center text-center rounded-full px-sm py-xs font-label-sm text-label-sm ${
                  isActive
                      ? 'bg-secondary text-surface-container-lowest'
                      : 'bg-secondary-container/10 text-secondary'
              }`}
          >
            {isActive ? 'Active now' : 'Not active'}
        </span>
      </div>

      <p className="mt-sm text-body-sm leading-relaxed text-on-surface-variant">
        {description}
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
  const [showTimeline, setShowTimeline] = useState(false);
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
          Failed to load {city} solar data.
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

  const parseLocalTimestamp = (timeStr) => {
    if (!timeStr) return null;
    const match = timeStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (!match) return new Date(timeStr);

    const [, year, month, day, hour, minute, second] = match;
    return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second)
    );
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return null;

    try {
      const date = parseLocalTimestamp(timeStr);

      return new Intl.DateTimeFormat([], {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
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

  const getEventDate = (baseTime, minuteOffset = 0) => {
    if (!baseTime) return null;

    const date = parseLocalTimestamp(baseTime);

    if (!date || Number.isNaN(date.getTime())) {
      return null;
    }

    date.setMinutes(date.getMinutes() + minuteOffset);
    return date;
  };

  const formatTimelineTime = (date) => {
    if (!date) return '--';

    try {
      return new Intl.DateTimeFormat([], {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const sunriseDate = getEventDate(sunrise);
  const sunsetDate = getEventDate(sunset);
  
  const solarNoonDate =
      sunriseDate && sunsetDate
          ? new Date((sunriseDate.getTime() + sunsetDate.getTime()) / 2)
          : null;
  const currentElevation = solarPosition?.elevation;
  const isBlueHourActive =
      typeof currentElevation === 'number' &&
      currentElevation >= -6 &&
      currentElevation <= -4;
  const isGoldenHourActive =
      typeof currentElevation === 'number' &&
      currentElevation > -4 &&
      currentElevation <= 6;

  const timelineEvents = [
    {
      icon: 'dark_mode',
      label: 'Astronomical Twilight',
      time: formatTimelineTime(getEventDate(sunrise, -90)),
      description:
          'The sun is roughly 18 degrees below the horizon, and the first subtle lift in the sky begins to separate night from morning.',
    },
    {
      icon: 'wb_twilight',
      label: 'Blue Hour (Dawn)',
      time: formatTimelineTime(getEventDate(sunrise, -35)),
      description:
          'Cool pre-dawn tones settle in while the sun sits just below the horizon, softening contrast and enriching shadows.',
    },
    {
      icon: 'sunny',
      label: 'Sunrise',
      time: formattedSunrise || '--',
      description:
          'The sun meets the horizon and the day opens with warm, directional light that starts carving shape into the landscape.',
    },
    {
      icon: 'light_mode',
      label: 'Golden Hour (Morning)',
      time: formatTimelineTime(getEventDate(sunrise, 35)),
      description:
          'Low-angle sunlight turns warm and flattering here, often bringing the most inviting light for portraits, architecture, and landscape work.',
    },
    {
      icon: 'clear_day',
      label: 'Solar Noon',
      time: formatTimelineTime(solarNoonDate),
      description:
          'The sun reaches its highest position of the day, delivering the brightest and most direct light across the scene.',
    },
    {
      icon: 'light_mode',
      label: 'Golden Hour (Evening)',
      time: formatTimelineTime(getEventDate(sunset, -35)),
      description:
          'The warm, golden light returns just before sunset, offering another perfect window for photography.',
    },
    {
      icon: 'wb_sunny',
      label: 'Sunset',
      time: formattedSunset || '--',
      description:
          'The sun drops back to the horizon and the light transitions into a softer, more atmospheric palette.',
    },
    {
      icon: 'wb_twilight',
      label: 'Blue Hour (Dusk)',
      time: formatTimelineTime(getEventDate(sunset, 35)),
      description:
          'Cool post-sunset tones settle in as the sun dips below the horizon, creating a serene, atmospheric glow.',
    },
  ];

    return (
        <div
            ref={cardRef}
            className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-md celestial-shadow"
        >
            <div className="flex flex-col gap-md sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="font-headline-md text-headline-md font-bold text-primary">
                        {city}
                    </h2>

                    <div className="mt-sm flex flex-wrap items-center gap-sm text-secondary">
                        <div className="flex items-center gap-xs rounded-full bg-secondary-container/10 px-sm py-xs">
            <span className="material-symbols-outlined text-[16px]">
              schedule
            </span>

                            <span className="font-label-sm text-label-sm">
              {currentCityTime || '--:--'}
            </span>
                        </div>

                        <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                            {timezone || 'Local'} solar position
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setShowTimeline(!showTimeline);
                        setActiveTooltip(null);
                    }}
                    className="shrink-0 rounded-full border border-secondary/20 bg-secondary-container/10 px-md py-sm font-label-sm text-label-sm font-semibold text-secondary transition-colors hover:bg-secondary/15 active:bg-secondary/20"
                >
                    {showTimeline ? 'Back to overview' : 'See timeline'}
                </button>
            </div>

            <div className="relative mt-lg min-h-[400px]">
                {/* OVERVIEW PANEL */}
                <div
                    className={`w-full transition-all duration-500 ease-out ${
                        showTimeline
                            ? 'pointer-events-none absolute inset-0 -translate-x-full opacity-0'
                            : 'relative translate-x-0 opacity-100'
                    }`}
                >
                    <div className="flex flex-col gap-md">
                        <SunArc
                            sunrise={sunrise}
                            sunset={sunset}
                            timezone={timezone}
                            sunriseLabel={formattedSunrise}
                            sunsetLabel={formattedSunset}
                        />

                        <div className="mt-md border-t border-outline-variant/10 pt-md">
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

                        <div className="mt-md grid gap-md lg:grid-cols-2">
                            <LightPhaseCard
                                label="Blue Hour"
                                icon="wb_twilight"
                                rangeLabel="-6° to -4° elevation"
                                description="A cooler, softer phase when the sun sits just below the horizon and ambient light becomes especially gentle and cinematic."
                                isActive={isBlueHourActive}
                            />

                            <LightPhaseCard
                                label="Golden Hour"
                                icon="light_mode"
                                rangeLabel="-4° to 6° elevation"
                                description="A warm low-angle window with long shadows and flattering contrast, often prized for portraits and landscape photography."
                                isActive={isGoldenHourActive}
                            />
                        </div>
                    </div>
                </div>

                {/* TIMELINE PANEL */}
                <div
                    className={`w-full transition-all duration-500 ease-out ${
                        showTimeline
                            ? 'relative translate-x-0 opacity-100'
                            : 'pointer-events-none absolute inset-0 translate-x-full opacity-0'
                    }`}
                >
                    <div className="w-full rounded-[28px] border border-outline-variant/10 bg-secondary-container/5 px-sm py-lg sm:px-lg">
                        <div className="w-full">
                            <p className="font-label-sm text-label-sm uppercase tracking-[0.24em] text-secondary">
                                Solar Progression
                            </p>
                        </div>

                        <div className="relative mt-lg space-y-lg">
                            <div className="absolute bottom-2 left-[22px] top-2 w-px bg-gradient-to-b from-secondary/50 via-secondary/20 to-transparent" />

                            {timelineEvents.map((event) => (
                                <div key={event.label} className="relative flex gap-md">
                                    <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-secondary/20 bg-surface text-secondary">
                  <span className="material-symbols-outlined text-[18px]">
                    {event.icon}
                  </span>
                                    </div>

                                    <div className="min-w-0 pt-1">
                                        <div className="flex flex-col gap-xs sm:flex-row sm:items-baseline sm:justify-between">
                                            <h4 className="font-title-sm text-title-sm font-semibold text-primary">
                                                {event.label}
                                            </h4>

                                            <p className="font-label-sm text-label-sm uppercase tracking-[0.18em] text-secondary">
                                                {event.time}
                                            </p>
                                        </div>

                                        <p className="mt-xs text-body-sm leading-relaxed text-on-surface-variant">
                                            {event.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SolarCard;
