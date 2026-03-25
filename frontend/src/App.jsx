import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- CEK VARIABEL SEBELUM JALAN ---
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Jika variabel tidak ada, jangan panggil createClient dulu agar tidak blank
let supabase = null;
if (url && key) {
  supabase = createClient(url, key);
}

function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [news, setNews] = useState([]);
  const [errorInfo, setErrorInfo] = useState("");

  useEffect(() => {
    // 1. Cek apakah kunci API sudah masuk
    if (!url || !key) {
      setErrorInfo("⚠️ ERROR: Kunci API Supabase belum terpasang di Vercel (Environment Variables).");
      return;
    }

    // 2. Jalankan Password
    const password = window.prompt("Masukkan Password:");
    if (password === 'kopi2029') {
      setIsAuthorized(true);
      fetchNews();
    } else if (password !== null) {
      alert("Salah!");
      window.location.reload();
    }
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('scraped_data')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setNews(data || []);
    } catch (err) {
      setErrorInfo("Gagal ambil data: " + err.message);
    }
  };

  // Jika ada Error Info, tampilkan ini (Biar tidak putih polos)
  if (errorInfo) {
    return <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>{errorInfo}</div>;
  }

  if (!isAuthorized) {
    return <div style={{ textAlign: 'center', marginTop: '100px' }}>🔐 Menunggu Password...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>ID News Scraper - Privat</h1>
      <hr />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
        {news.map((item) => (
          <div key={item.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '16px' }}>{item.title}</h3>
            <a href={item.url} target="_blank" rel="noreferrer">Baca Berita 🔗</a>
          </div>
        ))}
      </div>
      {news.length === 0 && <p>Database kosong.</p>}
    </div>
  );
}

export default App;
