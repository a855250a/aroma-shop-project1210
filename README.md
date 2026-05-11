# Aroma Shop — 香氛電商網站

一個香氛商品電商平台，支援會員登入、購物車管理、線上結帳與後台管理系統，前後端分離架構。

---

## 功能

- **首頁商品展示**：卡片式商品列表，支援彈出式購物車預覽
- **購物車**：新增、調整數量、移除商品，總金額即時計算，使用 Pinia 持久化儲存
- **結帳下單**：填寫收件資訊送出訂單，串接 Node.js 後端 API 寫入 MongoDB
- **會員系統**：註冊、登入（JWT 驗證）、忘記密碼
- **後台管理**：會員與訂單查詢、商品庫存查詢（需管理員身份登入）

## 技術棧

| 項目 | 說明 |
|------|------|
| Vue 3 | 前端框架，使用 Composition API (`<script setup>`) |
| Vue Router 4 | 前端路由管理 |
| Pinia | 全域狀態管理（購物車），搭配 persistedstate 持久化 |
| Axios | API 請求 |
| Node.js + Express | 後端伺服器，處理訂單 API |
| MongoDB | 雲端資料庫，儲存訂單資料 |

## 頁面路由

```
/                        首頁（商品列表）
/login                   會員登入
/register                會員註冊
/cart                    購物車
/checkout                結帳
/member/reset-password   重設密碼
/manager                 後台管理（限管理員）
```

## 專案結構

```
aroma-shop-project1210/
├── src/
│   ├── views/               # 頁面元件
│   │   ├── Home.vue
│   │   ├── Cart.vue
│   │   ├── Checkout.vue
│   │   ├── LoginPage.vue
│   │   ├── RegisterPage.vue
│   │   └── ManagerPage.vue
│   ├── components/          # 共用元件
│   │   ├── LoginForm.vue
│   │   ├── RegisterForm.vue
│   │   └── MemberOrdersTable.vue
│   └── stores/              # Pinia 狀態管理
│       └── cart.js
└── checkout-server/         # 後端 API（訂單）
    └── index.js
```

## 本機執行

```bash
# 安裝套件
npm install

# 啟動開發伺服器
npm run serve

# 建置正式版本
npm run build
```

後端（checkout-server）：
```bash
cd checkout-server
npm install
node index.js
```
