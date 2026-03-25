import asyncio
import logging
import resend
import sys
import os
from datetime import datetime, timedelta

# --- SETTING JALUR FOLDER ---
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.join(current_dir, '..')
sys.path.append(parent_dir)
sys.path.append(os.path.join(parent_dir, 'backend'))

# --- CEK APAKAH KUNCI TERSEDIA ---
def check_secrets():
    secrets = ["SUPABASE_URL", "SUPABASE_KEY", "GNEWS_API_KEY", "EMAIL_API_KEY"]
    missing = []
    for s in secrets:
        if not os.getenv(s):
            missing.append(s)
    if missing:
        print(f"❌ ERROR: Kunci berikut tidak ditemukan di Environment GitHub: {', '.join(missing)}")
        print("Pastikan kamu sudah memasukkannya di tab Settings > Secrets > Actions DAN di file YAML.")
        sys.exit(1)
    print("✅ Semua kunci ditemukan! Memulai robot...")

try:
    from app.scraper.news_collector import scrape_news
    from app.db.supabase_client import supabase
    from app.config import settings
except ImportError as e:
    print(f"❌ Gagal Import: {e}")
    sys.exit(1)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_daily_workflow():
    check_secrets() # Cek kunci sebelum jalan
    
    resend.api_key = os.getenv("EMAIL_API_KEY")
    now = datetime.now()
    yesterday = (now - timedelta(days=1)).isoformat()
    today_str = now.strftime("%Y-%m-%d")
    
    logger.info(f"--- Robot Beraksi ({today_str}) ---")

    # 1. Scrape
    count = await scrape_news("Pemilu 2029")
    
    # 2. Ambil Data & Kirim
    response = supabase.table("scraped_data").select("title, url").gte("created_at", yesterday).execute()
    articles = response.data

    if not articles:
        logger.info("Tidak ada berita baru hari ini.")
        return

    report_list = "".join([f"{i+1}. {a['title']} ({a['url']})\n" for i, a in enumerate(articles)])
    
    # Simpan Laporan
    supabase.table("daily_reports").insert({
        "total_data": len(articles),
        "summary": report_list,
        "report_date": today_str
    }).execute()

    # Kirim Email
    user_res = supabase.table("users").select("email").eq("is_active", True).execute()
    emails = [u['email'] for u in user_res.data]

    if emails:
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": emails,
            "subject": f"📩 Update Berita Pemilu - {today_str}",
            "text": report_list
        })
        logger.info("✅ Selesai! Email terkirim.")

if __name__ == "__main__":
    asyncio.run(run_daily_workflow())
