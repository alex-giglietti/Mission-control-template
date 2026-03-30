'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Link2, LayoutDashboard, Puzzle, BarChart3, Key, ChevronLeft } from 'lucide-react';

const SUB_NAV = [
  { href: '/connections', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/connections/custom', label: 'Custom Apps', icon: Puzzle },
  { href: '/connections/usage', label: 'Usage', icon: BarChart3 },
  { href: '/connections/keys', label: 'API Keys', icon: Key },
];

export default function ConnectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-[#2A2A3E] bg-[#0E0E14]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg hover:bg-[#1A1A2E] transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#A1A1AA]" />
            </Link>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E91E8C] to-[#00D9FF] flex items-center justify-center shadow-lg shadow-[#E91E8C]/20">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#E91E8C] to-[#00D9FF] bg-clip-text text-transparent">
                  Connections
                </h1>
                <p className="text-xs text-[#6B7280]">
                  AI integration portal
                </p>
              </div>
            </div>

            {/* Sub-navigation */}
            <nav className="flex items-center gap-1 ml-4">
              {SUB_NAV.map(({ href, label, icon: Icon }) => {
                const isActive =
                  href === '/connections'
                    ? pathname === '/connections'
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#E91E8C]/15 text-[#E91E8C] border border-[#E91E8C]/30'
                        : 'text-[#A1A1AA] hover:text-white hover:bg-[#1A1A2E]'
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 1.5} />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-[1800px] mx-auto w-full px-6 py-8 pb-24 lg:pb-8">
        {children}
      </main>
    </div>
  );
}
