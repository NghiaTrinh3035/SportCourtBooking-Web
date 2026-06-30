import { CalendarClock, House, Settings2, ShieldUser, Trophy, UserRound, Users, Search } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { UserRole } from '../../entities/user/types';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../hooks/useAuth';
import Badge from '../ui/Badge';

const commonNavItems = [
  { label: 'Hồ sơ', path: ROUTES.profile, icon: UserRound },
];

const roleNavItems: Record<Exclude<UserRole, 'ADMIN'>, Array<{ label: string; path: string; icon: typeof House }>> = {
  CUSTOMER: [
    { label: 'Trang chủ', path: ROUTES.home, icon: House },
    { label: 'Đặt sân', path: ROUTES.booking, icon: CalendarClock },
  ],
  OWNER: [
    { label: 'Dashboard', path: ROUTES.ownerDashboard, icon: ShieldUser },
    { label: 'Môn & Sân', path: ROUTES.ownerCourts, icon: CalendarClock },
    { label: 'Người dùng', path: ROUTES.ownerUsers, icon: Users },
    { label: 'Vận hành Staff', path: ROUTES.staffOperations, icon: Settings2 },
    { label: 'Tra cứu đơn', path: ROUTES.staffSearch, icon: Search },
  ],
  STAFF: [
    { label: 'Staff Operations', path: ROUTES.staffOperations, icon: Settings2 },
    { label: 'Tra cứu đơn', path: ROUTES.staffSearch, icon: Search },
    { label: 'Trang chủ', path: ROUTES.home, icon: House },
  ],
};

const roleBadge: Record<string, { label: string; variant: 'brand' | 'warning' | 'info' }> = {
  OWNER: { label: 'Owner', variant: 'brand' },
  STAFF: { label: 'Staff', variant: 'warning' },
  CUSTOMER: { label: 'Customer', variant: 'info' },
};

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className = '' }: SidebarProps) => {
  const { user } = useAuth();
  const role = user?.role;
  const dynamicNav =
    role && role !== 'ADMIN'
      ? roleNavItems[role]
      : [
          { label: 'Trang chủ', path: ROUTES.home, icon: House },
          { label: 'Đặt sân', path: ROUTES.booking, icon: CalendarClock },
        ];
  const navItems = [...dynamicNav, ...commonNavItems];

  const badge = role ? roleBadge[role] : null;

  return (
    <aside
      className={`w-72 shrink-0 flex-col border-r border-slate-200/40 bg-gradient-to-b from-white via-teal-50/30 to-white p-5 ${className}`}
    >
      {/* Logo */}
      <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 p-4 shadow-lg shadow-teal-600/20">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white">
            <Trophy size={20} />
          </div>
          <div>
            <p className="font-display text-base font-bold text-white">SportCourt</p>
            <p className="text-[11px] text-teal-100">Đặt lịch nhanh, vận hành gọn</p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      {user && badge && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-xs font-bold text-white shadow-sm">
            {user.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{user.fullName}</p>
            <Badge variant={badge.variant} className="mt-0.5">{badge.label}</Badge>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="mt-5 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/20'
                    : 'text-slate-600 hover:bg-teal-50 hover:text-teal-800'
                }`
              }
            >
              <Icon size={17} className="transition-transform duration-200 group-hover:scale-110" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
