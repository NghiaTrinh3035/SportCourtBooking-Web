import { LogIn, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../../services/authService';
import { ROUTES } from '../../../shared/constants/routes';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import Input from '../../../shared/ui/Input';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authService.login(email, password);

      if (user.role === 'OWNER') {
        navigate(ROUTES.ownerDashboard);
      } else if (user.role === 'STAFF') {
        navigate(ROUTES.staffOperations);
      } else {
        navigate(ROUTES.home);
      }
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-hero" />

      {/* Decorative floating shapes */}
      <div className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 animate-float rounded-full bg-teal-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-1/4 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" style={{ animationDelay: '2s', animation: 'float 8s ease-in-out infinite' }} />
      <div className="pointer-events-none absolute left-1/3 top-16 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" style={{ animationDelay: '4s', animation: 'float 10s ease-in-out infinite' }} />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <Card className="animate-scale-in relative z-10 w-full max-w-md border-white/30 bg-white/95 p-8 shadow-float backdrop-blur-xl">
        <div className="mb-7">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25">
            <LogIn size={22} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-teal-600">Welcome Back</p>
          <h1 className="mt-1.5 font-display text-3xl font-bold text-slate-900">Đăng nhập</h1>
          <p className="mt-2 text-sm text-slate-500">Sử dụng tài khoản để tiếp tục đặt sân thể thao.</p>
        </div>

        {error && (
          <div className="mb-4 animate-scale-in rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="owner@example.com"
          />
          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder="••••••••"
          />

          <Button type="submit" fullWidth disabled={loading} loading={loading}>
            <LogIn size={16} />
            {loading ? 'Đang xử lý...' : 'Đăng nhập ngay'}
          </Button>
        </form>

        <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-teal-100 bg-teal-50/50 px-3.5 py-2.5 text-xs text-teal-700">
          <ShieldCheck size={14} className="shrink-0" />
          <span>Bảo mật bằng JWT token của backend Spring Boot.</span>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Chưa có tài khoản?{' '}
          <Link to={ROUTES.register} className="font-semibold text-teal-600 transition-colors hover:text-teal-800 hover:underline">
            Đăng ký OTP
          </Link>
        </p>

        <p className="mt-3 text-center text-xs text-slate-400">
          <Mail size={12} className="mr-1 inline-block" />
          OTP đăng ký sẽ được gửi qua email.
        </p>
      </Card>
    </div>
  );
};

export default LoginPage;
