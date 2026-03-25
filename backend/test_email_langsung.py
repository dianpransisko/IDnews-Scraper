import resend
from app.config import settings

# Masukkan API Key kamu langsung untuk tes
resend.api_key = "******************"

def test_kirim():
    print("Sedang mencoba kirim email...")
    try:
        r = resend.Emails.send({
            "from": "***************",
            "to": "***********************", # Email kamu sendiri
            "subject": "🚀 TEST BERHASIL!",
            "html": "<strong>Halo Dian!</strong> <p>Jika kamu baca ini, berarti API Resend di Python sudah jalan.</p>"
        })
        print("✅ Email terkirim! Cek kotak masuk atau folder SPAM.")
        print(f"Response ID: {r['id']}")
    except Exception as e:
        print(f"❌ Masih gagal karena: {e}")

if __name__ == "__main__":
    test_kirim()
