import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- KONEKSI DATABASE ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. PINTU RAHASIA (Password: kopi2029)
  useEffect(() => {
    const password = prompt("Masukkan Password Akses:");
    if (password === 'kopi2029') {
      setIsAuthorized(true);
      fetchNews(); // Ambil berita kalau password benar
    } else {
      alert("Password salah! Akses ditolak.");
      window.location.reload();
    }
  }, []);

  // 2. AMBIL DATA BERITA
  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scraped_data')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setNews(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tampilan kalau password belum dimasukkan
  if (!isAuthorized) {
    return <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>Memeriksa Izin Akses...</div>;
  }

  return (
    <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: '#2d3436', margin: 0 }}>ID News Scraper - Privat</h1>
          <p style={{ color: '#636e72' }}>Monitoring Pemilu 2029 via Supabase Cloud</p>
        </div>
        <button 
          onClick={fetchNews} 
          disabled={loading}
          style={{
            backgroundColor: '#00b894', color: 'white', border: 'none', padding: '12px 24px',
            borderRadius: '8px', cursor: 'pointer'
          }}
        >
          {loading ? '🔄 Memperbarui...' : '🔄 Refresh Data'}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {news.map((item) => (
          <div key={item.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <span style={{ fontSize: '12px', backgroundColor: '#dfe6e9', padding: '4px 8px', borderRadius: '4px', color: '#2d3436' }}>
              {item.source}
            </span>
            <h3 style={{ margin: '15px 0 10px 0', fontSize: '18px', color: '#2d3436' }}>{item.title}</h3>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <small style={{ color: '#b2bec3' }}>{new Date(item.created_at).toLocaleDateString()}</small>
              <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#0984e3', textDecoration: 'none' }}>
                Baca Selengkapnya 🔗
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {news.length === 0 && !loading && (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#b2bec3' }}>
          <p>📦 Belum ada data di database.</p>
        </div>
      )}
    </div>
  );
}

export default App;
