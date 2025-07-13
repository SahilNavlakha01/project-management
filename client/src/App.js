import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ProjectForm from './components/ProjectForm';
import TaskList from './components/TaskList';
import PrivateRoute from './components/PrivateRoute';
import { useContext, useEffect } from 'react';

function AppRoutes() {
  const { user, authLoading } = useContext(AuthContext);
  if (authLoading) return <div className="flex items-center justify-center min-h-screen text-xl dark:bg-gray-900 dark:text-gray-100 bg-white">Loading...</div>;
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/project/new" element={<PrivateRoute><ProjectForm /></PrivateRoute>} />
      <Route path="/project/edit/:id" element={<PrivateRoute><ProjectForm /></PrivateRoute>} />
      <Route path="/project/:id/tasks" element={<PrivateRoute><TaskList /></PrivateRoute>} />
    </Routes>
  );
}

function App() {
  // Theme persistence and initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // Optional: Provide a function to toggle theme (can be used in a button)
  // window.toggleTheme = () => {
  //   const isDark = document.documentElement.classList.toggle('dark');
  //   localStorage.setItem('theme', isDark ? 'dark' : 'light');
  // };

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}


export default App;