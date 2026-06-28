import { ArrowLeft, CheckCircle2, Mail, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GoogleLogin } from '@react-oauth/google';
import { RegisterRequest } from '../../../entities/user/types';
import authService from '../../../services/authService';
import { ROUTES } from '../../../shared/constants/routes';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import Input from '../../../shared/ui/Input';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [form, setForm] = useState<RegisterRequest>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (field: keyof RegisterRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    setError('');
    setLoading(true);

    try {
      const user = await authService.loginWithGoogle(credentialResponse.credential);

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

  const handleRequestOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    const requestInstance = plainToInstance(RegisterRequest, form);
    const validationErrors = await validate(requestInstance);
    if (validationErrors.length > 0) {
      const firstError = validationErrors[0];
      setError(Object.values(firstError.constraints || {})[0]);
      return;
    }


    setLoading(true);
    try {
      const response = await authService.requestRegisterOtp(form);
      setMessage(response.message ?? 'Đã gửi OTP thành công.');
      setStep('verify');
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!/^\d{6}$/.test(otp)) {
      setError('OTP phải gồm 6 chữ số.');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyRegisterOtp({ email: form.email, otp });
      navigate(ROUTES.login);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-teal-50/60 to-sky-50" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-teal-200/25 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-1/4 h-64 w-64 rounded-full bg-indigo-200/20 blur-3xl" />

      <Card className="animate-scale-in relative z-10 w-full max-w-xl border-white/40 bg-white/95 p-8 shadow-float backdrop-blur-xl">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25">
            <UserPlus size={22} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-teal-600">Create Account</p>
          <h1 className="mt-1.5 font-display text-3xl font-bold text-slate-900">Đăng ký tài khoản</h1>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
            step === 'register'
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/25'
              : 'bg-teal-100 text-teal-700'
          }`}>1</div>
          <div className={`h-0.5 flex-1 rounded-full transition-all ${step === 'verify' ? 'bg-teal-400' : 'bg-slate-200'}`} />
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
            step === 'verify'
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/25'
              : 'bg-slate-100 text-slate-400'
          }`}>2</div>
        </div>

        {message && (
          <div className="mb-4 animate-scale-in flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={16} className="shrink-0" />
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 animate-scale-in rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            {error}
          </div>
        )}

        {step === 'register' ? (
          <form className="space-y-4" onSubmit={handleRequestOtp}>
            <Input
              label="Họ và tên"
              value={form.fullName}
              onChange={(event) => handleChange('fullName', event.target.value)}
              required
            />
            <Input
              label="Số điện thoại"
              value={form.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
              required
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Mật khẩu"
                type="password"
                value={form.password}
                onChange={(event) => handleChange('password', event.target.value)}
                required
              />
              <Input
                label="Xác nhận"
                type="password"
                value={form.confirmPassword}
                onChange={(event) => handleChange('confirmPassword', event.target.value)}
                required
              />
            </div>

            <Button type="submit" fullWidth disabled={loading} loading={loading}>
              {loading ? 'Đang gửi OTP...' : 'Gửi OTP đăng ký'}
            </Button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleVerify}>
            <Input label="Email" type="email" value={form.email} readOnly />
            <Input
              label="Mã OTP"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
              maxLength={6}
              required
              placeholder="123456"
            />

            <Button type="submit" fullWidth disabled={loading} loading={loading}>
              <Mail size={16} />
              {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
            </Button>

            <Button type="button" variant="secondary" fullWidth onClick={() => setStep('register')}>
              <ArrowLeft size={15} />
              Quay lại form đăng ký
            </Button>
          </form>
        )}

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium text-slate-400">HOẶC</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Đăng nhập Google thất bại.')}
            theme="outline"
            size="large"
            width="450"
            text="signup_with"
          />
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <Link to={ROUTES.login} className="font-semibold text-teal-600 transition-colors hover:text-teal-800 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default RegisterPage;
