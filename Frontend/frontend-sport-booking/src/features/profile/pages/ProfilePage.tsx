import { CalendarRange, CreditCard, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Booking } from '../../../entities/booking/types';
import type { User } from '../../../entities/user/types';
import bookingService from '../../../services/bookingService';
import userService from '../../../services/userService';
import AppShell from '../../../shared/components/AppShell';
import { ROUTES } from '../../../shared/constants/routes';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { toHumanDateTime } from '../../../shared/utils/date';
import Input from '../../../shared/ui/Input';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import Badge from '../../../shared/ui/Badge';
import EmptyState from '../../../shared/ui/EmptyState';

const statusBadge: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'brand'; pulse?: boolean }> = {
  PENDING: { variant: 'warning', pulse: true },
  CONFIRMED: { variant: 'info' },
  DEPOSITED: { variant: 'brand' },
  COMPLETED: { variant: 'success' },
  CANCELED: { variant: 'error' },
};

const ProfilePage = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    userService
      .getMyProfile()
      .then((data) => {
        setProfile(data);
        setFullName(data.fullName);
        setPhone(data.phone);
      })
      .catch((fetchError) => setError(getApiErrorMessage(fetchError)));

    bookingService
      .getMyBookings()
      .then(setBookings)
      .catch(() => setBookings([]));
  }, []);

  const handleSave = async () => {
    if (!profile) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const updated = await userService.updateMyProfile({ fullName, phone });
      setProfile(updated);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        {/* Profile Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-teal-500 to-emerald-500" />

          {/* Avatar */}
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-xl font-bold text-white shadow-lg shadow-teal-500/25">
              {profile?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">My Profile</p>
              <h2 className="font-display text-xl font-bold text-slate-900">Thông tin cá nhân</h2>
            </div>
          </div>

          {error && (
            <div className="mb-4 animate-scale-in rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Họ và tên"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
            <Input label="Email" value={profile?.email ?? ''} readOnly />
            <Input
              label="Số điện thoại"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>

          <Button className="mt-5" onClick={handleSave} disabled={saving} loading={saving}>
            <Save size={16} />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </Card>

        {/* Booking History */}
        <Card className="relative overflow-hidden">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">Booking History</p>
          <h2 className="mt-1 font-display text-xl font-bold text-slate-900">Lịch sử đặt sân của tôi</h2>

          <div className="mt-5 space-y-3">
            {bookings.length === 0 && (
              <EmptyState
                icon={CalendarRange}
                title="Chưa có đơn đặt sân nào"
                description="Đơn đặt sân sẽ xuất hiện ở đây khi bạn tạo booking."
              />
            )}

            {bookings.map((booking) => {
              const badgeConfig = statusBadge[booking.status] ?? { variant: 'neutral' as const };
              return (
                <div
                  key={booking.id}
                  className="rounded-xl border border-slate-100 bg-white p-4 transition-all duration-200 hover:border-slate-200 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-800">Booking #{booking.id}</p>
                    <Badge variant={badgeConfig.variant} pulse={badgeConfig.pulse}>
                      {booking.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{booking.court?.name ?? 'Sân đã đặt'}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {toHumanDateTime(booking.startTime)} - {toHumanDateTime(booking.endTime)}
                  </p>
                  {booking.status === 'CONFIRMED' && (
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <Button onClick={() => navigate(`${ROUTES.payment}/${booking.id}`)}>
                        <CreditCard size={15} />
                        Thanh toán cọc
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
};

export default ProfilePage;
