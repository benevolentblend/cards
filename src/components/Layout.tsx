import { Inter } from 'next/font/google';

interface LayoutProps {
  children: React.ReactNode;
  topRight?: React.ReactNode;
}

const inter = Inter({ subsets: ['latin'] });

const Layout = ({ children, topRight }: LayoutProps) => {
  return (
    <main
      className={`${inter.className} flex min-h-screen w-screen flex-col items-center bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 px-4 py-8`}
    >
      <div className="w-full md:max-w-4xl">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex-1" />
          <h1 className="text-3xl font-bold tracking-wide text-amber-100 drop-shadow-lg">
            🃏 Card Game
          </h1>
          <div className="flex flex-1 justify-end">{topRight}</div>
        </header>
        <section className="w-full rounded-2xl border-4 border-amber-200 bg-gradient-to-b from-amber-50 to-amber-100 p-4 shadow-2xl">
          {children}
        </section>
        <footer className="mt-4 text-center text-sm text-emerald-300 opacity-75">
          Play with friends!
        </footer>
      </div>
    </main>
  );
};

export default Layout;
