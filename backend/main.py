from fastapi import FastAPI  # INI YANG KURANG
from fastapi.middleware.cors import CORSMiddleware
from app.db.supabase_client import supabase
from app.scraper.news_collector import scrape_news

# Inisialisasi aplikasi
app = FastAPI()

# Konfigurasi CORS agar React bisa akses
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "Backend Aktif!"}

@app.get("/news")
async def get_news():
    try:
        response = supabase.table("scraped_data").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        return {"error": str(e)}

@app.post("/run-scrape")
async def trigger_scrape():
    count = await scrape_news()
    return {"message": f"Berhasil mengoleksi {count} berita."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)