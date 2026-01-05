import { Inter } from "next/font/google";

interface LayoutProps {
  children: React.ReactNode;
  topRight?: React.ReactNode;
}

const inter = Inter({ subsets: ["latin"] });

const Layout = ({ children, topRight }: LayoutProps) => {
  return (
    <main
      className={`${inter.className} flex flex-col items-center min-h-screen bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 w-screen py-8 px-4`}
    >
      <div className="w-full md:max-w-4xl">
        <header className="flex items-center justify-between mb-6">
          <div className="flex-1" />
          <h1 className="text-3xl font-bold text-amber-100 drop-shadow-lg tracking-wide">
            🃏 Card Game
          </h1>
          <div className="flex-1 flex justify-end">
            {topRight}
          </div>
        </header>
        <section className="rounded-2xl p-6 shadow-2xl bg-gradient-to-b from-amber-50 to-amber-100 border-4 border-amber-200 w-full">
          {children}
        </section>
        <footer className="text-center mt-4 text-emerald-300 text-sm opacity-75">
          Play with friends!
        </footer>
      </div>
    </main>
  );
};

export default Layout;
