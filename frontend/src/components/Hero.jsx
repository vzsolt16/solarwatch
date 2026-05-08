const Hero = ({ city, date, onCityChange, onDateChange, onSearch }) => {
  return (
    <section className="max-w-7xl mx-auto px-margin mb-lg">
      <div className="flex flex-col items-center text-center mb-lg">
        <h1 className="font-headline-lg text-headline-lg font-bold text-primary mb-sm max-w-5xl w-full">Precision in every ray, captured in every moment.</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl w-full">Track the sun's rhythm across the globe. Plan your photography, hikes, and mindful observations with celestial accuracy.</p>
      </div>
      {/* Search Bar */}
      <div className="w-full max-w-3xl mx-auto celestial-shadow bg-surface-container-lowest p-sm rounded-xl border border-outline-variant/30 flex flex-col md:flex-row gap-xs">
        <div className="flex-1 flex items-center px-md py-sm bg-surface rounded-lg group focus-within:ring-2 focus-within:ring-primary/5 transition-all">
          <span className="material-symbols-outlined text-outline mr-sm">location_on</span>
          <input
            className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-outline"
            placeholder="Search for a city..."
            type="text"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
          />
        </div>
        <div className="flex-1 flex items-center px-md py-sm bg-surface rounded-lg group focus-within:ring-2 focus-within:ring-primary/5 transition-all">
          <span className="material-symbols-outlined text-outline mr-sm">calendar_today</span>
          <input
            className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md text-on-surface"
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
        <button
          className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-lg text-label-lg hover:bg-primary-container transition-all flex items-center justify-center gap-sm"
          onClick={onSearch}
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
          Find Solar Data
        </button>
      </div>
    </section>
  );
};

export default Hero;
