import resend
from app.config import settings

# Masukkan API Key kamu langsung untuk tes
resend.api_key = "re_bkbA8c7a_HhYV7eFnDPoWfC2peYkC2eQR"

def test_kirim():
    print("Sedang mencoba kirim email...")
    try:
        r = resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": "dianpransisko@gmail.com", # Email kamu sendiri
            "subject": "🚀 TEST BERHASIL!",
            "html": "<strong>Halo Dian!</strong> <p>Jika kamu baca ini, berarti API Resend di Python sudah jalan.</p>"
        })
        print("✅ Email terkirim! Cek kotak masuk atau folder SPAM.")
        print(f"Response ID: {r['id']}")
    except Exception as e:
        print(f"❌ Masih gagal karena: {e}")

if __name__ == "__main__":
    test_kirim()