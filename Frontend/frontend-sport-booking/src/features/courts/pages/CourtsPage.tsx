import { Clock3, MapPinned, Search, Sparkles, Volleyball } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Court } from '../../../entities/court/types';
import courtService from '../../../services/courtService';
import AppShell from '../../../shared/components/AppShell';
import { ROUTES } from '../../../shared/constants/routes';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { formatCurrency } from '../../../shared/utils/format';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import Input from '../../../shared/ui/Input';
import { SkeletonCard } from '../../../shared/ui/Skeleton';
import EmptyState from '../../../shared/ui/EmptyState';

const mockPrice = (id: number) => 120000 + (id % 4) * 30000;

const CourtsPage = () => {
  const navigate = useNavigate();
  const [courts, setCourts] = useState<Court[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourts = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await courtService.getAllCourts();
        setCourts(response ?? []);
      } catch (fetchError) {
        setError(getApiErrorMessage(fetchError));
      } finally {
        setLoading(false);
      }
    };

    fetchCourts();
  }, []);

  const filteredCourts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return courts;
    }

    return courts.filter((court) => {
      return (
        court.name.toLowerCase().includes(normalizedQuery) ||
        (court.description ?? '').toLowerCase().includes(normalizedQuery)
      );
    });
  }, [courts, query]);

  return (
    <AppShell>
      {/* Hero Section */}
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 p-8 text-white shadow-xl md:p-10">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-1/4 h-32 w-32 rounded-full bg-emerald-500/15 blur-2xl" />

        <div className="relative z-10">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-200 backdrop-blur-sm">
            <Sparkles size={12} />
            Live Courts
          </div>
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Đặt sân thể thao
            <span className="block bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent">
              theo thời gian thực
            </span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
            Tìm khung giờ phù hợp, chọn sân theo bộ môn và tạo booking ngay trong một màn hình.
          </p>
        </div>
      </section>

      {/* Search */}
      <Card className="mb-6">
        <div className="grid items-end gap-4 md:grid-cols-[1fr_auto]">
          <Input
            label="Tìm sân"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nhập tên sân hoặc mô tả..."
          />
          <Button variant="secondary">
            <Search size={16} />
            Đang lọc {filteredCourts.length} sân
          </Button>
        </div>
      </Card>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} className="h-80" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <Card className="border-rose-200 bg-rose-50 text-rose-600">
          {error}
        </Card>
      )}

      {/* Courts Grid */}
      {!loading && !error && (
        <>
          {filteredCourts.length === 0 ? (
            <EmptyState
              icon={Volleyball}
              title="Không tìm thấy sân nào"
              description="Hãy thử tìm kiếm với từ khóa khác."
            />
          ) : (
            <div className="stagger-children grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourts.map((court) => {
                const price = mockPrice(court.id);

                return (
                  <Card key={court.id} className="group overflow-hidden p-0" hoverable>
                    {/* Image */}
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1280&q=80"
                        alt={court.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <span className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                        {formatCurrency(price)}/h
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-slate-900">{court.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {court.description || 'Sân đạt tiêu chuẩn thi đấu, hệ thống đèn và khu vực nghỉ chờ.'}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 font-medium text-slate-600 ring-1 ring-slate-100">
                          <Clock3 size={13} />
                          {court.openTime} - {court.closeTime}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1.5 font-medium text-teal-700 ring-1 ring-teal-100">
                          <Volleyball size={13} />
                          {court.sport?.name ?? 'Đa môn'}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 font-medium text-emerald-700 ring-1 ring-emerald-100">
                          <MapPinned size={13} />
                          Đang hoạt động
                        </span>
                      </div>

                      <Button
                        className="mt-5"
                        fullWidth
                        onClick={() => navigate(`${ROUTES.booking}/${court.id}`)}
                      >
                        Đặt sân này
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
};

export default CourtsPage;
