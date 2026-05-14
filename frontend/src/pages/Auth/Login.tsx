import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { Layers, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { signInWithEmail, signInWithGoogle, loading } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [error, setError] = useState('');

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    const result = await signInWithEmail(data.email, data.password);
    if (result.error) {
      setError(result.error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-pebble p-container-padding w-full max-w-md flex flex-col gap-lg">
      {/* Header */}
      <div className="flex flex-col gap-sm text-center items-center">
        <Layers size={48} className="text-primary" strokeWidth={1.5} />
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tighter">Welcome Back</h1>
        <p className="font-body-md text-body-md text-secondary">Sign in to continue your preparation.</p>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container px-md py-sm rounded-btn font-label-sm text-label-sm text-center">
          {error}
        </div>
      )}

      {/* Google Sign In */}
      <button
        onClick={() => signInWithGoogle()}
        className="w-full bg-surface-container-lowest text-primary border border-outline-variant rounded-btn py-sm font-label-bold text-label-bold flex items-center justify-center gap-sm hover:bg-surface-container-low transition-colors"
        type="button"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-md">
        <div className="flex-1 h-px bg-outline-variant" />
        <span className="font-label-sm text-label-sm text-secondary">or</span>
        <div className="flex-1 h-px bg-outline-variant" />
      </div>

      {/* Email Form */}
      <form className="flex flex-col gap-md" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-xs">
          <label className="font-label-bold text-label-bold text-on-background" htmlFor="email">Email</label>
          <input
            {...register('email', { required: 'Email is required' })}
            className="bg-surface-container-lowest border border-outline-variant rounded-input px-md py-sm focus:border-primary focus:ring-0 font-body-md text-body-md text-on-background placeholder:text-outline outline-none transition-colors"
            id="email"
            placeholder="you@email.com"
            type="email"
            autoComplete="email"
          />
          {errors.email && <span className="text-error font-label-sm text-label-sm">{errors.email.message}</span>}
        </div>
        <div className="flex flex-col gap-xs">
          <label className="font-label-bold text-label-bold text-on-background" htmlFor="password">Password</label>
          <input
            {...register('password', { required: 'Password is required' })}
            className="bg-surface-container-lowest border border-outline-variant rounded-input px-md py-sm focus:border-primary focus:ring-0 font-body-md text-body-md text-on-background placeholder:text-outline outline-none transition-colors"
            id="password"
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
          />
          {errors.password && <span className="text-error font-label-sm text-label-sm">{errors.password.message}</span>}
        </div>
        <button
          className="w-full bg-primary text-on-primary rounded-btn py-sm font-label-bold text-label-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-sm"
          type="submit"
          disabled={loading}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Sign In
        </button>
      </form>

      <div className="text-center">
        <p className="font-label-sm text-label-sm text-secondary">
          Don&apos;t have an account?{' '}
          <Link className="text-primary font-label-bold text-label-bold hover:underline" to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
