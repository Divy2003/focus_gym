
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import '../../styles/admin/AdminLayout.css';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const hamburgerBtn = document.querySelector('.hamburger-btn');
      const modalOverlay = document.querySelector('.modal-overlay');
      
      // Don't close sidebar if clicking inside a modal
      if (modalOverlay && modalOverlay.contains(event.target)) {
        return;
      }
      
      if (
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target) && 
        hamburgerBtn && 
        !hamburgerBtn.contains(event.target) && 
        isSidebarOpen
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Close sidebar on window resize to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      
      {/* Hamburger menu button */}
      <button className="hamburger-btn" onClick={toggleSidebar}>
        <span className={`hamburger-line ${isSidebarOpen ? 'active' : ''}`}></span>
        <span className={`hamburger-line ${isSidebarOpen ? 'active' : ''}`}></span>
        <span className={`hamburger-line ${isSidebarOpen ? 'active' : ''}`}></span>
      </button>

      <aside ref={sidebarRef} className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Focus Gym</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" onClick={closeSidebar}>Dashboard</Link>
          <Link to="/admin/members" onClick={closeSidebar}>Members</Link>
          <Link to="/admin/diets" onClick={closeSidebar}>Diet Plans</Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
