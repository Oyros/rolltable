import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { ref, update } from 'firebase/database';
import { auth, db, googleProvider } from '../firebase.js';
import { applyTheme, DEFAULT_THEME_ID } from '../utils/themes.js';
import { validateNickname, isNicknameAvailable, claimNickname } from '../utils/nickname.js';
import ParticleEffect from '../components/ParticleEffect.jsx';

async function createProfile(uid, { nickname, email, authProvider, avatarUrl }) {
  const nicknameLower = await claimNickname(uid, nickname);
  await update(ref(db, `users/${uid}`), {
    nickname: nickname.trim(),
    nicknameLower,
    email: email || null,
    authProvider,
    avatarUrl: avatarUrl || null,
    hideActivity: false,
    createdAt: Date.now(),
  });
}

function NicknameField({ value, onChange, onValidityChange, onCheckingChange }) {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState(''); // '', 'ok', 'taken', 'invalid'

  useEffect(() => {
    const formatError = validateNickname(value);
    onValidityChange(false); // stale until this run proves otherwise
    if (!value) {
      setStatus('');
      onCheckingChange(false);
      return undefined;
    }
    if (formatError) {
      setStatus('invalid');
      onCheckingChange(false);
      return undefined;
    }
    setChecking(true);
    onCheckingChange(true);
    const timer = setTimeout(async () => {
      try {
        const available = await isNicknameAvailable(value);
        setStatus(available ? 'ok' : 'taken');
        onValidityChange(available);
      } catch (err) {
        setStatus(`error:${err.message}`);
        onValidityChange(false);
      }
      setChecking(false);
      onCheckingChange(false);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <label>
      Kullanıcı Adı
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="benzersiz_ad"
        autoComplete="username"
      />
      {checking && <span className="nickname-hint muted">Kontrol ediliyor...</span>}
      {!checking && status === 'ok' && <span className="nickname-hint ok">✓ Müsait</span>}
      {!checking && status === 'taken' && <span className="nickname-hint danger">Bu kullanıcı adı alınmış.</span>}
      {!checking && status === 'invalid' && value && (
        <span className="nickname-hint danger">{validateNickname(value)}</span>
      )}
      {!checking && status.startsWith('error:') && (
        <span className="nickname-hint danger">Kontrol edilemedi: {status.slice(6)}</span>
      )}
    </label>
  );
}

export default function Auth({ authUser, mode }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [nicknameValid, setNicknameValid] = useState(false);
  const [nicknameChecking, setNicknameChecking] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    applyTheme(DEFAULT_THEME_ID);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(loginErrorMessage(err));
    }
    setBusy(false);
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError('Şifre sıfırlama için önce email adresini yaz.');
      return;
    }
    setBusy(true);
    setError('');
    setInfo('');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo('Şifre sıfırlama linki email adresine gönderildi.');
    } catch (err) {
      setError(loginErrorMessage(err));
    }
    setBusy(false);
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (nicknameChecking) {
      setError('Kullanıcı adı kontrol ediliyor, birkaç saniye bekle.');
      return;
    }
    if (!nicknameValid) {
      setError('Geçerli ve müsait bir kullanıcı adı seç.');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    if (!acceptedTerms) {
      setError('Devam etmek için kullanım koşullarını kabul etmelisin.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await createProfile(cred.user.uid, { nickname, email: email.trim(), authProvider: 'password' });
    } catch (err) {
      setError(loginErrorMessage(err));
    }
    setBusy(false);
  }

  async function handleGoogle() {
    setBusy(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      // If this is a brand-new user, App.jsx will see authUser-without-profile
      // and re-render this component in "complete-profile" mode.
    } catch (err) {
      setError(loginErrorMessage(err));
    }
    setBusy(false);
  }

  async function handleCompleteProfile(e) {
    e.preventDefault();
    if (nicknameChecking) {
      setError('Kullanıcı adı kontrol ediliyor, birkaç saniye bekle.');
      return;
    }
    if (!nicknameValid) {
      setError('Geçerli ve müsait bir kullanıcı adı seç.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await createProfile(authUser.uid, {
        nickname,
        email: authUser.email,
        authProvider: 'google',
        avatarUrl: authUser.photoURL,
      });
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  if (mode === 'complete-profile') {
    return (
      <div className="home-screen">
        <ParticleEffect theme={DEFAULT_THEME_ID} />
        <div className="home-card panel">
          <h1 className="title-font">RollTable</h1>
          <p className="subtitle">Son bir adım — kullanıcı adı seç</p>
          <form onSubmit={handleCompleteProfile}>
            <NicknameField value={nickname} onChange={setNickname} onValidityChange={setNicknameValid} onCheckingChange={setNicknameChecking} />
            {error && <p className="sound-error">{error}</p>}
            <button type="submit" className="btn-primary" disabled={busy || !nicknameValid}>
              {busy ? 'Kaydediliyor...' : 'Devam Et'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="home-screen">
      <ParticleEffect theme={DEFAULT_THEME_ID} />
      <div className="home-card panel">
        <h1 className="title-font">RollTable</h1>
        <p className="subtitle">Sanal Masaya Katılmak İçin Giriş Yap</p>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => {
              setTab('login');
              setError('');
              setInfo('');
            }}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            className={`auth-tab${tab === 'signup' ? ' active' : ''}`}
            onClick={() => {
              setTab('signup');
              setError('');
              setInfo('');
            }}
          >
            Kayıt Ol
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                autoComplete="email"
                required
              />
            </label>
            <label>
              Şifre
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </label>
            <button type="button" className="auth-forgot-link" onClick={handleForgotPassword}>
              Şifremi unuttum
            </button>

            {error && <p className="sound-error">{error}</p>}
            {info && <p className="auth-info">{info}</p>}

            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? 'Bekleniyor...' : 'Giriş Yap'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <NicknameField value={nickname} onChange={setNickname} onValidityChange={setNicknameValid} onCheckingChange={setNicknameChecking} />
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                autoComplete="email"
                required
              />
            </label>
            <label>
              Şifre
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="En az 6 karakter"
                autoComplete="new-password"
                required
              />
            </label>
            <label>
              Şifre (Tekrar)
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </label>
            <label className="auth-terms">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              Kullanım koşullarını kabul ediyorum.
            </label>

            {error && <p className="sound-error">{error}</p>}

            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </button>
          </form>
        )}

        <div className="auth-divider">
          <span>veya</span>
        </div>
        <button type="button" className="btn-ghost auth-google-btn" onClick={handleGoogle} disabled={busy}>
          <GoogleIcon /> Google ile Devam Et
        </button>
      </div>
    </div>
  );
}

function loginErrorMessage(err) {
  const map = {
    'auth/invalid-email': 'Geçersiz email adresi.',
    'auth/user-not-found': 'Bu email ile kayıtlı bir hesap yok.',
    'auth/wrong-password': 'Şifre yanlış.',
    'auth/invalid-credential': 'Email veya şifre yanlış.',
    'auth/email-already-in-use': 'Bu email zaten kayıtlı — giriş yapmayı dene.',
    'auth/weak-password': 'Şifre çok zayıf, en az 6 karakter olmalı.',
    'auth/popup-closed-by-user': 'Google penceresi kapatıldı.',
    'auth/too-many-requests': 'Çok fazla deneme yapıldı, birazdan tekrar dene.',
  };
  return map[err.code] || err.message;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.35 2.83.94 4.03l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.97l3.01 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}
