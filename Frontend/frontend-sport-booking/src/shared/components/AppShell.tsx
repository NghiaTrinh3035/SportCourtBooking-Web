import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const AppShell = ({ children }: PropsWithChildren) => {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-teal-50/60 via-slate-50 to-sky-50/40 text-slate-800">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed -left-32 -top-32 h-96 w-96 rounded-full bg-teal-200/20 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-200/15 blur-3xl" />

      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <Sidebar className="hidden lg:flex" />

        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar onOpenMobileMenu={() => setOpenMenu((prev) => !prev)} />
          <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {openMenu && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpenMenu(false)}
        >
          <div
            className="h-full w-72 animate-slide-in-left bg-white/95 backdrop-blur-xl p-4 shadow-float"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <Sidebar className="flex w-full border-none p-0" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AppShell;
