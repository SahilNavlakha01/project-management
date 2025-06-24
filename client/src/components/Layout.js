import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const UserIcon = ({ name }) => (
  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold mr-2">
    {name ? name.charAt(0).toUpperCase() : <span className="material-icons">person</span>}
  </span>
);

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-950 shadow-md py-4 px-8 flex items-center justify-between sticky top-0 z-20 border-b border-gray-100 dark:border-gray-800">
        <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-300 tracking-tight">Task Pilot</Link>
        <nav className="space-x-4 flex items-center">
          <button
            onClick={() => setDark((d) => !d)}
            className="mr-2 px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
            aria-label="Toggle dark mode"
          >
            {dark ? '🌙 Dark' : '☀️ Light'}
          </button>
          <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium">Dashboard</Link>
          {user && (user.role === 'admin' || user.role === 'manager') && (
            <Link to="/project/new" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium">New Project</Link>
          )}
          {user ? (
            <>
              <span className="flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                <UserIcon name={user.name || user.email} />
                <span className="text-gray-700 dark:text-gray-200 font-medium">{user.name || user.email}</span>
                <span className="ml-2 text-xs text-blue-600 dark:text-blue-300 font-bold uppercase">{user.role}</span>
              </span>
              <button onClick={handleLogout} className="ml-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium">Login</Link>
              <Link to="/signup" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium">Signup</Link>
            </>
          )}
        </nav>
      </header>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 bg-gradient-to-br from-white to-blue-50 dark:from-gray-950 dark:to-gray-900 transition-colors duration-300 rounded-xl shadow-lg">
        {children}
      </main>
      <footer className="bg-white dark:bg-gray-950 text-center py-4 text-gray-400 dark:text-gray-500 text-sm border-t border-gray-100 dark:border-gray-800 mt-8">
        &copy; {new Date().getFullYear()} Task Pilot. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
