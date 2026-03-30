import { Sidebar } from '@/components/Sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fff' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
    </div>
  );
}
