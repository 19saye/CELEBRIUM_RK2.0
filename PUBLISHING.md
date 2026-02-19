# Rehber: İçerik Yayınlama ve AI Eğitimi

Bu rehber, sitenizin blog kısmını nasıl güncelleyeceğiniz ve Dijital İkiz (AI) asistanınızı nasıl "eğiteceğiniz" hakkında bilgi verir.

## 1. Dijital İkiz (AI) Eğitimi
Yapay zeka asistanınız, bilgilerini `src/data/digital-twin-knowledge.json` dosyasından alır. Onu eğitmek için bu dosyayı düzenlemeniz yeterlidir:

- **Kimlik Bilgileri**: `identity` kısmından biyografinizi ve iletişim bilgilerinizi güncelleyin.
- **Teknik Bilgiler**: `technical_core` kısmına yeni uzmanlık alanlarınızı veya projelerinizi ekleyin.
- **Konuşma Kuralları**: `interaction_logic.rules` kısmına asistanın nasıl davranması gerektiğine dair yeni kurallar ekleyin.
- **Soru-Cevap (QA)**: `qa_map` kısmına sıkça sorulan soruları ve yanıtlarınızı ekleyerek asistanı daha spesifik konularda bilgilendirin.

## 2. Blog ve Düşünceler Paylaşma
Düşüncelerinizi paylaşmak ve sitede yayımlamak için `src/data/thoughts.json` dosyasını kullanın.

Her yeni düşünce için şu formatta bir blok ekleyin:
```json
{
    "id": 4,
    "title": "Yeni Başlık",
    "content": "Buraya düşüncelerinizi yazın...",
    "date": "2026-02-18",
    "category": "Research"
}
```
Dosyayı kaydettiğinizde, sitenizin `/thoughts` sayfası otomatik olarak güncellenecektir.

## 3. Siteyi Canlıya Taşıma (Deployment)
Sitenizi Vercel veya Netlify gibi platformlarda tek tıkla yayımlayabilirsiniz:
1. Kodunuzu GitHub'a yükleyin.
2. Vercel'e bağlanın ve projeyi seçin.
3. **Environment Variables** kısmına `GOOGLE_GEMINI_API_KEY` anahtarınızı ekleyin.

Siteniz artık profesyonel bir şekilde yayında olacaktır.
