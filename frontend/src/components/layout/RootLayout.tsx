import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

/** Shared shell: sticky navbar and routed content. */
export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

/** Content container with standard page padding. */
export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
  );
}
