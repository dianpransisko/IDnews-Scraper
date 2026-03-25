import asyncio
import os
import sys
import logging
import resend
from datetime import datetime, timedelta

# Menambahkan jalur folder agar Python bisa menemukan 'app' di dalam 'backend'
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_path = os.path.abspath(os.path.join(current_dir, '..', 'backend'))
sys.path.append(backend_path)

try:
    # Mengimpor modul dari folder backend/app
    from app.scraper.news_collector import scrape_news
    from app.db.supabase_client import supabase
    print("✅ Modul berhasil diimpor.")
except ImportError as e:
    print(f"❌ Gagal import: {e}. Pastikan folder 'app' ada di dalam 'backend'.")
    sys.exit(1)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_robot():
    # Ambil kunci dari GitHub Secrets (Environment Variables)
    resend.api_key = os.getenv("EMAIL_API_KEY")
    
    now = datetime.now()
    yesterday = (now - timedelta(days=1)).isoformat()
    today_str = now.strftime("%Y-%m-%d")
    
    print(f"🚀 Memulai Scraping: {today_str}")

    # 1. Jalankan Scraper
    try:
        count = await scrape_news("Pemilu 2029")
        print(f"📊 Hasil: {count} berita ditemukan.")
    except Exception as e:
        print(f"❌ Error saat scraping: {e}")
        return

    # 2. Ambil data dari Supabase
    response = supabase.table("scraped_data").select("title, url").gte("created_at", yesterday).execute()
    articles = response.data

    if not articles:
        print("📭 Tidak ada data baru hari ini.")
        return

    # 3. Buat Laporan & Kirim Email
    report = "\n".join([f"{i+1}. {a['title']} ({a['url']})" for i, a in enumerate(articles)])
    
    # Simpan ke daily_reports
    supabase.table("daily_reports").insert({
        "total_data": len(articles),
        "summary": report,
        "report_date": today_str
    }).execute()

    # Kirim ke email aktif
    user_res = supabase.table("users").select("email").eq("is_active", True).execute()
    emails = [u['email'] for u in user_res.data]

    if emails:
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": emails,
            "subject": f"📩 Laporan Berita Pemilu 2029 - {today_str}",
            "text": report
        })
        print("✅ Email terkirim ke:", emails)

if __name__ == "__main__":
    asyncio.run(run_robot())
