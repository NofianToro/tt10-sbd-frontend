import { Link } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* The Logo/Brand */}
        <Link to="/" className="text-xl font-bold text-blue-600 tracking-tight">
          SongRank
        </Link>
        
        {/* User Info & Controls */}
        <div className="flex items-center space-x-6">
          <span className="text-gray-600 text-sm">
            Hi, <strong className="text-gray-900">{user.username}</strong>
          </span>
          <button 
            onClick={onLogout} 
            className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;