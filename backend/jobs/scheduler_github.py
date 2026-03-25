import asyncio
import logging
import resend
import os
import sys
from datetime import datetime, timedelta

# Pastikan Python bisa menemukan folder 'backend'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# --- KITA IMPORT MANUAL CLIENTNYA AGAR TIDAK ERROR CONFIG ---
from supabase import create_client
from backend.app.scraper.news_collector import scrape_news

# Konfigurasi Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_daily_workflow():
    # Ambil Kunci Langsung dari Environment GitHub
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    resend_key = os.environ.get("EMAIL_API_KEY")
    
    if not url or not key:
        logger.error("❌ Kunci SUPABASE_URL atau SUPABASE_KEY tidak ditemukan!")
        return

    # Inisialisasi Supabase secara manual (Bypass config.py)
    supabase = create_client(url, key)
    resend.api_key = resend_key

    now = datetime.now()
    yesterday = (now - timedelta(days=1)).isoformat()
    today_str = now.strftime("%Y-%m-%d")
    
    logger.info(f"--- Robot GitHub Beraksi: {today_str} ---")

    # 1. Jalankan Scraper
    count = await scrape_news("Pemilu 2029")
    logger.info(f"Berhasil scrape {count} berita.")

    # 2. Ambil data 24 jam terakhir
    response = supabase.table("scraped_data").select("title, url").gte("created_at", yesterday).execute()
    articles = response.data

    if not articles:
        logger.info("Tidak ada berita baru untuk dilaporkan.")
        return

    # 3. Buat Summary & Simpan ke Daily Reports
    report_text = "\n".join([f"{i+1}. {a['title']} ({a['url']})" for i, a in enumerate(articles)])
    
    supabase.table("daily_reports").insert({
        "total_data": len(articles),
        "summary": report_text,
        "report_date": today_str
    }).execute()

    # 4. Ambil Email User & Kirim
    user_res = supabase.table("users").select("email").eq("is_active", True).execute()
    recipient_emails = [u['email'] for u in user_res.data]

    if recipient_emails:
        try:
            resend.Emails.send({
                "from": "onboarding@resend.dev",
                "to": recipient_emails,
                "subject": f"📩 Laporan Berita Pemilu 2029 - {today_str}",
                "text": f"Daftar Berita Hari Ini:\n\n{report_text}"
            })
            logger.info("✅ Email laporan berhasil dikirim!")
        except Exception as e:
            logger.error(f"❌ Gagal kirim email: {e}")

if __name__ == "__main__":
    asyncio.run(run_daily_workflow())
