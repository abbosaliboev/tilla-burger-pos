# 🍔 Tilla Burger — POS Kassa Tizimi

Web-based kassa (POS) tizimi. Touch/klik orqali ishlatiladi.

## Xususiyatlar

- 7 ta kategoriya: Pizza, Lavash, Hot Dog, Burger, Chicken, Fries, Drinks
- Buyurtmani savatchaga qo'shish, miqdorni o'zgartirish
- 3 xil to'lov usuli: Naqd, Karta, Hisob (Transfer)
- Kunlik hisobot: jami tushum, to'lov usullari, top taomlar
- Barcha buyurtmalar brauzer xotirasida saqlanadi (localStorage)

## Ishga tushirish

```bash
npm install
npm run dev
```

Brauzerda: http://localhost:3000

## Railway deploy

1. GitHub repozitoriyasiga push qiling
2. Railway.app da yangi loyiha yarating
3. GitHub reponi ulang
4. Railway avtomatik deploy qiladi

## Narxlarni o'zgartirish

[lib/menu.ts](lib/menu.ts) faylida `price` qiymatlarini tahrirlang.
