import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RefreshCw, ExternalLink, Database } from 'lucide-react';

function App() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fungsi ambil data dari FastAPI
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/news');
      setNews(response.data);
    } catch (err) {
      console.error("Gagal ambil data:", err);
    }
  };

  // Fungsi trigger scraper manual
  const handleScrape = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/run-scrape');
      await fetchData(); // Refresh list setelah scrape
    } catch (err) {
      alert("Gagal menjalankan scraper");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: '#2d3436', margin: 0 }}>ID News Scraper</h1>
          <p style={{ color: '#636e72' }}>Monitoring Pemilu 2029 via Supabase Cloud</p>
        </div>
        <button 
          onClick={handleScrape} 
          disabled={loading}
          style={{
            backgroundColor: '#00b894', color: 'white', border: 'none', padding: '12px 24px',
            borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Scraping Data...' : 'Scrape Data Sekarang'}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {news.map((item) => (
          <div key={item.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <span style={{ fontSize: '12px', backgroundColor: '#dfe6e9', padding: '4px 8px', borderRadius: '4px', color: '#2d3436' }}>
              {item.source}
            </span>
            <h3 style={{ margin: '15px 0 10px 0', fontSize: '18px', color: '#2d3436' }}>{item.title}</h3>
            <p style={{ color: '#636e72', fontSize: '14px', lineHeight: '1.6' }}>{item.content?.substring(0, 150)}...</p>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <small style={{ color: '#b2bec3' }}>{new Date(item.created_at).toLocaleDateString()}</small>
              <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#0984e3', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Baca <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {news.length === 0 && !loading && (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#b2bec3' }}>
          <Database size={48} style={{ marginBottom: '10px' }} />
          <p>Belum ada data. Silahkan klik tombol Scrape.</p>
        </div>
      )}
    </div>
  );
}

export default App;