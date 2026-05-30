'use client';

import React, { useState, useActionState, startTransition } from 'react';
import { 
  signUpAction, 
  loginWithPasswordAction, 
  loginWithMagicLinkAction, 
  signInWithOAuthAction 
} from '../actions/auth';

type AuthMode = 'login' | 'register' | 'magic';

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  // React 19 / Next.js 15 Server Action hook integration
  const [signUpState, runSignUp, isSignUpPending] = useActionState(signUpAction, null);
  const [loginState, runLogin, isLoginPending] = useActionState(loginWithPasswordAction, null);
  const [magicState, runMagic, isMagicPending] = useActionState(loginWithMagicLinkAction, null);

  const t = {
    ar: {
      title: 'بوابة العملاء المميزة',
      subtitle: 'سجل دخولك للاستمتاع بأسرع تجربة تسوق في الخليج',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      loginBtn: 'تسجيل الدخول',
      registerBtn: 'إنشاء حساب جديد',
      sendMagicBtn: 'إرسال رابط الدخول السريع',
      or: 'أو عبر',
      google: 'جوجل',
      apple: 'آبل',
      noAccount: 'ليس لديك حساب؟ سجل الآن',
      hasAccount: 'لديك حساب بالفعل؟ سجل دخولك',
      magicLinkOption: 'الدخول بدون كلمة مرور (رابط سحري)',
      passwordOption: 'الدخول بكلمة المرور',
      successMsg: 'تم بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد العملية.',
    },
    en: {
      title: 'Elite Customer Portal',
      subtitle: 'Sign in to experience the fastest checkout in the GCC',
      email: 'Email Address',
      password: 'Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      loginBtn: 'Sign In',
      registerBtn: 'Create New Account',
      sendMagicBtn: 'Send Magic Link',
      or: 'Or continue with',
      google: 'Google',
      apple: 'Apple',
      noAccount: "Don't have an account? Sign Up",
      hasAccount: 'Already have an account? Sign In',
      magicLinkOption: 'Sign in passwordless (Magic Link)',
      passwordOption: 'Sign in with password',
      successMsg: 'Success! Please check your email to complete verification.',
    }
  }[lang];

  const currentPending = isSignUpPending || isLoginPending || isMagicPending;
  const currentError = signUpState?.error || loginState?.error || magicState?.error;
  const currentSuccess = signUpState?.success || magicState?.success;

  const handleOAuth = (provider: 'google' | 'apple') => {
    startTransition(() => {
      signInWithOAuthAction(provider);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Harmonious Sleek Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full" />

      {/* Language Switcher */}
      <button 
        onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        className="absolute top-6 right-6 bg-slate-900/60 border border-slate-800 hover:bg-slate-800 text-sm font-semibold px-4 py-2 rounded-full backdrop-blur-md transition-colors"
      >
        {lang === 'ar' ? 'English' : 'العربية'}
      </button>

      <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-sm opacity-60 max-w-xs mx-auto">{t.subtitle}</p>
        </div>

        {/* Dynamic Alerts */}
        {currentError && (
          <div className="bg-red-950/40 border border-red-800/60 text-red-300 text-sm rounded-2xl p-4 text-center">
            {currentError}
          </div>
        )}

        {currentSuccess && (
          <div className="bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-sm rounded-2xl p-4 text-center">
            {t.successMsg}
          </div>
        )}

        {/* Credentials Forms */}
        {mode === 'login' && (
          <form action={runLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold opacity-80">{t.email}</label>
              <input 
                name="email"
                type="email"
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold opacity-80">{t.password}</label>
              <input 
                name="password"
                type="password"
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
              />
            </div>
            <button 
              type="submit"
              disabled={currentPending}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl py-3 text-sm transition-opacity shadow-lg shadow-indigo-600/20"
            >
              {currentPending ? '...' : t.loginBtn}
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form action={runSignUp} className="space-y-4">
            <input type="hidden" name="lang" value={lang} />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold opacity-80">{t.firstName}</label>
                <input 
                  name="firstName"
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold opacity-80">{t.lastName}</label>
                <input 
                  name="lastName"
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold opacity-80">{t.email}</label>
              <input 
                name="email"
                type="email"
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold opacity-80">{t.password}</label>
              <input 
                name="password"
                type="password"
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
              />
            </div>
            <button 
              type="submit"
              disabled={currentPending}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl py-3 text-sm transition-opacity shadow-lg shadow-indigo-600/20"
            >
              {currentPending ? '...' : t.registerBtn}
            </button>
          </form>
        )}

        {mode === 'magic' && (
          <form action={runMagic} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold opacity-80">{t.email}</label>
              <input 
                name="email"
                type="email"
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
              />
            </div>
            <button 
              type="submit"
              disabled={currentPending}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl py-3 text-sm transition-opacity shadow-lg shadow-indigo-600/20"
            >
              {currentPending ? '...' : t.sendMagicBtn}
            </button>
          </form>
        )}

        {/* Separator */}
        <div className="flex items-center my-4 opacity-30 text-xs">
          <div className="flex-grow border-t border-white" />
          <span className="px-3 uppercase tracking-wider">{t.or}</span>
          <div className="flex-grow border-t border-white" />
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleOAuth('google')}
            className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 rounded-xl py-3 text-sm font-semibold transition-colors"
          >
            <span>🌐</span>
            <span>{t.google}</span>
          </button>
          <button 
            onClick={() => handleOAuth('apple')}
            className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 rounded-xl py-3 text-sm font-semibold transition-colors"
          >
            <span></span>
            <span>{t.apple}</span>
          </button>
        </div>

        {/* Mode Toggles */}
        <div className="flex flex-col text-center gap-2 text-xs font-medium opacity-80 pt-2">
          {mode === 'login' && (
            <>
              <button onClick={() => setMode('register')} className="hover:text-indigo-400 transition-colors">
                {t.noAccount}
              </button>
              <button onClick={() => setMode('magic')} className="hover:text-indigo-400 transition-colors">
                {t.magicLinkOption}
              </button>
            </>
          )}
          {mode === 'register' && (
            <button onClick={() => setMode('login')} className="hover:text-indigo-400 transition-colors">
              {t.hasAccount}
            </button>
          )}
          {mode === 'magic' && (
            <button onClick={() => setMode('login')} className="hover:text-indigo-400 transition-colors">
              {t.passwordOption}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
