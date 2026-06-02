import { CalendarCheck, DollarSign, LayoutGrid, RefreshCcw, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Booking } from '../../../entities/booking/types';
import type { AdminDashboardSummary } from '../../../entities/dashboard/types';
import bookingService from '../../../services/bookingService';
import ownerService from '../../../services/ownerService';
import AppShell from '../../../shared/components/AppShell';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { toHumanDateTime } from '../../../shared/utils/date';
import { formatCurrency } from '../../../shared/utils/format';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import Badge from '../../../shared/ui/Badge';
import StatCard from '../../../shared/ui/StatCard';
import EmptyState from '../../../shared/ui/EmptyState';

const toDateInputValue = (date: Date): string => {
  return date.toISOString().slice(0, 10);
};

const toApiRange = (dateValue: string, isEnd: boolean): string => {
  if (!dateValue) {
    return '';
  }

  return `${dateValue}T${isEnd ? '23:59:59' : '00:00:00'}`;
};

const OwnerDashboardPage = () => {
  const today = useMemo(() => new Date(), []);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return toDateInputValue(d);
  });
  const [endDate, setEndDate] = useState(() => toDateInputValue(today));

  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [summaryData, pendingData] = await Promise.all([
        ownerService.getDashboardSummary(toApiRange(startDate, false), toApiRange(endDate, true)),
        bookingService.getBookingsByStatus('PENDING'),
      ]);

      setSummary(summaryData);
      setPendingBookings(pendingData);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [startDate, endDate]);

  const handleBookingAction = async (bookingId: number, status: 'CONFIRMED' | 'CANCELED') => {
    setError('');

    try {
      await bookingService.updateBookingStatus({
        id: bookingId,
        status,
        cancelReason: status === 'CANCELED' ? 'Owner từ chối xác nhận đơn.' : undefined,
      });
      await loadData();
    } catch (actionError) {
      setError(getApiErrorMessage(actionError));
    }
  };

  return (
    <AppShell>
      {/* Date filter */}
      <Card className="mb-6">
        <div className="grid gap-4 md:grid-cols-3 md:items-end">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Từ ngày</span>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm transition-all hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Đến ngày</span>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm transition-all hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>

          <Button type="button" variant="secondary" onClick={() => void loadData()} disabled={loading}>
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
            Tải lại dữ liệu
          </Button>
        </div>

        {error && (
          <div className="mt-4 animate-scale-in rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            {error}
          </div>
        )}
      </Card>

      {/* Stats Grid */}
      <div className="stagger-children mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Tổng người dùng"
          value={summary?.totalUsers ?? 0}
          accentColor="from-sky-500 to-blue-500"
        />
        <StatCard
          icon={LayoutGrid}
          label="Tổng sân"
          value={summary?.totalCourts ?? 0}
          accentColor="from-teal-500 to-emerald-500"
        />
        <StatCard
          icon={CalendarCheck}
          label="Đơn chờ xử lý"
          value={summary?.pendingBookings ?? 0}
          accentColor="from-amber-500 to-orange-500"
        />
        <StatCard
          icon={DollarSign}
          label="Doanh thu"
          value={formatCurrency(summary?.totalRevenue ?? 0)}
          accentColor="from-emerald-500 to-green-500"
        />
      </div>

      {/* Pending Bookings */}
      <Card className="relative overflow-hidden">
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-amber-400 to-orange-400" />

        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Owner Queue</p>
        <h2 className="mt-1 font-display text-xl font-bold text-slate-900">Booking đang chờ xác nhận</h2>

        <div className="mt-5 space-y-3">
          {!loading && pendingBookings.length === 0 && (
            <EmptyState
              icon={CalendarCheck}
              title="Không có booking nào đang chờ"
              description="Tất cả booking đã được xử lý."
            />
          )}

          {pendingBookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-xl border border-slate-100 bg-white p-4 transition-all duration-200 hover:border-slate-200 hover:shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">Booking #{booking.id}</p>
                <Badge variant="warning" pulse>
                  {booking.status}
                </Badge>
              </div>

              <p className="mt-2 text-sm text-slate-600">
                Khách: <span className="font-medium">{booking.user?.fullName ?? 'N/A'}</span> — Sân: <span className="font-medium">{booking.court?.name ?? 'N/A'}</span>
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {toHumanDateTime(booking.startTime)} - {toHumanDateTime(booking.endTime)}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => void handleBookingAction(booking.id, 'CONFIRMED')}>
                  Xác nhận
                </Button>
                <Button
                  variant="danger"
                  onClick={() => void handleBookingAction(booking.id, 'CANCELED')}
                >
                  Từ chối
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
};

export default OwnerDashboardPage;
