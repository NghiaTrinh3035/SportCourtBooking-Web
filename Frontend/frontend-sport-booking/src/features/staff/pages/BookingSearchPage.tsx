import { Search } from 'lucide-react';
import { useState } from 'react';
import type { BookingSearchResponse } from '../../../entities/booking/types';
import bookingService from '../../../services/bookingService';
import AppShell from '../../../shared/components/AppShell';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { toHumanDateTime } from '../../../shared/utils/date';
import { formatCurrency } from '../../../shared/utils/format';
import Badge from '../../../shared/ui/Badge';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import Input from '../../../shared/ui/Input';
import EmptyState from '../../../shared/ui/EmptyState';

const statusBadge: Record<string, { variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'brand'; pulse?: boolean }> = {
  PENDING: { variant: 'warning', pulse: true },
  CONFIRMED: { variant: 'info' },
  DEPOSITED: { variant: 'brand' },
  COMPLETED: { variant: 'success' },
  CANCELED: { variant: 'error' },
};

const BookingSearchPage = () => {
  const [phone, setPhone] = useState('');
  const [results, setResults] = useState<BookingSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại để tra cứu');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    setHasSearched(true);

    try {
      const data = await bookingService.searchBookingsByPhone(phone.trim());
      setResults(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: number, status: 'CONFIRMED' | 'DEPOSITED' | 'COMPLETED' | 'CANCELED') => {
    setError('');
    setMessage('');

    try {
      await bookingService.updateBookingStatus({
        id: bookingId,
        status,
        cancelReason: status === 'CANCELED' ? 'STAFF cập nhật hủy đơn.' : undefined,
      });
      setMessage(`Đã cập nhật trạng thái đơn #${bookingId} thành ${status}`);
      await handleSearch(); // Refresh results
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Tra cứu đơn đặt sân</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tìm kiếm các đơn đặt sân dựa theo số điện thoại của khách hàng
          </p>
        </div>

        {error && (
          <div className="animate-scale-in rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            {error}
          </div>
        )}
        {message && (
          <div className="animate-scale-in rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </div>
        )}

        {/* Search Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
          <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                label="Số điện thoại khách hàng"
                placeholder="Nhập SĐT..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              <Search size={18} className="mr-2" />
              {loading ? 'Đang tìm...' : 'Tra cứu'}
            </Button>
          </form>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {hasSearched && !loading && results.length === 0 && (
            <EmptyState
              icon={Search}
              title="Không tìm thấy đơn nào"
              description={`Không có lịch sử đặt sân nào cho số điện thoại ${phone}`}
            />
          )}

          {results.map((booking) => {
            const badgeConfig = statusBadge[booking.status] ?? { variant: 'neutral' as const };
            
            return (
              <Card key={booking.bookingId} className="animate-fade-in hover:border-slate-300 transition-colors">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-slate-800">Đơn #{booking.bookingId}</span>
                      <Badge variant={badgeConfig.variant} pulse={badgeConfig.pulse}>
                        {booking.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="font-medium text-slate-900 w-20">Tên khách:</span>
                        <span>{booking.customerName || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="font-medium text-slate-900 w-20">SĐT:</span>
                        <span>{booking.customerPhone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="font-medium text-slate-900 w-20">Sân:</span>
                        <span className="font-semibold text-teal-700">{booking.courtName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="font-medium text-slate-900 w-20">Tổng tiền:</span>
                        <span className="font-bold text-rose-600">{formatCurrency(booking.totalPrice)}</span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 border border-slate-100">
                      📅 {toHumanDateTime(booking.startTime)} ➝ {toHumanDateTime(booking.endTime)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    {booking.status === 'PENDING' && (
                      <Button type="button" onClick={() => void handleStatusChange(booking.bookingId, 'CONFIRMED')}>
                        Xác nhận
                      </Button>
                    )}

                    {booking.status === 'CONFIRMED' && (
                      <Button type="button" onClick={() => void handleStatusChange(booking.bookingId, 'DEPOSITED')}>
                        Đã cọc
                      </Button>
                    )}

                    {(booking.status === 'CONFIRMED' || booking.status === 'DEPOSITED') && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => void handleStatusChange(booking.bookingId, 'COMPLETED')}
                      >
                        Hoàn tất
                      </Button>
                    )}

                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED' || booking.status === 'DEPOSITED') && (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => void handleStatusChange(booking.bookingId, 'CANCELED')}
                      >
                        Hủy đơn
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};

export default BookingSearchPage;
