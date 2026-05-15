import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { UserPlus, Loader2, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUpWithEmail, signInWithGoogle, loading } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>();
  const [error, setError] = useState('');

  const onSubmit = async (data: SignupFormData) => {
    setError('');
    const result = await signUpWithEmail(data.email, data.password, data.firstName, data.lastName);
    if (result.error) {
      setError(result.error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 animate-fade-in">
      <div className="glass rounded-[40px] p-10 md:p-16 w-full max-w-[550px] shadow-premium relative overflow-hidden">
        {/* Animated Background Element */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-3xl animate-pulse" />
        
        {/* Header */}
        <div className="relative z-10 flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-inner">
            <UserPlus size={32} />
          </div>
          <h1 className="font-display text-4xl font-bold text-primary tracking-tight mb-3">Join the Simulation.</h1>
          <p className="font-body-md text-secondary text-base max-w-[320px]">
            Start your journey toward elite interview performance today.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 font-label-bold text-xs text-center animate-shake">
            {error}
          </div>
        )}

        {/* Google Sign Up */}
        <button
          onClick={() => signInWithGoogle()}
          className="w-full relative z-10 glass border border-outline-variant/30 rounded-2xl py-4 font-label-bold text-sm text-primary flex items-center justify-center gap-3 hover:bg-white/40 transition-all hover:shadow-md mb-8"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center mb-8">
          <div className="flex-1 h-px bg-outline-variant/30" />
          <span className="px-4 font-label-bold text-[10px] text-outline uppercase tracking-widest bg-transparent">or create neural profile</span>
          <div className="flex-1 h-px bg-outline-variant/30" />
        </div>

        {/* Email Form */}
        <form className="space-y-6 relative z-10" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-label-bold text-xs text-primary uppercase tracking-widest pl-1" htmlFor="firstName">First Name</label>
              <input
                {...register('firstName', { required: 'Required' })}
                className="w-full glass border border-outline-variant/30 rounded-2xl px-6 py-4 focus:border-primary/50 focus:ring-0 font-body-md text-sm text-primary placeholder:text-outline outline-none transition-all"
                id="firstName"
                placeholder="First name"
                type="text"
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-bold text-xs text-primary uppercase tracking-widest pl-1" htmlFor="lastName">Last Name</label>
              <input
                {...register('lastName', { required: 'Required' })}
                className="w-full glass border border-outline-variant/30 rounded-2xl px-6 py-4 focus:border-primary/50 focus:ring-0 font-body-md text-sm text-primary placeholder:text-outline outline-none transition-all"
                id="lastName"
                placeholder="Last name"
                type="text"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-label-bold text-xs text-primary uppercase tracking-widest pl-1" htmlFor="signupEmail">Email Address</label>
            <input
              {...register('email', { required: 'Email is required' })}
              className="w-full glass border border-outline-variant/30 rounded-2xl px-6 py-4 focus:border-primary/50 focus:ring-0 font-body-md text-sm text-primary placeholder:text-outline outline-none transition-all"
              id="signupEmail"
              placeholder="you@email.com"
              type="email"
              autoComplete="email"
            />
          </div>
          
          <div className="space-y-2">
            <label className="font-label-bold text-xs text-primary uppercase tracking-widest pl-1" htmlFor="signupPassword">Security Key</label>
            <input
              {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })}
              className="w-full glass border border-outline-variant/30 rounded-2xl px-6 py-4 focus:border-primary/50 focus:ring-0 font-body-md text-sm text-primary placeholder:text-outline outline-none transition-all"
              id="signupPassword"
              placeholder="Minimum 6 characters"
              type="password"
              autoComplete="new-password"
            />
            {errors.password && <span className="text-red-500 font-label-bold text-[10px] pl-1">{errors.password.message}</span>}
          </div>

          <button
            className="w-full bg-primary text-on-primary rounded-2xl py-4 font-display font-bold text-base hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
            type="submit"
            disabled={loading}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            Initialize Profile
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-outline-variant/30 text-center relative z-10">
          <p className="font-body-sm text-secondary text-sm">
            Already have a profile?{' '}
            <Link className="text-primary font-label-bold hover:underline inline-flex items-center gap-1 group" to="/login">
              Access Vault <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
