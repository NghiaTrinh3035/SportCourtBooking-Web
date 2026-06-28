import { CheckCircle2, CreditCard, Banknote, PartyPopper } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { Booking } from '../../../entities/booking/types';
import type { PaymentMethod } from '../../../entities/payment/types';
import bookingService from '../../../services/bookingService';
import paymentService from '../../../services/paymentService';
import AppShell from '../../../shared/components/AppShell';
import { ROUTES } from '../../../shared/constants/routes';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { formatCurrency } from '../../../shared/utils/format';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import { SkeletonCard } from '../../../shared/ui/Skeleton';

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const bookingId = Number(id);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('payment_status') === 'success') {
      setSuccess(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!Number.isFinite(bookingId)) {
      navigate(ROUTES.home);
      return;
    }

    bookingService
      .getBookingById(bookingId)
      .then((data) => {
        setBooking(data);
        if (data.status !== 'CONFIRMED') {
          setError(`Đơn này đang ở trạng thái ${data.status}. Chỉ có thể thanh toán khi đơn ở trạng thái CONFIRMED.`);
        }
      })
      .catch((fetchError) => {
        setError(getApiErrorMessage(fetchError));
      })
      .finally(() => setLoading(false));
  }, [bookingId, navigate]);

  const handlePayment = async () => {
    if (!booking || !booking.totalPrice) return;
    
    setPaying(true);
    setError('');

    const depositAmount = Math.round(booking.totalPrice * 0.3);

    try {
      if (method === 'VNPAY') {
        const response = await paymentService.createVnPayPayment({
          bookingId: booking.id,
          amount: depositAmount,
          paymentMethod: method,
          transactionRef: `TXN${Date.now()}`,
          bookingInfo: `Thanh toan don dat san ${booking.id}`,
        });

        if (response.paymentUrl) {
          window.location.href = response.paymentUrl;
          return; // Do not clear loading state since page will redirect
        } else {
          setError('Không thể lấy được đường dẫn thanh toán VNPAY');
        }
      } else {
        await paymentService.processPayment({
          bookingId: booking.id,
          amount: depositAmount,
          paymentMethod: method,
          transactionRef: method === 'BANK_TRANSFER' ? `TXN${Date.now()}` : undefined,
          bookingInfo: `Thanh toan don dat san ${booking.id}`,
        });

        setSuccess(true);
      }
    } catch (paymentError) {
      setError(getApiErrorMessage(paymentError));
    } finally {
      if (method !== 'VNPAY' || error) {
        setPaying(false);
      }
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl">
          <SkeletonCard className="h-96" />
        </div>
      </AppShell>
    );
  }

  if (success) {
    return (
      <AppShell>
        <Card className="animate-scale-in mx-auto flex max-w-lg flex-col items-center justify-center py-14 text-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-xl shadow-emerald-500/30">
              <CheckCircle2 size={36} />
            </div>
            <div className="absolute -right-2 -top-2 text-amber-400">
              <PartyPopper size={24} />
            </div>
          </div>
          <h2 className="mt-6 font-display text-2xl font-bold text-slate-900">Thanh toán cọc thành công!</h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
            Đơn đặt sân #{booking?.id} của bạn đã được thanh toán cọc và chuyển sang trạng thái <strong className="text-teal-700">DEPOSITED</strong>.
          </p>
          <Button className="mt-8" onClick={() => navigate(ROUTES.profile)}>
            Về lịch sử đặt sân
          </Button>
        </Card>
      </AppShell>
    );
  }

  const totalPrice = booking?.totalPrice ?? 0;
  const depositAmount = Math.round(totalPrice * 0.3);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <Card className="relative overflow-hidden">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />

          <div className="mb-6">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25">
              <CreditCard size={20} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">Payment</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">Thanh toán tiền cọc</h2>
            <p className="mt-1 text-sm text-slate-500">
              Vui lòng thanh toán 30% giá trị đơn đặt sân để giữ chỗ.
            </p>
          </div>

          {error && (
            <div className="mb-5 animate-scale-in rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </div>
          )}

          {booking && booking.status === 'CONFIRMED' && (
            <div className="space-y-6">
              {/* Price breakdown */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                <div className="flex justify-between border-b border-slate-100 px-5 py-3.5">
                  <span className="text-sm font-medium text-slate-500">Mã đơn</span>
                  <span className="text-sm font-bold text-slate-800">#{booking.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 px-5 py-3.5">
                  <span className="text-sm font-medium text-slate-500">Tổng tiền đơn</span>
                  <span className="text-sm font-bold text-slate-800">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between bg-gradient-to-r from-rose-50 to-orange-50 px-5 py-4">
                  <span className="text-sm font-bold text-rose-600">Số tiền cọc (30%)</span>
                  <span className="text-xl font-bold text-rose-600">{formatCurrency(depositAmount)}</span>
                </div>
              </div>

              {/* Payment method */}
              <div>
                <p className="mb-3 text-sm font-bold text-slate-700">Chọn phương thức thanh toán</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod('CASH')}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 ${
                      method === 'CASH'
                        ? 'border-teal-500 bg-teal-50 shadow-md shadow-teal-500/10'
                        : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                      method === 'CASH'
                        ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Banknote size={20} />
                    </div>
                    <span className={`text-sm font-bold ${method === 'CASH' ? 'text-teal-800' : 'text-slate-600'}`}>
                      Tiền mặt
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('VNPAY')}
                    className={`col-span-2 flex items-center justify-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 ${
                      method === 'VNPAY'
                        ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                      method === 'VNPAY'
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      <CreditCard size={20} />
                    </div>
                    <span className={`text-sm font-bold ${method === 'VNPAY' ? 'text-blue-800' : 'text-slate-600'}`}>
                      Thanh toán qua VNPAY
                    </span>
                  </button>
                </div>
              </div>

              <Button
                className="w-full justify-center py-3.5 text-base"
                onClick={handlePayment}
                disabled={paying}
                loading={paying}
              >
                <CreditCard size={18} />
                {paying ? 'Đang xử lý...' : `Xác nhận thanh toán ${formatCurrency(depositAmount)}`}
              </Button>
            </div>
          )}

          {(!booking || booking.status !== 'CONFIRMED') && (
             <Button className="mt-6" variant="secondary" onClick={() => navigate(ROUTES.profile)}>
               Quay lại
             </Button>
          )}
        </Card>
      </div>
    </AppShell>
  );
};

export default PaymentPage;
