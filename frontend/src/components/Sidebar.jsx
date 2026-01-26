import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  SquaresFour, 
  Buildings, 
  MagnifyingGlass, 
  Handshake, 
  Users, 
  SignOut 
} from 'phosphor-react';
import '../styles/Layout.css';

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Buildings size={32} color="var(--primary-color)" weight="duotone" />
        <h1 className="brand-title">عقارات ماتش</h1>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <SquaresFour weight="duotone" />
          <span>لوحة التحكم</span>
        </NavLink>

        <NavLink to="/offers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Buildings weight="duotone" />
          <span>العروض العقارية</span>
        </NavLink>

        <NavLink to="/requests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <MagnifyingGlass weight="duotone" />
          <span>طلبات العملاء</span>
        </NavLink>

        <NavLink to="/matches" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Handshake weight="duotone" />
          <span>التطابقات الذكية</span>
        </NavLink>

        {user?.role === 'ADMIN' && (
          <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users weight="duotone" />
            <span>المستخدمين</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">
            {user?.name?.charAt(0)}
          </div>
          <div className="user-info">
            <h4>{user?.name}</h4>
            <p>{user?.role}</p>
          </div>
        </div>
        <button onClick={logout} className="nav-item" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
          <SignOut weight="duotone" />
          <span>تسجيل خروج</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
