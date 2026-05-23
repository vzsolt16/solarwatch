import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <main className="pt-[120px] pb-xl flex-grow">
      <section className="max-w-7xl mx-auto px-margin mb-xl">
        <div className="flex flex-col items-center text-center mb-lg">
          <h1 className="font-headline-lg text-2xl font-bold text-primary mb-sm max-w-5xl w-full">
            Precision in every ray, captured in every moment.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl w-full mb-lg">
            Track the sun's rhythm across the globe. Plan your photography, hikes, and mindful observations with celestial accuracy.
          </p>
          <div className="flex gap-md">
            <Link
              to="/register"
              className="bg-primary text-on-primary px-lg py-sm rounded-full font-label-lg text-label-lg hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/10"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-surface border-2 border-outline-variant text-on-surface px-lg py-sm rounded-full font-label-lg text-label-lg hover:bg-surface-container-low transition-all active:scale-95"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Hero Image / Illustration Placeholder */}
        <div className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden celestial-shadow aspect-video bg-surface-container-low flex items-center justify-center border border-outline-variant/20">
            <img 
                src="/sunrise.jpg"
                alt="SolarWatch Preview" 
                className="w-full h-full object-cover opacity-90"
                onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<span class="material-symbols-outlined text-outline text-6xl">wb_sunny</span>';
                }}
            />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-surface-container-lowest py-xl">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="text-center mb-xl">
            <h2 className="font-headline-md text-2xl font-bold text-primary mb-xs">Why SolarWatch?</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Everything you need to follow the sun's journey.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            <div className="p-lg bg-surface rounded-2xl border border-outline-variant/10 celestial-shadow hover:border-secondary/20 transition-colors">
              <span className="material-symbols-outlined text-secondary text-4xl mb-md">schedule</span>
              <h3 className="font-headline-sm text-headline-sm font-bold text-primary mb-sm">Accurate Timing</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Get precise sunrise and sunset times for any city in the world, adjusted for local timezones.</p>
            </div>
            
            <div className="p-lg bg-surface rounded-2xl border border-outline-variant/10 celestial-shadow hover:border-secondary/20 transition-colors">
              <span className="material-symbols-outlined text-secondary text-4xl mb-md">location_on</span>
              <h3 className="font-headline-sm text-headline-sm font-bold text-primary mb-sm">Global Search</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Search across thousands of cities. Whether you're planning a trip or staying local, we've got you covered.</p>
            </div>
            
            <div className="p-lg bg-surface rounded-2xl border border-outline-variant/10 celestial-shadow hover:border-secondary/20 transition-colors">
              <span className="material-symbols-outlined text-secondary text-4xl mb-md">star</span>
              <h3 className="font-headline-sm text-headline-sm font-bold text-primary mb-sm">Favorites</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Save your favorite locations for quick access to their solar patterns anytime, anywhere.</p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
};

export default LandingPage;
