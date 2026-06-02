import { useEffect, useMemo, useState } from 'react';
import type {
  Court,
  CourtBlock,
  CourtPriceRule,
  CourtRequest,
} from '../../../entities/court/types';
import type { SportRequest } from '../../../entities/sport/types';
import type { Sport } from '../../../entities/sport/types';
import courtService from '../../../services/courtService';
import ownerService from '../../../services/ownerService';
import AppShell from '../../../shared/components/AppShell';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { toHumanDateTime } from '../../../shared/utils/date';
import { formatCurrency } from '../../../shared/utils/format';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import Input from '../../../shared/ui/Input';
import Badge from '../../../shared/ui/Badge';

const normalizeTimeInput = (value?: string | null): string => {
  if (!value) return '';
  return value.length >= 5 ? value.slice(0, 5) : value;
};

const toApiLocalTime = (value: string): string => {
  if (!value) return '';
  return value.length === 5 ? `${value}:00` : value;
};

const toApiLocalDateTime = (value: string): string => {
  if (!value) return '';
  return value.length === 16 ? `${value}:00` : value;
};

const emptySportForm: SportRequest = { name: '', iconUrl: '' };
const emptyCourtForm: CourtRequest = { name: '', sportId: 0, description: '', openTime: '', closeTime: '', active: true };
const COURTS_PAGE_SIZE = 5;

const sectionCard = 'relative overflow-hidden';
const accentBar = (color: string) => `absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${color}`;
const itemCard = 'rounded-xl border border-slate-100 bg-white px-4 py-3.5 transition-all duration-200 hover:border-slate-200 hover:shadow-sm';

