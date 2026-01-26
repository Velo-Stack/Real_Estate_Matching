import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/Layout.css';

const Layout = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'لوحة التحكم';
      case '/offers': return 'إدارة العروض';
      case '/requests': return 'طلبات العملاء';
      case '/matches': return 'التطابقات';
      case '/users': return 'إدارة المستخدمين';
      default: return '';
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <h2 className="page-title">{getPageTitle()}</h2>
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
