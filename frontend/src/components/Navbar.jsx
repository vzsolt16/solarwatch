import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md shadow-sm shadow-primary/5">
      <nav className="flex justify-between items-center px-margin py-md w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-xl">
          <Link className="text-3xl font-bold text-primary tracking-tight" to="/">
            SolarWatch
          </Link>
          <div className="hidden md:flex gap-lg items-center">
            <NavLink
                to="/"
                end
                className={({ isActive }) =>
                    `font-label-lg text-label-lg pb-1 border-b-2 transition-all ${
                        isActive
                            ? 'text-primary font-bold border-secondary'
                            : 'border-transparent text-on-surface-variant hover:text-secondary'
                    }`
                }
            >
              Search
            </NavLink>
            <Link className="font-label-lg text-label-lg text-on-surface-variant hover:text-secondary transition-colors duration-200" to="#">Sun Map</Link>
            <Link className="font-label-lg text-label-lg text-on-surface-variant hover:text-secondary transition-colors duration-200" to="#">Almanac</Link>
          </div>
        </div>
        <div className="flex gap-gutter items-center">
          {user ? (
            <NavLink
              to="/profile"
              className={({ isActive }) => `font-label-lg text-label-lg transition-colors px-sm py-xs ${isActive ? 'text-primary font-bold border-b-2 border-secondary' : 'text-on-surface-variant hover:text-secondary transition-colors duration-200'}`}
            >
              Profile
            </NavLink>
          ) : (
            <>
              <Link 
                to="/login"
                className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors px-sm py-xs"
              >
                Sign In
              </Link>
              <Link 
                to="/register"
                className="font-label-lg text-label-lg bg-primary text-on-primary px-md py-xs rounded-full hover:bg-primary-container transition-all active:scale-95"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
