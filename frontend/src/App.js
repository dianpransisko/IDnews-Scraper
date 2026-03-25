import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [news, setNews] = useState([]);
  const [pesan, setPesan] = useState("Sedang memuat...");

  useEffect(() => {
    // 1. Langsung munculkan password saat web dibuka
    const passwordInput = window.prompt("Masukkan Password:");

    if (passwordInput === 'kopi2029') {
      setIsAuthorized(true);
      ambilData(); // Baru panggil database kalau password benar
    } else {
      alert("Password Salah!");
      window.location.reload();
    }
  }, []);

  const ambilData = async () => {
    // 2. Kita panggil Supabase DI DALAM fungsi ini saja supaya tidak bikin blank
    const url = process.env.REACT_APP_SUPABASE_URL;
    const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

    if (!url || !key) {
      setPesan("⚠️ ERROR: Kunci API di Vercel belum benar. Cek nama REACT_APP_ nya.");
      return;
    }

    try {
      const supabase = createClient(url, key);
      const { data, error } = await supabase
        .from('scraped_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
      setPesan(""); 
    } catch (err) {
      setPesan("Gagal koneksi ke database: " + err.message);
    }
  };

  // Tampilan kalau password belum diisi (Biar tidak putih polos)
  if (!isAuthorized) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
        <h2>🔐 Halaman Terkunci</h2>
        <p>Silakan isi password pada kotak yang muncul.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>ID News Scraper - Privat</h1>
      <p style={{ color: 'red' }}>{pesan}</p>
      <hr />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
        {news.map((item) => (
          <div key={item.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '16px', margin: '0 0 10px 0' }}>{item.title}</h3>
            <a href={item.url} target="_blank" rel="noreferrer" style={{ color: 'blue', fontWeight: 'bold' }}>
              Baca Berita 🔗
            </a>
          </div>
        ))}
      </div>

      {news.length === 0 && !pesan && <p>Database masih kosong...</p>}
    </div>
  );
}

export default App;
