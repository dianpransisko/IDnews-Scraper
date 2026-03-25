from app.db.supabase_client import supabase

try:
    # Mencoba mengambil data (walaupun tabel kosong)
    res = supabase.table("scraped_data").select("id").limit(1).execute()
    print("✅ MANTAP! Koneksi ke Supabase Berhasil.")
except Exception as e:
    print(f"❌ Masih Error: {e}")