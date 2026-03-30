import { Sidebar } from '@/components/Sidebar';

<<<<<<< HEAD
export default function MainLayout({ children }: { children: React.ReactNode }) {
=======
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
>>>>>>> origin/feature/get-sales
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fff' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
    </div>
  );
}
