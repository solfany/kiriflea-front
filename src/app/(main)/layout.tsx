import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-screen-md mx-auto w-full px-4 pb-20 pt-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
