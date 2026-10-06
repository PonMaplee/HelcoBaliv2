/**
 * Auth.jsx — Gerai sign in / sign up (terhubung ke backend).
 *
 * - Login: email + password → token disimpan di localStorage.
 * - Signup: nama + email + password + nama gerai + lokasi,
 *   membuat user staf + store berstatus "Diajukan" (menunggu admin).
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setSession } from './dashboardApi';

const inputClass = 'w-full bg-[#111] border border-white/10 rounded-none px-4 py-3.5 text-sm text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60 transition-colors';

export default function Auth({ mode, t }) {
  const navigate = useNavigate();
  const isLogin = mode !== 'signup';
  const [form, setForm] = useState({ name: '', email: '', password: '', storeName: '', location: '' });
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key) => (event) => setForm((old) => ({ ...old, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setError('');
    setOk('');
    setBusy(true);
    try {
      if (isLogin) {
        const { user, token } = await api.login(form.email, form.password);
        setSession({ token, user });
        navigate('/dashboard', { replace: true });
      } else {
        await api.register({
          name: form.name,
          email: form.email,
          password: form.password,
          storeName: form.storeName,
          location: form.location,
        });
        setOk(t.auth.successSignup);
        window.setTimeout(() => navigate('/login', { replace: true }), 900);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-stone-300 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-block text-amber-500 font-serif text-xl tracking-[0.3em] uppercase mb-10">HelcoBali</Link>
        <h1 className="text-3xl md:text-4xl font-serif text-white mb-3">{isLogin ? t.auth.loginTitle : t.auth.signupTitle}</h1>
        <p className="text-stone-400 font-light mb-8">{isLogin ? t.auth.loginDesc : t.auth.signupDesc}</p>
        <form onSubmit={submit} className="space-y-4">
          {!isLogin && (
            <label className="block">
              <span className="block text-xs uppercase tracking-widest text-stone-500 mb-2">{t.auth.name}</span>
              <input className={inputClass} required maxLength={100} value={form.name} onChange={set('name')} autoComplete="name" />
            </label>
          )}
          <label className="block">
            <span className="block text-xs uppercase tracking-widest text-stone-500 mb-2">{t.auth.email}</span>
            <input className={inputClass} type="email" required maxLength={120} value={form.email} onChange={set('email')} autoComplete="email" />
          </label>
          <label className="block">
            <span className="block text-xs uppercase tracking-widest text-stone-500 mb-2">{t.auth.password}</span>
            <input className={inputClass} type="password" required minLength={6} maxLength={100} value={form.password} onChange={set('password')} autoComplete={isLogin ? 'current-password' : 'new-password'} />
          </label>
          {!isLogin && (
            <>
              <label className="block">
                <span className="block text-xs uppercase tracking-widest text-stone-500 mb-2">{t.auth.storeName}</span>
                <input className={inputClass} required maxLength={100} placeholder={t.auth.storeNamePh} value={form.storeName} onChange={set('storeName')} />
              </label>
              <label className="block">
                <span className="block text-xs uppercase tracking-widest text-stone-500 mb-2">{t.auth.storeLocation}</span>
                <input className={inputClass} required maxLength={120} placeholder={t.auth.storeLocationPh} value={form.location} onChange={set('location')} />
              </label>
            </>
          )}
          {error && <p role="alert" className="text-sm text-red-400 border border-red-500/30 bg-red-500/5 px-4 py-3">{error}</p>}
          {ok && <p role="status" className="text-sm text-amber-400 border border-amber-500/30 bg-amber-500/5 px-4 py-3">{ok}</p>}
          {isLogin && (
            <div className="border border-white/10 bg-white/[0.02] px-4 py-3 flex flex-col gap-2">
              <p className="text-xs text-stone-500">{t.auth.adminDemo}</p>
              <button
                type="button"
                onClick={() => setForm((old) => ({ ...old, email: 'admin@helcobali.id', password: 'admin123' }))}
                className="self-start text-amber-500 hover:text-amber-400 uppercase tracking-[0.15em] text-xs font-semibold"
              >
                {t.auth.autofillAdmin}
              </button>
            </div>
          )}
          <button type="submit" disabled={busy} className="w-full bg-white text-black font-semibold tracking-[0.2em] uppercase text-sm px-10 py-4 hover:bg-amber-500 transition-colors disabled:opacity-60">
            {isLogin ? t.auth.loginBtn : t.auth.signupBtn}
          </button>
        </form>
        <div className="mt-8 flex flex-col gap-3 text-sm">
          <Link to={isLogin ? '/signup' : '/login'} className="text-amber-500 hover:text-amber-400 uppercase tracking-[0.15em] text-xs font-semibold">
            {isLogin ? t.auth.toSignup : t.auth.toLogin}
          </Link>
          <Link to="/" className="text-stone-500 hover:text-stone-300 uppercase tracking-[0.15em] text-xs">
            {t.auth.backHome}
          </Link>
        </div>
      </div>
    </main>
  );
}
