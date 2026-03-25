import React, { useState, useEffect } from 'react';
// Import icon dari lucide-react (pastikan sudah terinstall: npm install lucide-react)
import { RefreshCw, ExternalLink, Database } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- KONFIGURASI SUPABASE ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Fungsi Cek Password
  useEffect(() => {
    const password = prompt("Masukkan Password Akses:");
    if (password === 'kopi2029') {
      setIsAuthorized(true);
      fetchNews(); // Ambil data jika password benar
    } else {
      alert("Password salah! Akses ditolak.");
      window.location.reload();
    }
  }, []);

  // 2. Fungsi Ambil Data dari Supabase
  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scraped_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error("Error fetching news:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fungsi Tombol (Hanya untuk Refresh Data dari DB)
  const handleScrape = () => {
    fetchNews();
  };

  // Tampilan loading otorisasi
  if (!isAuthorized) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
        <h2>🔒 Memeriksa Izin Akses...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: '#2d3436', margin: 0 }}>ID News Scraper - Privat</h1>
          <p style={{ color: '#636e72' }}>Monitoring Pemilu 2029 via Supabase Cloud</p>
        </div>
        
        <button 
          onClick={handleScrape} 
          disabled={loading}
          style={{
            backgroundColor: '#00b894', color: 'white', border: 'none', padding: '12px 24px',
            borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', 
            display: 'flex', alignItems: 'center', gap: '8px', transition: '0.3s'
          }}
        >
          <RefreshCw size={20} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Memperbarui...' : 'Refresh Data'}
        </button>
      </header>

      {/* Grid Kartu Berita */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {news.map((item) => (
          <div key={item.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#e1f5fe', padding: '4px 10px', borderRadius: '20px', color: '#0288d1', textTransform: 'uppercase' }}>
                {item.source || 'Berita'}
              </span>
              <h3 style={{ margin: '15px 0 10px 0', fontSize: '18px', color: '#2d3436', lineHeight: '1.4' }}>
                {item.title}
              </h3>
            </div>
            
            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <small style={{ color: '#b2bec3' }}>
                {new Date(item.created_at).toLocaleDateString('id-ID')}
              </small>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noreferrer" 
                style={{ color: '#0984e3', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                Baca <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {/* Tampilan jika data kosong */}
      {news.length === 0 && !loading && (
        <div style={{ textAlign: 'center', marginTop: '80px', color: '#b2bec3' }}>
          <Database size={64} style={{ marginBottom: '15px', opacity: 0.5 }} />
          <p>Belum ada data di database.</p>
        </div>
      )}

      {/* CSS Animasi Spin sederhana */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
