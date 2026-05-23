import FavoriteCityHero from '../components/FavoriteCityHero';
import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/useAuth.js";

const ProfilePage = () => {
  const { user, token, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  return (
      <main className="flex-grow pt-[20px]">
        {/* HERO HEADER */}
        <section className="max-w-7xl mx-auto px-margin pt-xl pb-lg">
          <div className="max-w-5xl mx-auto flex flex-col gap-lg">
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-lg md:p-xl shadow-sm shadow-primary/5">
              <div className="flex flex-col gap-md md:flex-row md:items-end md:justify-between">
                <div className="flex items-center gap-md">
                  <div className="h-20 w-20 rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[36px]">person</span>
                  </div>
                  <div>
                    <p className="font-label-sm text-label-sm uppercase tracking-[0.18em] text-secondary">Profile</p>
                    <h1 className="font-headline-lg text-headline-lg text-primary">{user?.userName}</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">{user?.email}</p>
                  </div>
                </div>
                <button type="button" onClick={logout} className="inline-flex items-center justify-center gap-xs rounded-full border border-outline px-md py-sm font-label-lg text-label-lg text-on-surface-variant hover:border-primary hover:text-primary transition-colors" >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Log Out
                </button>
              </div>
            </div>
            </div>
        </section>

        {/* FAVORITE CITY HERO */}
        <FavoriteCityHero
            user={user}
            token={token}
            updateProfile={updateProfile}
        />
      </main>
  );
};

export default ProfilePage;