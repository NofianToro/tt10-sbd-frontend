import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const getLetterGrade = (score) => {
  const num = parseFloat(score);
  if (isNaN(num)) return '';
  if (num >= 5.5) return 'S';
  if (num >= 4.5) return 'A';
  if (num >= 3.5) return 'B';
  if (num >= 2.5) return 'C';
  if (num >= 1.5) return 'D';
  if (num >= 0.5) return 'E';
  return 'F';
};

function Dashboard() {
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for the selected tag
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const data = await api.getSongs();
        setSongs(data);
      } catch (err) {
        setError('Failed to load global rankings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  // Extract a unique, sorted list of all tags for the dropdown
  const allAvailableTags = useMemo(() => {
    const tagsSet = new Set();
    songs.forEach(song => {
      if (song.tags) {
        song.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return ['All', ...Array.from(tagsSet).sort()];
  }, [songs]);

  // Filter the songs before rendering them
  const filteredSongs = useMemo(() => {
    if (selectedTag === 'All') return songs;
    return songs.filter(song => song.tags && song.tags.includes(selectedTag));
  }, [songs, selectedTag]);

  if (loading) return <div className="text-center py-20 text-blue-600 font-medium">Loading rankings...</div>;
  if (error) return <div className="text-center py-20 text-red-500 font-medium">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Global Rankings</h2>
        
        {/* Filter Dropdown */}
        <div className="flex items-center space-x-2">
          <label htmlFor="tag-filter" className="text-sm font-medium text-gray-600">Filter:</label>
          <select 
            id="tag-filter"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {allAvailableTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        <button onClick={() => navigate('/add-song')} className="px-4 py-1.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            + Add Ranking Entry
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-50 border-b border-gray-200 text-blue-800 text-sm uppercase tracking-wider">
              <th className="py-4 px-6 font-semibold">Rank</th>
              <th className="py-4 px-6 font-semibold">Song</th>
              <th className="py-4 px-6 font-semibold hidden md:table-cell">Tags</th>
              <th className="py-4 px-6 text-center font-semibold">Avg Score</th>
              <th className="py-4 px-6 text-center font-semibold">Votes</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {/* Map over filteredSongs instead of songs */}
            {filteredSongs.map((song, index) => (
              <tr 
                key={song.song_id} 
                onClick={() => navigate(`/song/${song.song_id}`)}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <td className="py-4 px-6 font-medium text-gray-400">{index + 1}</td>
                <td className="py-4 px-6">
                  <div className="font-bold text-gray-900">{song.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{song.artist || '-'}</div>
                </td>
                
                {/* Display a quick preview of the tags in the row */}
                <td className="py-4 px-6 hidden md:table-cell">
                  {song.tags && song.tags.length > 0 ? (
                     <div className="flex flex-wrap gap-1">
                        {song.tags.slice(0, 2).map((tag, i) => (
                           <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                             {tag}
                           </span>
                        ))}
                        {song.tags.length > 2 && <span className="text-xs text-gray-400">+{song.tags.length - 2}</span>}
                     </div>
                  ) : <span className="text-gray-400">-</span>}
                </td>

                <td className="py-4 px-6 text-center">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-full">
                    {song.average_score_numeric ? `${getLetterGrade(song.average_score_numeric)} (${song.average_score_numeric})` : 'N/A'}
                  </span>
                </td>
                <td className="py-4 px-6 text-center text-gray-500">{song.total_rankings}</td>
              </tr>
            ))}
            
            {filteredSongs.length === 0 && (
              <tr>
                 <td colSpan="5" className="py-12 text-center text-gray-500">
                    No songs match this tag.
                 </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;