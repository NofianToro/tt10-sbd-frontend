const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = {
  // --- USERS & AUTH ---
  register: async (username, password) => {
    const res = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Registration failed. Username might be taken.');
    return res.json();
  },

  login: async (username, password) => {
    const res = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  // --- SONGS ---
  getSongs: async () => {
    const res = await fetch(`${BASE_URL}/songs`);
    if (!res.ok) throw new Error('Failed to fetch songs');
    return res.json();
  },

  getSongDetails: async (id) => {
    const res = await fetch(`${BASE_URL}/songs/${id}`);
    if (!res.ok) throw new Error('Failed to fetch song details');
    return res.json();
  },

  addSong: async (title, artist, tags, discoveredFrom) => {
    const res = await fetch(`${BASE_URL}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        artist,
        tags,
        discovered_from: discoveredFrom
      })
    });
    if (!res.ok) throw new Error('Failed to create song');
    return res.json();
  },

  updateSong: async (songId, title, artist, tags, discoveredFrom) => {
    const res = await fetch(`${BASE_URL}/songs/${songId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, artist, tags, discovered_from: discoveredFrom })
    });
    if (!res.ok) throw new Error('Failed to update song');
    return res.json();
  },

  // --- RANKINGS ---
  submitRanking: async (userId, songId, grade) => {
    const res = await fetch(`${BASE_URL}/rankings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, song_id: songId, grade })
    });
    if (!res.ok) throw new Error('Failed to submit ranking');
    return res.json();
  },

  editRanking: async (userId, songId, grade) => {
    const res = await fetch(`${BASE_URL}/rankings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, song_id: songId, grade })
    });
    if (!res.ok) throw new Error('Failed to update ranking');
    return res.json();
  },

  deleteRanking: async (userId, songId) => {
    const res = await fetch(`${BASE_URL}/rankings/${userId}/${songId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete ranking');
    return res.json();
  }
};