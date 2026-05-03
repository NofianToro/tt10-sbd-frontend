import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

function AddSong({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tab mode: 'existing' or 'new'
  const [mode, setMode] = useState('existing');

  // --- State for "Rank Existing Song" mode ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [existingGrade, setExistingGrade] = useState('A');
  const [existingTagsStr, setExistingTagsStr] = useState('');
  const [existingSourcesStr, setExistingSourcesStr] = useState('');

  // --- State for "Add New Song" mode ---
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [sourcesStr, setSourcesStr] = useState('');
  const [newGrade, setNewGrade] = useState('A');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setError('');
    try {
      const allSongs = await api.getSongs();
      const q = searchQuery.toLowerCase();
      const results = allSongs.filter(
        s => s.title.toLowerCase().includes(q) || (s.artist && s.artist.toLowerCase().includes(q))
      );
      setSearchResults(results);
      if (results.length === 0) setError('No songs found matching your search.');
    } catch (err) {
      setError('Failed to search songs.');
    }
  };

  const handleSubmitExisting = async (e) => {
    e.preventDefault();
    if (!selectedSong) {
      setError('Please search and select a song first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // If user provided new tags or sources, merge them into the song
      const newTags = existingTagsStr.split(',').map(t => t.trim()).filter(t => t !== '');
      const newSources = existingSourcesStr.split(',').map(s => s.trim()).filter(s => s !== '');

      if (newTags.length > 0 || newSources.length > 0) {
        // Fetch current song details to get existing tags/sources for merging
        const details = await api.getSongDetails(selectedSong.song_id);
        const mergedTags = [...new Set([...(details.tags || []), ...newTags])];
        const mergedSources = [...new Set([...(details.discovered_from || []), ...newSources])];
        await api.updateSong(
          selectedSong.song_id,
          details.title,
          details.artist,
          mergedTags,
          mergedSources
        );
      }

      await api.submitRanking(user.user_id, selectedSong.song_id, existingGrade);
      navigate('/');
    } catch (err) {
      if (err.message.includes('409') || err.message.toLowerCase().includes('already')) {
        setError('You have already ranked this song. Go to the song page to edit your ranking.');
      } else {
        setError('Failed to submit ranking. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNew = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t !== '');
      const sources = sourcesStr.split(',').map(s => s.trim()).filter(s => s !== '');
      const newSong = await api.addSong(title, artist, tags, sources);
      await api.submitRanking(user.user_id, newSong.song_id, newGrade);
      navigate('/');
    } catch (err) {
      setError('Failed to add the song and ranking. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const gradeOptions = (
    <>
      <option value="S">S - Masterpiece</option>
      <option value="A">A - Great</option>
      <option value="B">B - Good</option>
      <option value="C">C - Average</option>
      <option value="D">D - Poor</option>
      <option value="E">E - Horrible</option>
      <option value="F">F - The worst piece of music known to mankind</option>
    </>
  );

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <div className="mb-6">
        <Link to="/" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Add a Song Ranking</h2>
        <p className="text-sm text-gray-500 mb-6">Rank a song that already exists, or add a brand new one.</p>

        {/* Tab Switcher */}
        <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-6">
          <button
            onClick={() => { setMode('existing'); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${mode === 'existing' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
          >
            Rank an Existing Song
          </button>
          <button
            onClick={() => { setMode('new'); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${mode === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
          >
            Add a New Song
          </button>
        </div>

        {error && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        {/* --- EXISTING SONG MODE --- */}
        {mode === 'existing' && (
          <form onSubmit={handleSubmitExisting} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search by Title or Artist</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSelectedSong(null); setSearchResults([]); }}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Kangen, Dewa 19..."
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && !selectedSong && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {searchResults.map(song => (
                  <button
                    key={song.song_id}
                    type="button"
                    onClick={() => { setSelectedSong(song); setSearchResults([]); }}
                    className="w-full text-left px-4 py-3 border-b last:border-0 border-gray-100 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-semibold text-gray-900">{song.title}</div>
                    <div className="text-xs text-gray-500">{song.artist || 'Unknown artist'}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Song */}
            {selectedSong && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <div className="font-semibold text-blue-900">{selectedSong.title}</div>
                  <div className="text-xs text-blue-600">{selectedSong.artist || 'Unknown artist'}</div>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedSong(null); setSearchQuery(''); }}
                  className="text-xs text-red-500 hover:underline ml-4"
                >
                  Change
                </button>
              </div>
            )}

            <hr className="border-gray-100" />

            {/* Optional tags & sources for existing song */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Tags <span className="text-gray-400 font-normal">(optional, comma separated)</span>
              </label>
              <input
                type="text"
                value={existingTagsStr}
                onChange={(e) => setExistingTagsStr(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. indie, lo-fi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discovered From <span className="text-gray-400 font-normal">(optional, comma separated)</span>
              </label>
              <input
                type="text"
                value={existingSourcesStr}
                onChange={(e) => setExistingSourcesStr(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. YouTube, Spotify"
              />
            </div>

            <hr className="border-gray-100" />

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Your Grade *</label>
              <select
                value={existingGrade}
                onChange={(e) => setExistingGrade(e.target.value)}
                className="w-full md:w-2/3 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold"
              >
                {gradeOptions}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedSong}
              className="w-full mt-2 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {loading ? 'Submitting...' : 'Submit Ranking'}
            </button>
          </form>
        )}

        {/* --- NEW SONG MODE --- */}
        {mode === 'new' && (
          <form onSubmit={handleSubmitNew} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Song Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 1-ban kagayaku hoshi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Artist</label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Sumire Uesaka"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Comma separated)</label>
              <input
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. anime, acoustic, j-pop"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discovered From (Comma separated)</label>
              <input
                type="text"
                value={sourcesStr}
                onChange={(e) => setSourcesStr(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. roshidere, YouTube, Spotify"
              />
            </div>

            <hr className="border-gray-100 my-2" />

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Your Grade *</label>
              <select
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                className="w-full md:w-2/3 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold"
              >
                {gradeOptions}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {loading ? 'Submitting...' : 'Add Song & Ranking'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AddSong;