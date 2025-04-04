import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import UploadButton from '../admin/UploadButton';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
      <UploadButton />
    </div>
  );
};

export default Layout;
