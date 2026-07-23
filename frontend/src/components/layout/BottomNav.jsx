import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export default function BottomNav({ id }) {
  const location = useLocation();
  
  // Hide on login/register if needed
  if (['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/chat', label: 'Chat', icon: '💬' },
    { path: '/records', label: 'Records', icon: '📁' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <nav 
      id={id || 'bottom-nav'} 
      className="fixed bottom-0 left-0 right-0 glass border-t border-[var(--glass-border)] z-40 max-w-[440px] mx-auto pb-safe"
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              relative flex flex-col items-center justify-center w-full h-full transition-colors duration-300
              ${isActive ? 'text-primary' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
            `}
          >
            {({ isActive }) => (
              <>
                <span className={`text-xl transition-transform duration-300 ${isActive ? '-translate-y-1 scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-[10px] font-medium transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 absolute'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute -top-1 w-12 h-1 bg-primary rounded-b-full animate-fadeIn"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
