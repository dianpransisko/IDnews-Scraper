import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- BAGIAN INI JANGAN DIUBAH ---
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || '', 
  process.env.REACT_APP_SUPABASE_ANON_KEY || ''
);

function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. LOGIKA IF/ELSE SEDERHANA (Halaman Depan)
    const passwordInput = prompt("Masukkan Password untuk Melihat Berita:");
    
    if (passwordInput === 'kopi2029') {
      setIsAuthorized(true);
      fetchNews(); // Ambil berita
    } else {
      alert("Akses Ditolak! Password Salah.");
      window.location.reload(); 
    }
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('scraped_data')
        .select('*')
        .order('created_at', { ascending: false });
      setNews(data || []);
    } catch (e) {
      console.log("Gagal ambil data");
    } finally {
      setLoading(false);
    }
  };

  // JIKA BELUM LOGIN, TAMPILKAN HALAMAN KOSONG/LOADING
  if (!isAuthorized) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
        <h1>🔐 Website Terkunci</h1>
        <p>Silakan masukkan password pada kotak yang muncul.</p>
      </div>
    );
  }

  // JIKA SUDAH LOGIN (IF AUTHORIZED), TAMPILKAN SEMUA BERITA
  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '30px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
        <h1 style={{ color: '#2d3436' }}>ID News Scraper - Privat</h1>
        <button 
          onClick={fetchNews} 
          style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#00b894', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          {loading ? 'Memperbarui...' : '🔄 Segarkan Berita'}
        </button>
      </header>

      {/* Tampilan Kartu Berita */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {news.map((item) => (
          <div key={item.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <small style={{ color: '#0984e3', fontWeight: 'bold' }}>{item.source}</small>
            <h3 style={{ margin: '10px 0', fontSize: '18px' }}>{item.title}</h3>
            <div style={{ marginTop: '15px' }}>
              <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#0984e3', textDecoration: 'none', fontWeight: 'bold' }}>
                Baca Selengkapnya 🔗
              </a>
            </div>
          </div>
        ))}
      </div>

      {news.length === 0 && !loading && <p style={{ textAlign: 'center' }}>Tidak ada berita ditemukan.</p>}
    </div>
  );
}

export default App;
