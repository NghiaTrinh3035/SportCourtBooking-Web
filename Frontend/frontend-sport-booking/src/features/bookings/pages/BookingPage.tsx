import {
  CalendarDays,
  Clock4,
  Info,
  StickyNote,
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Court, CourtScheduleResponse } from '../../../entities/court/types';
import type { Sport } from '../../../entities/sport/types';
import courtService from '../../../services/courtService';
import sportService from '../../../services/sportService';
import bookingService from '../../../services/bookingService';
import AppShell from '../../../shared/components/AppShell';
import { ROUTES } from '../../../shared/constants/routes';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { toApiDateTime } from '../../../shared/utils/date';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import Input from '../../../shared/ui/Input';
import { SkeletonCard } from '../../../shared/ui/Skeleton';

interface TimelineSlot {
  timeLabel: string;
  start: string;
  end: string;
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
  occupiedInfo?: string;
}

const formatTimeOnly = (timeStr?: string): string => {
  if (!timeStr) return '';
  if (timeStr.includes('T')) {
    return timeStr.split('T')[1].substring(0, 5);
  }
  return timeStr.substring(0, 5);
};

const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const paramCourtId = id ? Number(id) : null;

  const [sports, setSports] = useState<Sport[]>([]);
  const [allCourts, setAllCourts] = useState<Court[]>([]);
  const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null);

  const [schedule, setSchedule] = useState<CourtScheduleResponse | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [bookingDate, setBookingDate] = useState(getTodayString());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [note, setNote] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Tải danh sách bộ môn và sân khi khởi tạo trang
  useEffect(() => {
    let isMounted = true;
    setInitialLoading(true);

    Promise.all([
      sportService.getAllSports().catch(() => [] as Sport[]),
      courtService.getAllCourts().catch(() => [] as Court[]),
    ])
      .then(([sportsData, courtsData]) => {
        if (!isMounted) return;
        setSports(sportsData);
        setAllCourts(courtsData);

        // Xác định sport và court mặc định
        const activeCourts = courtsData.filter((c) => c.active);
        let targetCourt: Court | undefined;

        if (paramCourtId && Number.isFinite(paramCourtId)) {
          targetCourt = activeCourts.find((c) => c.id === paramCourtId);
        }

        if (targetCourt) {
          setSelectedCourtId(targetCourt.id);
          if (targetCourt.sport) {
            setSelectedSportId(targetCourt.sport.id);
          } else if (sportsData.length > 0) {
            setSelectedSportId(sportsData[0].id);
          }
        } else {
          // Nếu không có id trên url hoặc sân không khớp, chọn môn đầu tiên và sân đầu tiên của môn đó
          const firstSport = sportsData[0];
          if (firstSport) {
            setSelectedSportId(firstSport.id);
            const courtsOfSport = activeCourts.filter((c) => c.sport?.id === firstSport.id);
            if (courtsOfSport.length > 0) {
              setSelectedCourtId(courtsOfSport[0].id);
            } else if (activeCourts.length > 0) {
              setSelectedCourtId(activeCourts[0].id);
            }
          } else if (activeCourts.length > 0) {
            setSelectedCourtId(activeCourts[0].id);
          }
        }
      })
      .finally(() => {
        if (isMounted) setInitialLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [paramCourtId]);

  // Lọc sân theo môn thể thao đang chọn
  const filteredCourts = useMemo(() => {
    return allCourts.filter((c) => c.active && (!selectedSportId || c.sport?.id === selectedSportId));
  }, [allCourts, selectedSportId]);

  const selectedCourt = useMemo(() => {
    return allCourts.find((c) => c.id === selectedCourtId) || null;
  }, [allCourts, selectedCourtId]);

  // Khi chọn môn khác, tự động chọn sân đầu tiên thuộc môn đó
  const handleSelectSport = (sportId: number) => {
    setSelectedSportId(sportId);
    const courtsOfSport = allCourts.filter((c) => c.active && c.sport?.id === sportId);
    if (courtsOfSport.length > 0) {
      handleSelectCourt(courtsOfSport[0].id);
    } else {
      setSelectedCourtId(null);
    }
  };

  const handleSelectCourt = (courtId: number) => {
    setSelectedCourtId(courtId);
    setError('');
    setSuccess('');
    navigate(`${ROUTES.booking}/${courtId}`, { replace: true });
  };

  // 2. Tải Roadmap lịch sân khi thay đổi sân hoặc ngày
  useEffect(() => {
    if (!selectedCourtId || !bookingDate) {
      setSchedule(null);
      return;
    }

    let isMounted = true;
    setScheduleLoading(true);
    courtService
      .getCourtSchedule(selectedCourtId, bookingDate)
      .then((data) => {
        if (isMounted) setSchedule(data);
      })
      .catch(() => {
        if (isMounted) setSchedule(null);
      })
      .finally(() => {
        if (isMounted) setScheduleLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCourtId, bookingDate]);

  // 3. Tính toán các mốc thời gian (Roadmap Timeline)
  const timelineSlots: TimelineSlot[] = useMemo(() => {
    if (!selectedCourt) return [];

    const openTimeStr = formatTimeOnly(selectedCourt.openTime) || '06:00';
    const closeTimeStr = formatTimeOnly(selectedCourt.closeTime) || '22:00';

    const startHour = parseInt(openTimeStr.split(':')[0], 10);
    const endHour = parseInt(closeTimeStr.split(':')[0], 10);

    const slots: TimelineSlot[] = [];
    const occupied = schedule?.occupiedSlots || [];

    for (let h = startHour; h < endHour; h++) {
      const slotStart = `${h.toString().padStart(2, '0')}:00`;
      const slotEnd = `${(h + 1).toString().padStart(2, '0')}:00`;
      const timeLabel = `${slotStart} - ${slotEnd}`;

      // Kiểm tra overlap
      let status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED' = 'AVAILABLE';
      let occupiedInfo = '';

      for (const occ of occupied) {
        const occStart = formatTimeOnly(occ.startTime);
        const occEnd = formatTimeOnly(occ.endTime);

        // Overlap condition: s1 < e2 && e1 > s2
        if (slotStart < occEnd && slotEnd > occStart) {
          status = occ.type === 'BLOCKED' ? 'BLOCKED' : 'BOOKED';
          occupiedInfo = `${occ.type === 'BLOCKED' ? 'Bảo trì' : 'Đã thuê'}: ${occStart} - ${occEnd}`;
          break;
        }
      }

      slots.push({
        timeLabel,
        start: slotStart,
        end: slotEnd,
        status,
        occupiedInfo,
      });
    }

    return slots;
  }, [selectedCourt, schedule]);

  const handleSelectSlot = (slot: TimelineSlot) => {
    if (slot.status !== 'AVAILABLE') return;
    setStartTime(slot.start);
    setEndTime(slot.end);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedCourtId) {
      setError('Vui lòng chọn sân trước khi đặt.');
      return;
    }

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
        courtId: selectedCourtId,
        startTime: toApiDateTime(bookingDate, startTime),
        endTime: toApiDateTime(bookingDate, endTime),
        note,
      });

      setSuccess(`🎉 Tạo đơn đặt sân #${created.id} thành công! Vui lòng chờ chủ sân xác nhận.`);
      setStartTime('');
      setEndTime('');
      setNote('');

      // Tải lại lịch sân ngay để cập nhật Roadmap
      if (selectedCourtId && bookingDate) {
        courtService.getCourtSchedule(selectedCourtId, bookingDate).then(setSchedule).catch(() => {});
      }
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* TOP BANNER & SPORT SELECTOR */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-xl">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="absolute right-20 bottom-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
              <Sparkles size={16} />
              <span>Hệ thống đặt sân trực tuyến</span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Chọn Bộ Môn & Sân Thể Thao
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Bước 1: Chọn môn thể thao yêu thích của bạn để xem danh sách sân đang mở cho thuê.
            </p>

            {/* Sport Tabs */}
            {initialLoading ? (
              <div className="mt-5 flex gap-3 animate-pulse">
                <div className="h-10 w-28 rounded-xl bg-slate-700" />
                <div className="h-10 w-28 rounded-xl bg-slate-700" />
              </div>
            ) : (
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                {sports.map((sport) => {
                  const isSelected = sport.id === selectedSportId;
                  return (
                    <button
                      key={sport.id}
                      type="button"
                      onClick={() => handleSelectSport(sport.id)}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                        isSelected
                          ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/25 scale-105'
                          : 'bg-white/10 text-slate-200 hover:bg-white/20'
                      }`}
                    >
                      <Trophy size={16} className={isSelected ? 'text-slate-950' : 'text-teal-400'} />
                      <span>{sport.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Court Selector */}
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Bước 2: Chọn sân ({filteredCourts.length} sân đang hoạt động)
              </p>
              
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filteredCourts.map((c) => {
                  const isSelected = c.id === selectedCourtId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCourt(c.id)}
                      className={`flex flex-col rounded-xl border p-3.5 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-teal-400 bg-teal-500/20 shadow-md ring-2 ring-teal-400/50'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <span className="font-semibold text-white line-clamp-1">{c.name}</span>
                      <span className="mt-1 flex items-center gap-1 text-[11px] text-slate-300">
                        <Clock4 size={12} className="text-teal-400" />
                        {formatTimeOnly(c.openTime)} - {formatTimeOnly(c.closeTime)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {filteredCourts.length === 0 && !initialLoading && (
                <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-slate-400">
                  Chưa có sân nào thuộc bộ môn này đang hoạt động.
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 2-COLUMN LAYOUT: ROADMAP (LEFT) & FORM (RIGHT) */}
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* LEFT COLUMN: COURT SUMMARY & ROADMAP */}
          <Card className="relative overflow-hidden">
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-teal-500 to-emerald-500" />

            {!selectedCourt ? (
              initialLoading ? (
                <SkeletonCard />
              ) : (
                <div className="py-12 text-center text-slate-400">
                  Vui lòng chọn một sân ở phía trên để xem lịch đặt và bảng giờ.
                </div>
              )
            ) : (
              <div className="space-y-6">
                {/* Header Sân */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-100">
                      <MapPin size={13} />
                      {selectedCourt.sport?.name || 'Sân thể thao'}
                    </span>
                    <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
                      {selectedCourt.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedCourt.description || 'Sân thể thao đạt chuẩn, không gian thoáng mát, hệ thống đèn LED hiện đại.'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3.5 py-2 text-right ring-1 ring-slate-100">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Giờ mở cửa</p>
                    <p className="mt-0.5 font-bold text-slate-800">
                      {formatTimeOnly(selectedCourt.openTime)} - {formatTimeOnly(selectedCourt.closeTime)}
                    </p>
                  </div>
                </div>

                {/* ROADMAP LỊCH SÂN */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-900">
                        Roadmap Khung Giờ Ngày {bookingDate.split('-').reverse().join('/')}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Bấm vào khung giờ <strong className="text-emerald-600">Trống (Màu xanh)</strong> để tự động chọn giờ đặt.
                      </p>
                    </div>

                    {/* Bộ chú thích màu */}
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        Trống
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-rose-700">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                        Đã đặt
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-amber-700">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        Bảo trì
                      </span>
                    </div>
                  </div>

                  {/* Danh sách các block thời gian */}
                  {scheduleLoading ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 animate-pulse">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-16 rounded-xl bg-slate-100" />
                      ))}
                    </div>
                  ) : timelineSlots.length === 0 ? (
                    <div className="mt-4 rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
                      Không có thông tin lịch khung giờ cho sân này.
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {timelineSlots.map((slot, idx) => {
                        const isAvailable = slot.status === 'AVAILABLE';
                        const isBooked = slot.status === 'BOOKED';
                        const isBlocked = slot.status === 'BLOCKED';

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => handleSelectSlot(slot)}
                            className={`group relative flex flex-col justify-between rounded-xl border p-3 text-left transition-all duration-200 ${
                              isAvailable
                                ? 'border-emerald-200 bg-emerald-50/60 text-emerald-950 hover:border-emerald-400 hover:bg-emerald-100/80 hover:shadow-sm cursor-pointer'
                                : isBooked
                                ? 'border-rose-200 bg-rose-50/80 text-rose-900 cursor-not-allowed opacity-85'
                                : 'border-amber-200 bg-amber-50/80 text-amber-900 cursor-not-allowed opacity-85'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-bold text-sm tracking-tight">{slot.timeLabel}</span>
                              {isAvailable && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
                              {isBooked && <XCircle size={16} className="text-rose-500 shrink-0" />}
                              {isBlocked && <AlertTriangle size={16} className="text-amber-500 shrink-0" />}
                            </div>

                            <div className="mt-1.5 text-[11px] font-medium">
                              {isAvailable && (
                                <span className="text-emerald-700 group-hover:underline">Nhấn để chọn</span>
                              )}
                              {isBooked && (
                                <span className="text-rose-700 block truncate" title={slot.occupiedInfo}>
                                  {slot.occupiedInfo || 'Đã có khách đặt'}
                                </span>
                              )}
                              {isBlocked && (
                                <span className="text-amber-700 block truncate" title={slot.occupiedInfo}>
                                  {slot.occupiedInfo || 'Sân đang bảo trì'}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* RIGHT COLUMN: BOOKING FORM */}
          <Card className="relative h-fit overflow-hidden">
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />

            <div className="flex items-center gap-2">
              <Calendar className="text-indigo-600" size={22} />
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">Xác nhận lịch đặt</h3>
                <p className="text-xs text-slate-500">Điền thông tin và thời gian muốn thuê sân.</p>
              </div>
            </div>

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
              <div>
                <Input
                  label="Ngày đặt sân"
                  type="date"
                  value={bookingDate}
                  onChange={(event) => setBookingDate(event.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Giờ bắt đầu"
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  required
                />
                <Input
                  label="Giờ kết thúc"
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  required
                />
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Ghi chú cho chủ sân</span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white/90 px-3.5 py-2.5 text-sm text-slate-800 shadow-sm transition-all duration-200 placeholder:text-slate-300 hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none"
                  placeholder="Ví dụ: Cần bật đèn sân trước 10 phút, chuẩn bị thêm nước uống..."
                />
              </label>

              <div className="flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-xs text-sky-800">
                <Info size={16} className="shrink-0 text-sky-600" />
                <span>Lịch đặt của bạn sẽ ở trạng thái <strong>CHỜ XÁC NHẬN</strong> cho đến khi chủ sân duyệt đơn.</span>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <Button
                  type="submit"
                  disabled={loading || !selectedCourtId}
                  loading={loading}
                  className="w-full py-3 shadow-md"
                >
                  <CalendarDays size={18} />
                  {loading ? 'Đang gửi yêu cầu đặt...' : 'Xác nhận đặt sân ngay'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.home)} className="w-full">
                  <StickyNote size={16} />
                  Quay lại trang chủ
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </AppShell>
  );
};

export default BookingPage;
