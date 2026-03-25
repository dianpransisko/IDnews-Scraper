import asyncio
import logging
import resend
from apscheduler.schedulers.blocking import BlockingScheduler
from datetime import datetime, timedelta
from app.scraper.news_collector import scrape_news
from app.db.supabase_client import supabase
from app.config import settings

# Konfigurasi Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

resend.api_key = settings.EMAIL_API_KEY

async def run_daily_workflow():
    """
    Alur Sistem:
    1. Scraper jalan
    2. Ambil data 24 jam terakhir
    3. Simpan ke daily_reports
    4. Kirim email (Daftar Judul + Link)
    """
    now = datetime.now()
    yesterday = (now - timedelta(days=1)).isoformat()
    today_str = now.strftime("%Y-%m-%d")
    
    logger.info(f"--- Memulai Proses Harian: {today_str} ---")

    # 1. Jalankan Scraper
    count = await scrape_news("Pemilu 2029")
    logger.info(f"Berhasil mengoleksi {count} berita baru.")

    # 2. Ambil data dari Supabase (Hasil scraping 24 jam terakhir)
    response = supabase.table("scraped_data") \
        .select("title, url") \
        .gte("created_at", yesterday) \
        .execute()
    
    articles = response.data

    if not articles:
        logger.info("Tidak ada berita baru dalam 24 jam terakhir.")
        return

    # 3. Format Daftar Berita untuk Email & Database
    # Format: 1. Judul ( link )
    report_list = ""
    for i, art in enumerate(articles, 1):
        report_list += f"{i}. {art['title']} ( {art['url']} )\n"

    # 4. Simpan ke Tabel daily_reports
    try:
        supabase.table("daily_reports").insert({
            "total_data": len(articles),
            "summary": report_list,
            "report_date": today_str
        }).execute()
        logger.info("Laporan harian berhasil disimpan ke database.")
    except Exception as e:
        logger.error(f"Gagal menyimpan laporan ke db: {e}")

    # 5. Kirim Email Notifikasi
    user_res = supabase.table("users").select("email").eq("is_active", True).execute()
    recipient_emails = [u['email'] for u in user_res.data]

    if recipient_emails:
        email_body = f"Berita terbaru tentang Pemilu 2029 ({today_str}):\n\n{report_list}"
        try:
            resend.Emails.send({
                "from": "onboarding@resend.dev",
                "to": recipient_emails,
                "subject": f"📩 Laporan Berita Pemilu 2029 - {today_str}",
                "text": email_body
            })
            logger.info(f"Email berhasil dikirim ke: {recipient_emails}")
        except Exception as e:
            logger.error(f"Gagal mengirim email: {e}")

def start_job():
    asyncio.run(run_daily_workflow())

if __name__ == "__main__":
    scheduler = BlockingScheduler()
    
    # Sesuai rencana awal: Jam 1 Malam
    scheduler.add_job(start_job, 'cron', hour=1, minute=0)
    
    logger.info("Robot Scheduler aktif. Menunggu jadwal jam 01:00 AM...")
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Scheduler dimatikan.")