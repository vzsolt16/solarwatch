const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const polarToCartesian = (centerX, centerY, radius, angleDegrees) => {
  const angleRadians = (angleDegrees * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleRadians),
    y: centerY - radius * Math.sin(angleRadians),
  };
};

const ARC_CENTER_X = 250;
const ARC_CENTER_Y = 270;
const ARC_RADIUS = 230;

const describeArc = (startAngle, endAngle) => {
  const start = polarToCartesian(ARC_CENTER_X, ARC_CENTER_Y, ARC_RADIUS, startAngle);
  const end = polarToCartesian(ARC_CENTER_X, ARC_CENTER_Y, ARC_RADIUS, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return `M ${start.x} ${start.y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
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

  if (!match) {
    return new Date(value).getTime();
  }

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

const getSunProgress = (sunrise, sunset, timezone) => {
  if (!sunrise || !sunset) {
    return 0.5;
  }

  const sunriseTime = parseLocalTimestamp(sunrise);
  const sunsetTime = parseLocalTimestamp(sunset);
  const currentTime = timezone ? getZonedTimestamp(new Date(), timezone) : Date.now();

  if (!Number.isFinite(sunriseTime) || !Number.isFinite(sunsetTime) || sunsetTime <= sunriseTime) {
    return 0.5;
  }

  return clamp((currentTime - sunriseTime) / (sunsetTime - sunriseTime), 0, 1);
};

const SunArc = ({ sunrise, sunset, timezone, sunriseLabel, sunsetLabel }) => {
  const progress = getSunProgress(sunrise, sunset, timezone);
  const sunAngle = 180 - progress * 180;
  const sunPosition = polarToCartesian(ARC_CENTER_X, ARC_CENTER_Y, ARC_RADIUS, sunAngle);
  const activeArc = describeArc(180, sunAngle);

  return (
    <div className="relative py-lg flex justify-center items-center min-h-[260px]">
      <svg className="w-full max-w-2xl h-auto" viewBox="0 0 520 285">
        <path d={describeArc(180, 0)} fill="none" stroke="#e0e3e5" strokeLinecap="round" strokeWidth="4"></path>
        <path d={activeArc} fill="none" stroke="#000000" strokeLinecap="round" strokeWidth="5"></path>
        <circle cx={sunPosition.x} cy={sunPosition.y} fill="#000000" r="11"></circle>
        <circle cx={sunPosition.x} cy={sunPosition.y} fill="#fd761a" fillOpacity="0.2" r="24"></circle>
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-md font-label-sm text-label-sm text-outline">
        <span>{sunriseLabel || "04:12 AM"}</span>
        <span>{sunsetLabel || "09:44 PM"}</span>
      </div>
    </div>
  );
};

export default SunArc;
