import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import TherapistDashboard from './components/TherapistDashboard';
import PsychiatristDashboard from './components/PsychiatristDashboard';
import PatientDashboard from './components/PatientDashboard';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // 'login', 'register', 'app'

  useEffect(() => {
    // Check for existing token
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setView('app');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setView('app');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setView('login');
  };

  const renderContent = () => {
    if (view === 'login') {
      return <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setView('register')} />;
    }

    if (view === 'register') {
      return <RegisterPage onRegisterSuccess={() => setView('login')} onSwitchToLogin={() => setView('login')} />;
    }

    if (view === 'app' && user) {
      // Simple role detection based on ID prefix for now
      // In a real app, role should be in the user object from DB
      const userId = user.id.toUpperCase();

      if (userId.startsWith('DR')) {
        return <PsychiatristDashboard onBack={handleLogout} />;
      } else if (userId.startsWith('T')) {
        return <TherapistDashboard onBack={handleLogout} />;
      } else if (userId === 'ADMIN') {
        return (
          <div>
            <div className="bg-slate-800 text-white p-2 text-center text-sm flex justify-between px-10">
              <span>Admin Mode</span>
              <button onClick={handleLogout} className="underline hover:text-red-300">Logout</button>
            </div>
            <Dashboard />
          </div>
        );
      } else {
        // Default to Patient
        return <PatientDashboard userId={user.id} onLogout={handleLogout} />;
      }
    }

    return <div>Loading...</div>;
  };

  return (
    <div className="App">
      {renderContent()}
    </div>
  );
}

export default App;
