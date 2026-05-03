import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

function SongDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for inline editing
  const [editingGrade, setEditingGrade] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const fetchDetails = async () => {
    try {
      const data = await api.getSongDetails(id);
      setSong(data);
    } catch (err) {
      setError('Failed to load song details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your ranking?")) return;
    try {
      const result = await api.deleteRanking(user.user_id, id);
      if (result.song_deleted) {
        navigate('/');  // Song was auto-deleted — go back to dashboard
      } else {
        fetchDetails(); // Refresh rankings list
      }
    } catch (err) {
      alert("Failed to delete ranking.");
    }
  };

  const handleUpdate = async () => {
    try {
      await api.editRanking(user.user_id, id, editingGrade);
      setIsEditing(false);
      fetchDetails();
    } catch (err) {
      alert("Failed to update ranking.");
    }
  };

  if (loading) return <div className="text-center py-20 text-blue-600 font-medium">Loading details...</div>;
  if (error) return <div className="text-center py-20 text-red-500 font-medium">{error}</div>;
  if (!song) return null;

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="mb-6">
        <Link to="/" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {/* ── Song Header ── */}
        <div className="p-8 border-b border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">Song Details</p>
          <h2 className="text-3xl font-extrabold text-gray-900">{song.title}</h2>
          {song.artist && (
            <p className="text-base text-gray-500 mt-1">{song.artist}</p>
          )}

          {/* Tags */}
          {song.tags && song.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {song.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Discovered From */}
          {song.discovered_from && song.discovered_from.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Discovered From</p>
              <div className="flex flex-wrap gap-2">
                {song.discovered_from.map((src, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    {src}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Rankings Section ── */}
        <div className="p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Rankings</h3>

          {song.rankings && song.rankings.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <tbody className="text-gray-700 text-sm">
                  {song.rankings.map((ranking, index) => {
                    const isOwner = ranking.username === user.username;

                    return (
                      <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-medium text-gray-900 flex items-center gap-2">
                          {ranking.username}
                          {isOwner && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">You</span>}
                        </td>

                        <td className="py-4 px-4 text-right">
                          {isOwner && isEditing ? (
                            <div className="flex justify-end items-center gap-2">
                              <select
                                value={editingGrade}
                                onChange={(e) => setEditingGrade(e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded font-bold"
                              >
                                <option value="S">S</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="E">E</option>
                                <option value="F">F</option>
                              </select>
                              <button onClick={handleUpdate} className="text-green-600 font-bold hover:underline">Save</button>
                              <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:underline">Cancel</button>
                            </div>
                          ) : (
                            <div className="flex justify-end items-center gap-4">
                              <span className="inline-block px-3 py-1 bg-gray-900 text-white font-bold rounded-lg shadow-sm min-w-[2.5rem] text-center">
                                {ranking.grade}
                              </span>

                              {isOwner && (
                                <div className="flex gap-2 text-xs">
                                  <button
                                    onClick={() => { setIsEditing(true); setEditingGrade(ranking.grade); }}
                                    className="text-blue-600 hover:underline"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={handleDelete}
                                    className="text-red-600 hover:underline"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">No one has ranked this song yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SongDetails;