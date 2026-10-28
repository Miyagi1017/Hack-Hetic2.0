import React, { useState } from 'react';
import {
  Compass,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  MapPin,
  Check,
  User,
  AlertCircle,
  Plane,
} from 'lucide-react';
import { createSessionUser, DEMO_USER, saveSession, SessionUser } from '../data/session';
import { SafeImage } from './SafeImage';

interface AuthScreenProps {
  onAuthenticate: (user: SessionUser) => void;
}

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=80';

const HIGHLIGHTS = [
  'Itinéraires optimisés jour par jour',
  'Comparateur de prix et promos locales',
  'Règles, coutumes et alertes par ville',
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticate }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === 'signup';

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      setError('Entrez une adresse email valide (ex. prenom@exemple.fr).');
      return;
    }
    if (isSignup && name.trim().length < 2) {
      setError('Indiquez votre prénom pour personnaliser le voyage.');
      return;
    }
    if (password.length < 4) {
      setError('Le mot de passe doit contenir au moins 4 caractères.');
      return;
    }

    setLoading(true);
    const user = createSessionUser(cleanEmail, isSignup ? name : cleanEmail.split('@')[0]);
    saveSession(user);
    window.setTimeout(() => onAuthenticate(user), 380);
  };

  const handleDemo = () => {
    setLoading(true);
    saveSession(DEMO_USER);
    window.setTimeout(() => onAuthenticate(DEMO_USER), 320);
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        {/* Panneau éditorial */}
        <aside className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
          <SafeImage
            src={HERO_IMAGE}
            alt="Rome, la Ville Éternelle"
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-ink/85 via-ink/55 to-ink/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />

          <div className="relative z-10 flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/25 backdrop-blur-sm">
              <Compass className="h-5 w-5 text-amber-200" />
            </span>
            <span className="font-serif text-2xl font-semibold tracking-tight text-white">Odyssée</span>
          </div>

          <div className="relative z-10 max-w-lg">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-amber-200" />
              Votre carnet de voyage intelligent
            </span>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-white xl:text-5xl">
              Partez mieux préparé,
              <br />
              revenez avec des histoires.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
              Programmes sur mesure, carte vivante, budget ajustable et conseils locaux : tout votre
              voyage réuni dans un seul espace.
            </p>

            <ul className="mt-7 space-y-2.5">
              {HIGHLIGHTS.map((highlight) => (
                <li key={highlight} className="flex items-center gap-2.5 text-sm text-white/85">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 ring-1 ring-emerald-300/40">
                    <Check className="h-3 w-3 text-emerald-200" />
                  </span>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-4 text-[11px] text-white/60">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Données conservées sur votre appareil
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Rome · Paris · Barcelone · Tokyo
            </span>
          </div>
        </aside>

        {/* Formulaire */}
        <main className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-2.5 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-amber-200">
                <Compass className="h-5 w-5" />
              </span>
              <span className="font-serif text-2xl font-semibold tracking-tight text-ink">Odyssée</span>
            </div>

            <div className="inline-flex rounded-full border border-line bg-white p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                aria-pressed={!isSignup}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  !isSignup ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'
                }`}
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                aria-pressed={isSignup}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  isSignup ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'
                }`}
              >
                Créer un compte
              </button>
            </div>

            <h2 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-ink">
              {isSignup ? 'Bienvenue à bord' : 'Ravi de vous revoir'}
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              {isSignup
                ? 'Créez votre espace voyageur : vos programmes et votre budget vous suivront.'
                : 'Connectez-vous pour retrouver votre itinéraire et vos réglages.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              {isSignup && (
                <div>
                  <label htmlFor="auth-name" className="mb-1.5 block text-xs font-semibold text-ink">
                    Prénom
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      id="auth-name"
                      type="text"
                      autoComplete="given-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Evan"
                      className="w-full rounded-xl border border-line bg-white py-3 pl-10 pr-3.5 text-sm font-medium text-ink placeholder:text-muted/60 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="mb-1.5 block text-xs font-semibold text-ink">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="prenom@exemple.fr"
                    className="w-full rounded-xl border border-line bg-white py-3 pl-10 pr-3.5 text-sm font-medium text-ink placeholder:text-muted/60 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="auth-password" className="block text-xs font-semibold text-ink">
                    Mot de passe
                  </label>
                  {!isSignup && (
                    <button
                      type="button"
                      onClick={() =>
                        setError('Mode démo : utilisez le bouton « Découvrir avec Evan » ci-dessous.')
                      }
                      className="cursor-pointer text-[11px] font-semibold text-accent hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="4 caractères minimum"
                    className="w-full rounded-xl border border-line bg-white py-3 pl-10 pr-11 text-sm font-medium text-ink placeholder:text-muted/60 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1.5 text-muted transition-colors hover:bg-paper hover:text-ink"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-800">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-ink-soft disabled:cursor-wait disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Plane className="h-4 w-4 animate-pulse" />
                    Préparation du carnet…
                  </>
                ) : (
                  <>
                    {isSignup ? 'Créer mon espace voyage' : 'Se connecter'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">ou</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <button
              type="button"
              onClick={handleDemo}
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-3.5 text-sm font-semibold text-ink shadow-xs transition-colors hover:border-line-strong hover:bg-paper disabled:opacity-70"
            >
              <Sparkles className="h-4 w-4 text-accent" />
              Découvrir avec Evan (démo)
            </button>

            <p className="mt-6 text-center text-[11px] leading-relaxed text-muted">
              En continuant, vous acceptez les conditions d’utilisation et la politique de
              confidentialité d’Odyssée. Aucune donnée n’est envoyée : ce prototype fonctionne
              entièrement dans votre navigateur.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};
