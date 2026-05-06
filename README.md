# 🍔 Tilla Burger POS

> **Live demo:** [tilla-burger-pos-production.up.railway.app](https://tilla-burger-pos-production.up.railway.app)

A web-based Point of Sale (POS) system built for Tilla Burger café. Runs in any browser — no special hardware needed. Designed for touchscreen monitors, works with just clicks.

---

## 🌐 Languages / Tillar / Языки

- [English](#english)
- [O'zbek](#ozbek)
- [Русский](#русский)

---

## English

### What is this?

Tilla Burger POS is a lightweight, browser-based cash register system. It replaces a physical POS terminal — staff can take orders, track multiple tables, and process payments directly from any screen without a mouse.

### What can it do?

| Feature | Description |
|---|---|
| 📋 Full menu | 7 categories: Pizza, Lavash, Hot Dog, Burger, Chicken, Fries & Set, Drinks |
| 🛍️ Takeout | Default mode — quick orders for customers taking food to go |
| 🪑 Dine-in tables | 5 simultaneous open tables, each with its own independent order |
| ➕ Cart management | Add items with one tap, adjust quantity with +/− buttons |
| 💳 3 payment methods | Cash, Card, Bank transfer |
| 📊 Daily reports | Revenue by day, breakdown by payment method, top-selling items |
| 📱 Touch-friendly | Large buttons, no mouse required — works on any touchscreen monitor |
| 💾 No database needed | Orders stored in browser localStorage — works offline |

### Who uses it?

- **Cashiers / waiters** — take orders and process payments at the counter
- **Café owners** — check daily revenue and sales reports

### Tech stack

- [Next.js 15](https://nextjs.org) (App Router)
- [Tailwind CSS](https://tailwindcss.com)
- TypeScript
- localStorage (client-side order storage)
- Deployed on [Railway](https://railway.app)

### Run locally

```bash
git clone https://github.com/abbosaliboev/tilla-burger-pos.git
cd tilla-burger-pos
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Update menu prices

Edit the `price` values in [`lib/menu.ts`](lib/menu.ts). Currency is KRW (₩).

### Deploy to Railway

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Select this repo — Railway builds and deploys automatically

---

## O'zbek

### Bu nima?

Tilla Burger POS — brauzer orqali ishlaydigan kassa tizimi. Maxsus qurilma kerak emas — istalgan ekranda, sensorli monitor yoki oddiy kompyuterda ishlaydi. Sichqoncha ham shart emas.

### Nima qila oladi?

| Xususiyat | Tavsif |
|---|---|
| 📋 To'liq menyu | 7 kategoriya: Pizza, Lavash, Hot Dog, Burger, Tovuq, Fries & Set, Ichimliklar |
| 🛍️ Takeout | Default rejim — tez buyurtma, olib ketuvchilar uchun |
| 🪑 Stol tizimi | 5 ta stol bir vaqtda ochiq, har biri mustaqil buyurtma saqlaydi |
| ➕ Savat | Bir marta bosib qo'shish, +/− bilan miqdorni o'zgartirish |
| 💳 3 xil to'lov | Naqd, Karta, Bank o'tkazmasi |
| 📊 Kunlik hisobot | Kun bo'yicha tushum, to'lov usullari, ko'p sotilgan taomlar |
| 📱 Sensorli ekran | Katta tugmalar, sichqonchasiz ishlaydi |
| 💾 Ma'lumotlar bazasi kerak emas | Buyurtmalar brauzer xotirasida saqlanadi, oflayn ishlaydi |

### Kim ishlatadi?

- **Kassirlar / ofitsiantlar** — buyurtma qabul qilish va to'lovni rasmiylashtirish
- **Café egasi** — kunlik tushum va sotuv hisobotini ko'rish

### Mahalliy ishga tushirish

```bash
git clone https://github.com/abbosaliboev/tilla-burger-pos.git
cd tilla-burger-pos
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) da ochiladi.

### Narxlarni o'zgartirish

[`lib/menu.ts`](lib/menu.ts) faylida `price` qiymatlarini tahrirlang. Valyuta: KRW (₩).

---

## Русский

### Что это такое?

Tilla Burger POS — это кассовая система на основе браузера. Не требует специального оборудования — работает на любом экране, включая сенсорный монитор. Мышь не нужна.

### Что умеет система?

| Функция | Описание |
|---|---|
| 📋 Полное меню | 7 категорий: Пицца, Лаваш, Хот-дог, Бургер, Курица, Фри & Сет, Напитки |
| 🛍️ Takeout | Режим по умолчанию — быстрый заказ для тех, кто берёт с собой |
| 🪑 Столики | 5 столиков одновременно, каждый со своим независимым заказом |
| ➕ Корзина | Добавление одним нажатием, изменение количества кнопками +/− |
| 💳 3 способа оплаты | Наличные, Карта, Банковский перевод |
| 📊 Ежедневные отчёты | Выручка по дням, разбивка по способам оплаты, топ блюд |
| 📱 Сенсорный экран | Крупные кнопки, без мыши — работает на любом тачскрине |
| 💾 Без базы данных | Заказы хранятся в localStorage браузера, работает офлайн |

### Кто пользуется?

- **Кассиры / официанты** — принимают заказы и проводят оплату
- **Владелец кафе** — просматривает ежедневную выручку и отчёты по продажам

### Запуск локально

```bash
git clone https://github.com/abbosaliboev/tilla-burger-pos.git
cd tilla-burger-pos
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

### Изменить цены

Отредактируйте значения `price` в файле [`lib/menu.ts`](lib/menu.ts). Валюта: KRW (₩).

---

## License

MIT
