import React, { useState, useEffect } from 'react';

function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Munculkan kotak password saat web pertama kali dibuka
    const password = prompt("Masukkan Password Akses:");
    
   
    if (password === 'kopi2029') {
      setIsAuthorized(true);
    } else {
      alert("Password salah! Akses ditolak.");
      window.location.reload(); // Refresh kalau salah
    }
  }, []);

  if (!isAuthorized) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Memeriksa Izin Akses...</div>;
  }

  return (
    <div>
      {/* Seluruh isi dashboard kamu pindahkan ke sini */}
      <h1>ID News Scraper - Privat</h1>
      {/* ... data berita kamu ... */}
    </div>
  );
}

export default App;
