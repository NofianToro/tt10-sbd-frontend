import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Login from './pages/Login';
import Register from './pages/Register'; // <-- NEW: Added this import!
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import SongDetails from './pages/SongDetails';
import AddSong from './pages/AddSong';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  return (
    <Router>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      
      <main className="p-4 md:p-8">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          
          {/* Dashboard */}
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />

          {/* Add Song */}
          <Route path="/add-song" element={user ? <AddSong user={user} /> : <Navigate to="/login" />} />
          
          {/* Dynamic Song Details (Cleaned up the duplicate) */}
          <Route path="/song/:id" element={user ? <SongDetails user={user} /> : <Navigate to="/login" />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;