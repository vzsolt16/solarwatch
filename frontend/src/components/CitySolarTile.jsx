import { useEffect, useState } from 'react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const polarToCartesian = (centerX, centerY, radius, angleDegrees) => {
    const angleRadians = (angleDegrees * Math.PI) / 180;
    return {
        x: centerX + radius * Math.cos(angleRadians),
        y: centerY - radius * Math.sin(angleRadians),
    };
};

const getZonedTimestamp = (date, timezone) => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).formatToParts(date);

    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

    return Date.UTC(
        Number(values.year),
        Number(values.month) - 1,
        Number(values.day),
        Number(values.hour),
        Number(values.minute),
        Number(values.second),
    );
};

const parseLocalTimestamp = (value) => {
    const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (!match) return new Date(value).getTime();
    const [, year, month, day, hour, minute, second] = match;
    return Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second),
    );
};

const CitySolarTile = ({
                           city,
                           country,
                           sunrise,
                           sunset,
                           timezone,
                           isPlaceholder,
                           onClick,
                       }) => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    if (isPlaceholder) {
        return (
            <div
                onClick={onClick}
                className="group cursor-pointer bg-surface-container-lowest/50 border-2 border-dashed border-outline-variant/30 rounded-xl p-md flex flex-col items-center justify-center min-h-[180px] hover:border-secondary-fixed hover:bg-surface-container-lowest transition-all"
            >
                <div className="h-12 w-12 rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center mb-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[32px]">add</span>
                </div>
                <p className="font-label-lg text-label-lg text-outline">Add favorite city</p>
            </div>
        );
    }

    const currentCityTime = (() => {
        try {
            return new Intl.DateTimeFormat([], {
                timeZone: timezone || undefined,
                hour: '2-digit',
                minute: '2-digit',
            }).format(now);
        } catch {
            return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    })();

    const getProgress = () => {
        if (!sunrise || !sunset) return 0.5;
        const start = parseLocalTimestamp(sunrise);
        const end = parseLocalTimestamp(sunset);
        const current = timezone ? getZonedTimestamp(now, timezone) : now.getTime();
        if (end <= start) return 0.5;
        return clamp((current - start) / (end - start), 0, 1);
    };

    const progress = getProgress();
    const sunAngle = 180 - progress * 180;
    const sunPosition = polarToCartesian(50, 50, 45, sunAngle);

    return (
        <div
            onClick={onClick}
            className="group cursor-pointer bg-surface-container-lowest rounded-xl p-md ambient-shadow border border-transparent hover:border-secondary-fixed transition-all flex flex-col justify-between min-h-[180px]"
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                        {country || 'Location'}
                    </p>
                    <h3 className="font-headline-sm text-headline-sm text-primary mt-1">
                        {city}
                    </h3>
                </div>
                <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                    north_east
                </span>
            </div>

            <div className="flex items-end justify-between mt-lg">
                <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-outline">
                        Current time
                    </span>
                    <span className="font-headline-sm text-headline-sm text-primary">
                        {currentCityTime}
                    </span>
                </div>

                <div className="w-16 h-16">
                    <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                        <path
                            d="M5,50 A45,45 0 0 1 95,50"
                            fill="none"
                            stroke="#e0e3e5"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                        <circle
                            cx={sunPosition.x}
                            cy={sunPosition.y}
                            r="6"
                            fill="#fd761a"
                            className="drop-shadow-sm"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default CitySolarTile;