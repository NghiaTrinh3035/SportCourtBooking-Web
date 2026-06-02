import { CalendarDays, Clock4, Info, StickyNote } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Court } from '../../../entities/court/types';
import courtService from '../../../services/courtService';
import bookingService from '../../../services/bookingService';
import AppShell from '../../../shared/components/AppShell';
import { ROUTES } from '../../../shared/constants/routes';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { toApiDateTime } from '../../../shared/utils/date';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import Input from '../../../shared/ui/Input';
import { SkeletonCard } from '../../../shared/ui/Skeleton';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const courtId = Number(id);

  const [court, setCourt] = useState<Court | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!Number.isFinite(courtId)) {
      navigate(ROUTES.home);
      return;
    }

    courtService
      .getCourtById(courtId)
      .then(setCourt)
      .catch(() => {
        setCourt(null);
        setError('Không tìm thấy thông tin sân.');
      });
  }, [courtId, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!bookingDate || !startTime || !endTime) {
      setError('Vui lòng điền đầy đủ ngày giờ đặt sân.');
      return;
    }

    if (startTime >= endTime) {
      setError('Giờ kết thúc phải lớn hơn giờ bắt đầu.');
      return;
    }

    setLoading(true);
    try {
      const created = await bookingService.createBooking({
        courtId,
        startTime: toApiDateTime(bookingDate, startTime),
        endTime: toApiDateTime(bookingDate, endTime),
        note,
      });

      setSuccess(`Tạo booking #${created.id} thành công. Vui lòng chờ chủ sân xác nhận.`);
      setBookingDate('');
      setStartTime('');
      setEndTime('');
      setNote('');
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Court Info */}
        {!court ? (
          <SkeletonCard />
        ) : (
          <Card className="relative h-fit overflow-hidden">
            {/* Accent top bar */}
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-teal-500 to-emerald-500" />

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">Court Summary</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">{court.name}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">{court.description || 'Thông tin sân đang được cập nhật.'}</p>
            <div className="mt-5 space-y-2 text-sm text-slate-600">
              <p className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 ring-1 ring-slate-100">
                <Clock4 size={15} className="text-teal-500" />
                {court.openTime} - {court.closeTime}
              </p>
            </div>

            {court.sport && (
              <div className="mt-4">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 ring-1 ring-teal-100">
                  {court.sport.name}
                </span>
              </div>
            )}
          </Card>
        )}

        {/* Booking Form */}
        <Card className="relative overflow-hidden">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />

          <h3 className="font-display text-2xl font-bold text-slate-900">Xác nhận lịch đặt</h3>
          <p className="mt-1 text-sm text-slate-500">Nhập khung giờ mong muốn và ghi chú thêm nếu cần.</p>

          {error && (
            <div className="mt-4 animate-scale-in rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 animate-scale-in rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {success}
            </div>
          )}

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
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

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Ghi chú</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white/90 px-3.5 py-2.5 text-sm text-slate-800 shadow-sm transition-all duration-200 placeholder:text-slate-300 hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none"
                placeholder="Ví dụ: Cần bật đèn sân từ sớm 10 phút"
              />
            </label>

            <div className="flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50/50 px-3.5 py-2.5 text-xs text-sky-700">
              <Info size={14} className="shrink-0" />
              <span>Booking sẽ ở trạng thái PENDING cho đến khi chủ sân xác nhận.</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={loading} loading={loading}>
                <CalendarDays size={16} />
                {loading ? 'Đang tạo booking...' : 'Tạo booking'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.home)}>
                <StickyNote size={16} />
                Quay lại danh sách
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
};

export default BookingPage;
