# Sitenize Yeni Yazı/Blog Ekleme Rehberi

Sitenizdeki "Düşünceler" (Thoughts) kısmına yeni yazı eklemek için aşağıdaki adımları takip edebilirsiniz:

## 1. Veri Dosyasını Açın
Düzenlemeniz gereken dosya: `src/data/thoughts.json`

## 2. Yeni Bir Kayıt Ekleyin
Dosyanın en üstüne (en güncel yazı en başta görünsün isterseniz) aşağıdaki formatta yeni bir nesne ekleyin:

```json
[
    {
        "id": "3",
        "date": "2026-02-19",
        "title": "Yeni Yazı Başlığı",
        "content": "Buraya yazınızın detaylarını girebilirsiniz. Kuantum teknolojileri, piyasa analizleri veya kişisel notlarınız...",
        "category": "Tech / Market / Personal"
    },
    ... mevcut yazılar
]
```

## 3. Alan Açıklamaları
- **id**: Her yazı için benzersiz bir numara verin.
- **date**: Yazının yayınlanma tarihi (YYYY-AA-GG).
- **title**: Yazının başlığı.
- **content**: Yazının içeriği.
- **category**: Yazının kategorisi (Security, Research, Market vb.).

## 4. Kaydedin ve Yayınlayın
Dosyayı kaydettiğinizde, projeniz geliştirme modundaysa (`npm run dev`) değişiklikler anında sitenizde görünecektir.
