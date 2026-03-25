import asyncio
import logging
import resend
import sys
import os
from datetime import datetime, timedelta

# --- PROTEKSI PATH (Agar GitHub tidak bingung mencari folder backend) ---
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.join(current_dir, '..')
sys.path.append(parent_dir)
sys.path.append(os.path.join(parent_dir, 'backend'))

try:
    from app.scraper.news_collector import scrape_news
    from app.db.supabase_client import supabase
    from app.config import settings
except ImportError as e:
    print(f"Gagal Import: {e}")
    print("Pastikan struktur folder benar: jobs/ dan backend/ ada di root.")
    sys.exit(1)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

resend.api_key = settings.EMAIL_API_KEY

async def run_daily_workflow():
    now = datetime.now()
    yesterday = (now - timedelta(days=1)).isoformat()
    today_str = now.strftime("%Y-%m-%d")
    
    logger.info(f"--- Robot GitHub Mulai: {today_str} ---")

    # 1. Scraping
    count = await scrape_news("Pemilu 2029")
    logger.info(f"Dapat {count} berita.")

    # 2. Ambil data 24 jam terakhir
    response = supabase.table("scraped_data").select("title, url").gte("created_at", yesterday).execute()
    articles = response.data

    if not articles:
        logger.info("Tidak ada berita baru.")
        return

    # 3. Format & Simpan
    report_list = "".join([f"{i+1}. {a['title']} ({a['url']})\n" for i, a in enumerate(articles)])
    
    supabase.table("daily_reports").insert({
        "total_data": len(articles),
        "summary": report_list,
        "report_date": today_str
    }).execute()

    # 4. Kirim Email
    user_res = supabase.table("users").select("email").eq("is_active", True).execute()
    emails = [u['email'] for u in user_res.data]

    if emails:
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": emails,
            "subject": f"📩 Laporan Pemilu 2029 - {today_str}",
            "text": f"Berita terbaru:\n\n{report_list}"
        })
        logger.info("Email terkirim!")

if __name__ == "__main__":
    asyncio.run(run_daily_workflow())
