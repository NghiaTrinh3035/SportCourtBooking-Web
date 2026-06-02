import { CalendarPlus, ClipboardList, UserPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Booking } from '../../../entities/booking/types';
import type { Court } from '../../../entities/court/types';
import type { User } from '../../../entities/user/types';
import authService from '../../../services/authService';
import bookingService from '../../../services/bookingService';
import courtService from '../../../services/courtService';
import AppShell from '../../../shared/components/AppShell';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { toApiDateTime, toHumanDateTime } from '../../../shared/utils/date';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import Input from '../../../shared/ui/Input';
import Badge from '../../../shared/ui/Badge';
import EmptyState from '../../../shared/ui/EmptyState';

const statusBadge: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'brand'; pulse?: boolean }> = {
  PENDING: { variant: 'warning', pulse: true },
  CONFIRMED: { variant: 'info' },
  DEPOSITED: { variant: 'brand' },
  COMPLETED: { variant: 'success' },
  CANCELED: { variant: 'error' },
};

const StaffOperationsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [guest, setGuest] = useState<User | null>(null);
  const [courtId, setCourtId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [bookings]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [bookingData, courtData] = await Promise.all([
        bookingService.getMyBookings(),
        courtService.getAllCourts(),
      ]);
      setBookings(bookingData);
      setCourts(courtData.filter((court) => court.active));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleCreateWalkIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const data = await authService.createWalkInGuest(walkInName.trim(), walkInPhone.trim());
      setGuest(data);
      setMessage(`Đã tạo khách vãng lai: ${data.fullName} (#${data.id})`);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  };

  const handleCreateBookingForGuest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!guest) {
      setError('Vui lòng tạo hoặc chọn khách vãng lai trước.');
      return;
    }

    if (!courtId || !bookingDate || !startTime || !endTime) {
      setError('Vui lòng nhập đầy đủ thông tin đặt sân hộ.');
      return;
    }

    setError('');
    setMessage('');

    try {
      await bookingService.createBooking({
        courtId: Number(courtId),
        userId: guest.id,
        startTime: toApiDateTime(bookingDate, startTime),
        endTime: toApiDateTime(bookingDate, endTime),
        note,
      });
      setMessage('Đã tạo booking hộ khách thành công.');
      setNote('');
      await loadData();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  };

  const handleStatusChange = async (bookingId: number, status: 'CONFIRMED' | 'DEPOSITED' | 'COMPLETED' | 'CANCELED') => {
    setError('');

    try {
      await bookingService.updateBookingStatus({
        id: bookingId,
        status,
        cancelReason: status === 'CANCELED' ? 'STAFF cập nhật hủy đơn.' : undefined,
      });
      await loadData();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  };

  return (
    <AppShell>
      {/* Messages */}
      {error && (
        <div className="mb-6 animate-scale-in rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-6 animate-scale-in rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}

      {/* Walk-in & Booking Forms */}
      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        {/* Walk-in Guest */}
        <Card className="relative overflow-hidden">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-amber-400 to-orange-400" />

          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-md shadow-amber-400/25">
              <UserPlus size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Walk-in Guest</p>
              <h2 className="font-display text-lg font-bold text-slate-900">Tạo khách vãng lai</h2>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleCreateWalkIn}>
            <Input
              label="Họ tên khách"
              value={walkInName}
              onChange={(event) => setWalkInName(event.target.value)}
              required
            />
            <Input
              label="Số điện thoại"
              value={walkInPhone}
              onChange={(event) => setWalkInPhone(event.target.value)}
              required
            />
            <Button type="submit">
              <UserPlus size={15} />
              Tạo khách
            </Button>
          </form>
        </Card>

        {/* Staff Booking */}
        <Card className="relative overflow-hidden">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-teal-500 to-emerald-500" />

          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/25">
              <CalendarPlus size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">Staff Booking</p>
              <h2 className="font-display text-lg font-bold text-slate-900">Đặt sân hộ khách</h2>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleCreateBookingForGuest}>
            <Input label="Khách hiện tại" value={guest ? `${guest.fullName} (#${guest.id})` : ''} readOnly />

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Sân</span>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm transition-all hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none"
                value={courtId}
                onChange={(event) => setCourtId(event.target.value)}
                required
              >
                <option value="">Chọn sân</option>
                {courts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-3">
              <Input
                label="Ngày"
                type="date"
                value={bookingDate}
                onChange={(event) => setBookingDate(event.target.value)}
                required
              />
              <Input
                label="Bắt đầu"
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                required
              />
              <Input
                label="Kết thúc"
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                required
              />
            </div>

            <Input
              label="Ghi chú"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ghi chú thêm nếu cần"
            />

            <Button type="submit">
              <CalendarPlus size={15} />
              Tạo booking hộ
            </Button>
          </form>
        </Card>
      </div>

      {/* Booking Queue */}
      <Card className="relative overflow-hidden">
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/25">
            <ClipboardList size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">Staff Queue</p>
            <h2 className="font-display text-lg font-bold text-slate-900">Xử lý booking</h2>
          </div>
        </div>

        <div className="space-y-3">
          {!loading && sortedBookings.length === 0 && (
            <EmptyState
              icon={ClipboardList}
              title="Chưa có booking nào để xử lý"
              description="Booking mới sẽ xuất hiện ở đây."
            />
          )}

          {sortedBookings.map((booking) => {
            const badgeConfig = statusBadge[booking.status] ?? { variant: 'neutral' as const };
            return (
              <div
                key={booking.id}
                className="rounded-xl border border-slate-100 bg-white p-4 transition-all duration-200 hover:border-slate-200 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">Booking #{booking.id}</p>
                  <Badge variant={badgeConfig.variant} pulse={badgeConfig.pulse}>
                    {booking.status}
                  </Badge>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                  <span>👤 {booking.user?.fullName ?? 'N/A'}</span>
                  <span className="text-slate-200">|</span>
                  <span>🏟️ {booking.court?.name ?? 'N/A'}</span>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {toHumanDateTime(booking.startTime)} → {toHumanDateTime(booking.endTime)}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {booking.status === 'PENDING' && (
                    <Button type="button" onClick={() => void handleStatusChange(booking.id, 'CONFIRMED')}>
                      Xác nhận
                    </Button>
                  )}

                  {booking.status === 'CONFIRMED' && (
                    <Button type="button" onClick={() => void handleStatusChange(booking.id, 'DEPOSITED')}>
                      Đánh dấu đã cọc
                    </Button>
                  )}

                  {(booking.status === 'CONFIRMED' || booking.status === 'DEPOSITED') && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => void handleStatusChange(booking.id, 'COMPLETED')}
                    >
                      Hoàn tất
                    </Button>
                  )}

                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED' || booking.status === 'DEPOSITED') && (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => void handleStatusChange(booking.id, 'CANCELED')}
                    >
                      Hủy đơn
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </AppShell>
  );
};

export default StaffOperationsPage;
