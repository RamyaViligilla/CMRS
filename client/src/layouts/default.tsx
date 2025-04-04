import { Navbar } from '@/components/navbar';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 text-gray-600 dark:text-gray-300 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-center space-y-2">
          <p className="text-center text-sm font-medium">
            Clinical Research Management System
          </p>
          <p className="text-center text-xs">
            © {currentYear} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow overflow-y-auto">
        <div className="container mx-auto max-w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <footer className="w-full flex items-center justify-center py-4 bg-gray-100 dark:bg-gray-800">
        <Footer />
      </footer>
    </div>
  );
}
