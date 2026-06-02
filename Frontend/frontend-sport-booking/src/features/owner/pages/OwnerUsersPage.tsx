import { Search, UserCog, Users as UsersIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { User, UserRole } from '../../../entities/user/types';
import userService from '../../../services/userService';
import AppShell from '../../../shared/components/AppShell';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import Input from '../../../shared/ui/Input';
import Badge from '../../../shared/ui/Badge';
import EmptyState from '../../../shared/ui/EmptyState';

const availableRoles: UserRole[] = ['CUSTOMER', 'STAFF', 'OWNER', 'ADMIN'];

const roleBadgeVariant: Record<string, 'success' | 'warning' | 'brand' | 'info'> = {
  OWNER: 'brand',
  STAFF: 'warning',
  CUSTOMER: 'info',
  ADMIN: 'success',
};

const OwnerUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roleDraft, setRoleDraft] = useState<Record<number, UserRole>>({});
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = async (name?: string) => {
    setLoading(true);
    setError('');

    try {
      const data = name?.trim()
        ? await userService.searchOwnerUsers(name.trim())
        : await userService.getOwnerUsers();
      setUsers(data);
      const draft = data.reduce<Record<number, UserRole>>((acc, user) => {
        acc[user.id] = user.role;
        return acc;
      }, {});
      setRoleDraft(draft);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleUpdateRole = async (userId: number) => {
    const nextRole = roleDraft[userId];
    if (!nextRole) {
      return;
    }

    setError('');
    try {
      await userService.updateUserRole(userId, { role: nextRole });
      await loadUsers(searchName);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  };

  return (
    <AppShell>
      {/* Search */}
      <Card className="mb-6">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
          <Input
            label="Tìm user theo tên"
            value={searchName}
            onChange={(event) => setSearchName(event.target.value)}
            placeholder="Nhập tên người dùng..."
          />
          <Button type="button" onClick={() => void loadUsers(searchName)} disabled={loading}>
            <Search size={15} />
            Tìm kiếm
          </Button>
          <Button type="button" variant="secondary" onClick={() => void loadUsers()} disabled={loading}>
            Tất cả
          </Button>
        </div>

        {error && (
          <div className="mt-4 animate-scale-in rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            {error}
          </div>
        )}
      </Card>

      {/* Users List */}
      <Card className="relative overflow-hidden">
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />

        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">Owner Users</p>
        <h2 className="mt-1 font-display text-xl font-bold text-slate-900">Quản lý vai trò người dùng</h2>

        <div className="mt-5 space-y-3">
          {!loading && users.length === 0 && (
            <EmptyState
              icon={UsersIcon}
              title="Không có dữ liệu người dùng"
              description="Hãy thử tìm kiếm với từ khóa khác."
            />
          )}

          {users.map((user) => (
            <div
              key={user.id}
              className="grid gap-3 rounded-xl border border-slate-100 bg-white p-4 transition-all duration-200 hover:border-slate-200 hover:shadow-sm md:grid-cols-[1fr_auto_auto] md:items-center"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-sm font-bold text-slate-500">
                  {user.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{user.fullName}</p>
                    <Badge variant={roleBadgeVariant[user.role] ?? 'neutral'}>{user.role}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-slate-400">{user.email} — {user.phone}</p>
                </div>
              </div>

              <select
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm transition-all hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none"
                value={roleDraft[user.id] ?? user.role}
                onChange={(event) =>
                  setRoleDraft((prev) => ({ ...prev, [user.id]: event.target.value as UserRole }))
                }
              >
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <Button type="button" variant="secondary" onClick={() => void handleUpdateRole(user.id)}>
                <UserCog size={15} />
                Cập nhật
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
};

export default OwnerUsersPage;
