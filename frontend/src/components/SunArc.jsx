import React from 'react';

const SunArc = ({ sunrise, sunset }) => {
  return (
    <div className="relative py-lg flex justify-center items-center">
      <svg className="w-full max-w-lg h-auto" viewBox="0 0 400 200">
        {/* Background Arc */}
        <path d="M 50 180 A 150 150 0 0 1 350 180" fill="none" stroke="#e0e3e5" strokeLinecap="round" strokeWidth="2"></path>
        {/* Active Arc (Placeholder) */}
        <path d="M 50 180 A 150 150 0 0 1 200 65" fill="none" stroke="#000000" strokeLinecap="round" strokeWidth="3"></path>
        {/* Sun Indicator (Placeholder) */}
        <circle cx="200" cy="65" fill="#000000" r="8"></circle>
        <circle cx="200" cy="65" fill="#fd761a" fillOpacity="0.2" r="16"></circle>
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-md font-label-sm text-label-sm text-outline">
        <span>{sunrise || "04:12 AM"}</span>
        <span>{sunset || "09:44 PM"}</span>
      </div>
    </div>
  );
};

export default SunArc;
