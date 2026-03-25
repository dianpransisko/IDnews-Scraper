import httpx
from app.db.supabase_client import supabase
from app.config import settings

async def scrape_news(query: str = "Pemilu 2029"):
    url = f"https://gnews.io/api/v4/search?q={query}&lang=id&token={settings.GNEWS_API_KEY}"
    
    try:
        async with httpx.AsyncClient() as client:
            # 1. Ambil data dari GNews
            response = await client.get(url)
            response.raise_for_status() 
            articles = response.json().get("articles", [])
            
            if not articles:
                print("Tidak ada artikel ditemukan.")
                return 0

            # 2. Simpan ke Supabase
            for art in articles:
                data = {
                    "title": art["title"],
                    "content": art["description"],
                    "source": art["source"]["name"],
                    "url": art["url"]
                }
                # Error biasanya terjadi di baris .execute() di bawah ini
                supabase.table("scraped_data").upsert(data, on_conflict="url").execute()
            
            return len(articles)

    except httpx.ConnectError:
        print("❌ Gagal terhubung ke internet atau DNS Error.")
        return 0
    except Exception as e:
        print(f"❌ Terjadi error: {e}")
        return 0