const OwnerCourtOpsPage = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null);
  const [priceRules, setPriceRules] = useState<CourtPriceRule[]>([]);
  const [blocks, setBlocks] = useState<CourtBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [sportForm, setSportForm] = useState<SportRequest>(emptySportForm);
  const [editingSportId, setEditingSportId] = useState<number | null>(null);
  const [courtForm, setCourtForm] = useState<CourtRequest>(emptyCourtForm);
  const [editingCourtId, setEditingCourtId] = useState<number | null>(null);

  const [priceStartTime, setPriceStartTime] = useState('');
  const [priceEndTime, setPriceEndTime] = useState('');
  const [priceValue, setPriceValue] = useState('');
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);

  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState('');

  const [courtSearch, setCourtSearch] = useState('');
  const [courtSportFilter, setCourtSportFilter] = useState<number | 'ALL'>('ALL');
  const [courtStatusFilter, setCourtStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [courtPage, setCourtPage] = useState(1);

  const selectedCourt = useMemo(() => courts.find((c) => c.id === selectedCourtId) ?? null, [courts, selectedCourtId]);

  const filteredCourts = useMemo(() => {
    const keyword = courtSearch.trim().toLowerCase();
    return courts.filter((court) => {
      const matchKeyword = !keyword || court.name.toLowerCase().includes(keyword) || (court.description ?? '').toLowerCase().includes(keyword);
      const matchSport = courtSportFilter === 'ALL' || court.sport?.id === courtSportFilter;
      const matchStatus = courtStatusFilter === 'ALL' || (courtStatusFilter === 'ACTIVE' ? court.active : !court.active);
      return matchKeyword && matchSport && matchStatus;
    });
  }, [courts, courtSearch, courtSportFilter, courtStatusFilter]);

  const totalCourtPages = Math.max(1, Math.ceil(filteredCourts.length / COURTS_PAGE_SIZE));
  const paginatedCourts = useMemo(() => {
    const start = (courtPage - 1) * COURTS_PAGE_SIZE;
    return filteredCourts.slice(start, start + COURTS_PAGE_SIZE);
  }, [filteredCourts, courtPage]);

  const loadSportsAndCourts = async () => {
    const [sportsData, courtsData] = await Promise.all([ownerService.getSports(), courtService.getAllCourts()]);
    setSports(sportsData);
    setCourts(courtsData);
    setSelectedCourtId((prev) => {
      if (prev && courtsData.some((c) => c.id === prev)) return prev;
      return courtsData.length > 0 ? courtsData[0].id : null;
    });
  };

  const loadCourtSchedules = async (courtId: number) => {
    const [pricesData, blocksData] = await Promise.all([courtService.getCourtPrices(courtId), courtService.getCourtBlocks(courtId)]);
    setPriceRules(pricesData);
    setBlocks(blocksData);
  };

  const refreshAll = async () => {
    setLoading(true);
    setError('');
    try { await loadSportsAndCourts(); } catch (e) { setError(getApiErrorMessage(e)); } finally { setLoading(false); }
  };

  useEffect(() => { void refreshAll(); }, []);
  useEffect(() => {
    if (!selectedCourtId) { setPriceRules([]); setBlocks([]); return; }
    courtService.getCourtPrices(selectedCourtId).then(setPriceRules).catch(() => setPriceRules([]));
    courtService.getCourtBlocks(selectedCourtId).then(setBlocks).catch(() => setBlocks([]));
  }, [selectedCourtId]);
  useEffect(() => { setCourtPage(1); }, [courtSearch, courtSportFilter, courtStatusFilter]);
  useEffect(() => { if (courtPage > totalCourtPages) setCourtPage(totalCourtPages); }, [courtPage, totalCourtPages]);

  const clearMessages = () => { setError(''); setMessage(''); };

  const handleSportSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); clearMessages();
    try {
      if (editingSportId) { await ownerService.updateSport(editingSportId, sportForm); setMessage('Cập nhật môn thể thao thành công.'); }
      else { await ownerService.createSport(sportForm); setMessage('Tạo môn thể thao thành công.'); }
      setSportForm(emptySportForm); setEditingSportId(null); await refreshAll();
    } catch (e) { setError(getApiErrorMessage(e)); }
  };

  const handleDeleteSport = async (sportId: number) => {
    clearMessages();
    try { await ownerService.deleteSport(sportId); setMessage('Đã xóa môn thể thao.'); await refreshAll(); } catch (e) { setError(getApiErrorMessage(e)); }
  };

  const handleCourtSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); clearMessages();
    try {
      const payload: CourtRequest = { ...courtForm, openTime: toApiLocalTime(courtForm.openTime), closeTime: toApiLocalTime(courtForm.closeTime) };
      if (editingCourtId) { await courtService.updateCourt(editingCourtId, payload); setMessage('Cập nhật sân thành công.'); }
      else { await courtService.createCourt(payload); setMessage('Tạo sân thành công.'); }
      setCourtForm(emptyCourtForm); setEditingCourtId(null); await refreshAll();
    } catch (e) { setError(getApiErrorMessage(e)); }
  };

  const handleDeleteCourt = async (courtId: number) => {
    clearMessages();
    try { await courtService.deleteCourt(courtId); setMessage('Đã xóa sân.'); await refreshAll(); } catch (e) { setError(getApiErrorMessage(e)); }
  };

  const handlePriceSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCourtId) { setError('Vui lòng chọn sân để cài đặt khung giá.'); return; }
    clearMessages();
    try {
      const payload = { courtId: selectedCourtId, startTime: toApiLocalTime(priceStartTime), endTime: toApiLocalTime(priceEndTime), price: Number(priceValue) };
      if (editingRuleId) { await courtService.updateCourtPriceRule(editingRuleId, payload); setMessage('Cập nhật khung giá thành công.'); }
      else { await courtService.createCourtPriceRule(payload); setMessage('Thêm khung giá thành công.'); }
      setPriceStartTime(''); setPriceEndTime(''); setPriceValue(''); setEditingRuleId(null);
      await loadCourtSchedules(selectedCourtId);
    } catch (e) { setError(getApiErrorMessage(e)); }
  };

  const handleDeletePriceRule = async (ruleId: number) => {
    if (!selectedCourtId) return; clearMessages();
    try { await courtService.deleteCourtPriceRule(ruleId); setMessage('Đã xóa khung giá.'); await loadCourtSchedules(selectedCourtId); } catch (e) { setError(getApiErrorMessage(e)); }
  };

  const handleCreateBlock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCourtId) { setError('Vui lòng chọn sân để chặn khung giờ.'); return; }
    clearMessages();
    try {
      await courtService.createCourtBlock({ courtId: selectedCourtId, startTime: toApiLocalDateTime(blockStart), endTime: toApiLocalDateTime(blockEnd), reason: blockReason });
      setBlockStart(''); setBlockEnd(''); setBlockReason(''); setMessage('Đã thêm block cho sân.');
      await loadCourtSchedules(selectedCourtId);
    } catch (e) { setError(getApiErrorMessage(e)); }
  };

  const handleDeleteBlock = async (blockId: number) => {
    if (!selectedCourtId) return; clearMessages();
    try { await courtService.deleteCourtBlock(blockId); setMessage('Đã xóa block.'); await loadCourtSchedules(selectedCourtId); } catch (e) { setError(getApiErrorMessage(e)); }
  };

  const selectCls = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm transition-all hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none";

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1680px]">
        {/* Messages */}
        {loading && <Card className="mb-6">Đang tải dữ liệu quản lý môn và sân...</Card>}
        {error && <div className="mb-6 animate-scale-in rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{error}</div>}
        {message && <div className="mb-6 animate-scale-in rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</div>}

        {/* Sports + Courts Row */}
        <div className="mb-6 grid items-start gap-6 2xl:grid-cols-[minmax(460px,0.95fr)_minmax(760px,1.35fr)]">
          {/* Sports Section */}
          <Card className={sectionCard}>
            <div className={accentBar('from-amber-400 to-orange-400')} />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Sports</p>
            <h2 className="mt-1 font-display text-xl font-bold text-slate-900">Tạo và điều chỉnh môn thể thao</h2>

            <form className="mt-4 space-y-3" onSubmit={handleSportSubmit}>
              <Input label="Tên môn" value={sportForm.name} onChange={(e) => setSportForm((p) => ({ ...p, name: e.target.value }))} required />
              <Input label="Icon URL" value={sportForm.iconUrl ?? ''} onChange={(e) => setSportForm((p) => ({ ...p, iconUrl: e.target.value }))} placeholder="https://..." />
              <div className="flex flex-wrap gap-2">
                <Button type="submit">{editingSportId ? 'Cập nhật môn' : 'Tạo môn mới'}</Button>
                {editingSportId && <Button type="button" variant="secondary" onClick={() => { setEditingSportId(null); setSportForm(emptySportForm); }}>Hủy sửa</Button>}
              </div>
            </form>

            <div className="mt-5 space-y-2">
              {sports.map((sport) => (
                <div key={sport.id} className={`grid gap-3 md:grid-cols-[1fr_auto] md:items-center ${itemCard}`}>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{sport.name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{sport.totalCourts ?? 0} sân</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" type="button" onClick={() => { setEditingSportId(sport.id); setSportForm({ name: sport.name, iconUrl: sport.iconUrl ?? '' }); }}>Sửa</Button>
                    <Button type="button" variant="danger" onClick={() => void handleDeleteSport(sport.id)}>Xóa</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Courts Section */}
          <Card className={sectionCard}>
            <div className={accentBar('from-teal-500 to-emerald-500')} />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">Courts</p>
            <h2 className="mt-1 font-display text-xl font-bold text-slate-900">Tạo sân và điều chỉnh thông tin sân</h2>

            <form className="mt-4 space-y-3" onSubmit={handleCourtSubmit}>
              <Input label="Tên sân" value={courtForm.name} onChange={(e) => setCourtForm((p) => ({ ...p, name: e.target.value }))} required />
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Môn thể thao</span>
                <select className={selectCls} value={courtForm.sportId || ''} onChange={(e) => setCourtForm((p) => ({ ...p, sportId: Number(e.target.value) }))} required>
                  <option value="">Chọn môn</option>
                  {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
              <Input label="Mô tả" value={courtForm.description ?? ''} onChange={(e) => setCourtForm((p) => ({ ...p, description: e.target.value }))} />
              <div className="grid gap-3 md:grid-cols-2">
                <Input label="Giờ mở cửa" type="time" value={courtForm.openTime} onChange={(e) => setCourtForm((p) => ({ ...p, openTime: e.target.value }))} required />
                <Input label="Giờ đóng cửa" type="time" value={courtForm.closeTime} onChange={(e) => setCourtForm((p) => ({ ...p, closeTime: e.target.value }))} required />
              </div>
              <label className="flex items-center gap-2.5 text-sm text-slate-700">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" checked={Boolean(courtForm.active)} onChange={(e) => setCourtForm((p) => ({ ...p, active: e.target.checked }))} />
                Sân đang hoạt động
              </label>
              <div className="flex flex-wrap gap-2">
                <Button type="submit">{editingCourtId ? 'Cập nhật sân' : 'Tạo sân mới'}</Button>
                {editingCourtId && <Button type="button" variant="secondary" onClick={() => { setEditingCourtId(null); setCourtForm(emptyCourtForm); }}>Hủy sửa</Button>}
              </div>
            </form>

            {/* Court filters */}
            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Lọc danh sách sân</p>
              <div className="mt-3 grid gap-3 lg:grid-cols-3">
                <Input label="Tìm theo tên/mô tả" value={courtSearch} onChange={(e) => setCourtSearch(e.target.value)} placeholder="Ví dụ: sân 01" />
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Môn thể thao</span>
                  <select className={selectCls} value={courtSportFilter} onChange={(e) => { const v = e.target.value; setCourtSportFilter(v === 'ALL' ? 'ALL' : Number(v)); }}>
                    <option value="ALL">Tất cả môn</option>
                    {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Trạng thái</span>
                  <select className={selectCls} value={courtStatusFilter} onChange={(e) => setCourtStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}>
                    <option value="ALL">Tất cả</option>
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="INACTIVE">Đang tạm khóa</option>
                  </select>
                </label>
              </div>
              <div className="mt-3 text-sm text-slate-500">Hiển thị {paginatedCourts.length} / {filteredCourts.length} sân</div>
            </div>

            {/* Court list */}
            <div className="mt-4 space-y-2">
              {paginatedCourts.length === 0 && <div className={`${itemCard} text-sm text-slate-400`}>Không có sân nào phù hợp.</div>}
              {paginatedCourts.map((court) => (
                <div key={court.id} className={`grid gap-3 md:grid-cols-[1fr_auto] md:items-center ${itemCard}`}>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{court.name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{court.sport?.name ?? 'N/A'} — {normalizeTimeInput(court.openTime)} đến {normalizeTimeInput(court.closeTime)}</p>
                    <Badge variant={court.active ? 'success' : 'neutral'} className="mt-1.5">{court.active ? 'Hoạt động' : 'Tạm khóa'}</Badge>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button type="button" variant="secondary" onClick={() => { setEditingCourtId(court.id); setCourtForm({ name: court.name, sportId: court.sport?.id ?? 0, description: court.description ?? '', openTime: normalizeTimeInput(court.openTime), closeTime: normalizeTimeInput(court.closeTime), active: court.active }); }}>Sửa</Button>
                    <Button type="button" variant="danger" onClick={() => void handleDeleteCourt(court.id)}>Xóa</Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">Trang {courtPage} / {totalCourtPages}</p>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" disabled={courtPage <= 1} onClick={() => setCourtPage((p) => Math.max(1, p - 1))}>Trang trước</Button>
                <Button type="button" variant="secondary" disabled={courtPage >= totalCourtPages} onClick={() => setCourtPage((p) => Math.min(totalCourtPages, p + 1))}>Trang sau</Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Court Schedule Selector */}
        <Card className={`mb-6 ${sectionCard}`}>
          <div className={accentBar('from-indigo-500 to-purple-500')} />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">Court Schedule</p>
          <h2 className="mt-1 font-display text-xl font-bold text-slate-900">Gắn khung giá và block theo sân</h2>
          <label className="mt-4 block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Sân đang quản lý</span>
            <select className={selectCls} value={selectedCourtId ?? ''} onChange={(e) => setSelectedCourtId(Number(e.target.value) || null)}>
              <option value="">Chọn sân</option>
              {courts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          {selectedCourt && <p className="mt-3 text-sm text-slate-500">Đang cấu hình cho: <span className="font-semibold text-slate-800">{selectedCourt.name}</span></p>}
        </Card>

        {/* Price Rules + Blocks */}
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className={sectionCard}>
            <div className={accentBar('from-emerald-500 to-green-500')} />
            <h3 className="font-display text-lg font-bold text-slate-900">Khung giá theo giờ</h3>
            <form className="mt-4 space-y-3" onSubmit={handlePriceSubmit}>
              <div className="grid gap-3 md:grid-cols-2">
                <Input label="Bắt đầu" type="time" value={priceStartTime} onChange={(e) => setPriceStartTime(e.target.value)} required />
                <Input label="Kết thúc" type="time" value={priceEndTime} onChange={(e) => setPriceEndTime(e.target.value)} required />
              </div>
              <Input label="Giá (VND)" type="number" min={1000} step={1000} value={priceValue} onChange={(e) => setPriceValue(e.target.value)} required />
              <div className="flex flex-wrap gap-2">
                <Button type="submit">{editingRuleId ? 'Cập nhật khung giá' : 'Thêm khung giá'}</Button>
                {editingRuleId && <Button type="button" variant="secondary" onClick={() => { setEditingRuleId(null); setPriceStartTime(''); setPriceEndTime(''); setPriceValue(''); }}>Hủy sửa</Button>}
              </div>
            </form>
            <div className="mt-5 space-y-2">
              {priceRules.map((rule) => (
                <div key={rule.id} className={`flex flex-wrap items-center justify-between gap-3 ${itemCard}`}>
                  <div>
                    <p className="font-semibold text-slate-900">{normalizeTimeInput(rule.startTime)} - {normalizeTimeInput(rule.endTime)}</p>
                    <p className="mt-0.5 text-sm font-bold text-emerald-600">{formatCurrency(rule.price)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => { setEditingRuleId(rule.id); setPriceStartTime(normalizeTimeInput(rule.startTime)); setPriceEndTime(normalizeTimeInput(rule.endTime)); setPriceValue(String(rule.price)); }}>Sửa</Button>
                    <Button type="button" variant="danger" onClick={() => void handleDeletePriceRule(rule.id)}>Xóa</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className={sectionCard}>
            <div className={accentBar('from-rose-500 to-pink-500')} />
            <h3 className="font-display text-lg font-bold text-slate-900">Chặn lịch sân</h3>
            <form className="mt-4 space-y-3" onSubmit={handleCreateBlock}>
              <Input label="Bắt đầu" type="datetime-local" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} required />
              <Input label="Kết thúc" type="datetime-local" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} required />
              <Input label="Lý do" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} required />
              <Button type="submit">Thêm block</Button>
            </form>
            <div className="mt-5 space-y-2">
              {blocks.map((block) => (
                <div key={block.id} className={itemCard}>
                  <p className="font-semibold text-slate-900">{block.reason}</p>
                  <p className="mt-1.5 text-sm text-slate-400">{toHumanDateTime(block.startTime)} - {toHumanDateTime(block.endTime)}</p>
                  <Button type="button" variant="danger" className="mt-3" onClick={() => void handleDeleteBlock(block.id)}>Xóa block</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
};

export default OwnerCourtOpsPage;
