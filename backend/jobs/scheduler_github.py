import asyncio
import os
import sys

# Tambahkan path agar folder backend terbaca
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

print("--- Memulai Debugging Robot ---")

try:
    from app.scraper.news_collector import scrape_news
    from app.db.supabase_client import supabase
    print("✅ Berhasil import semua modul.")
except Exception as e:
    print(f"❌ Gagal import: {e}")
    sys.exit(1)

async def test_run():
    print(f"Mencoba koneksi ke Supabase URL: {os.getenv('SUPABASE_URL')[:10]}...")
    
    try:
        # Jalankan Scraper
        print("Sedang menarik data berita...")
        count = await scrape_news("Pemilu 2029")
        print(f"Hasil: Berhasil dapat {count} berita.")
        
        # Tes ambil data dari user
        res = supabase.table("users").select("email").eq("is_active", True).execute()
        print(f"Daftar email tujuan: {len(res.data)} user ditemukan.")
        
    except Exception as e:
        print(f"❌ Error saat eksekusi: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(test_run())
