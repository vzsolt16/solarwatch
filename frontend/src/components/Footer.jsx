const Footer = () => {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-margin py-xl w-full">
        <div className="mb-md md:mb-0 text-center md:text-left">
          <p className="font-label-lg text-label-lg font-bold text-primary mb-xs">SolarWatch</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">© 2026 SolarWatch. Precision in every ray.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-lg">
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20" href="#">Privacy Policy</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20" href="#">Terms of Service</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20" href="#">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
