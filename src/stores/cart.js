// src/stores/cart.js
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
// const API_URL = process.env.VUE_APP_API // ❌ 保持註解或移除

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] // 購物車內的商品資料：每筆 { id, name, price, quantity }
  }),
  actions: {
    
   
    // 清空購物車
    async clearCart() {
    const auth = useAuthStore()
    this.items = []
    if (auth.user?.id) {
      await fetch('/api/cart/clear', { // ⭐️ 修正：直接使用相對路徑
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: auth.user.id })
      })
    }},

    // 加入商品
    async addItem(product) {
      const existing = this.items.find(p => p.id === product.id)
      const newQty = existing ? existing.quantity + 1 : 1
  // 1️⃣ 先查庫存
  const res = await fetch(`/api/products/${product.id}`) // ⭐️ 修正：直接使用相對路徑
  const data = await res.json()
  if (!res.ok || !data) {
    alert('查詢庫存失敗')
    return
  }
  if (newQty > data.stock) {
    alert(`庫存不足，最多可購買 ${data.stock} 件`)
    return
  }
  // 2️⃣ 庫存足夠 → 更新購物車
  if (existing) {
    existing.quantity = newQty
  } else {
    this.items.push({ ...product, quantity: newQty })
  }
  console.log('目前購物車：', JSON.stringify(this.items))
  // 3️⃣ 同步後端

      const auth = useAuthStore()
      if (auth.user?.id) {
        await fetch('/api/cart', { // ⭐️ 修正：直接使用相對路徑
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: auth.user.id,
            product_id: product.id,
            quantity: newQty // ✅ 設為加完後的數量
          })
        })
      }
    },

  // 個別商品加入
async individualaddItem({ id, name, price, image, addQty, stock }) {
  if (!addQty || addQty <= 0) {
    alert('請輸入有效數量'); return
  }

  const existing = this.items.find(p => p.id === id)
  const currentQty = existing ? existing.quantity : 0
  const requestedTotal = currentQty + addQty

  // 先檢查庫存
  if (typeof stock === 'number' && requestedTotal > stock) {
    const canAdd = Math.max(stock - currentQty, 0)
    alert(canAdd > 0
      ? `庫存不足，最多只能再加 ${canAdd} 件（庫存共 ${stock}）`
      : `庫存不足，已達上限（庫存共 ${stock}）`)
    return
  }



  // 樂觀更新
  if (existing) existing.quantity += addQty
  else this.items.push({ id, name, price, image, quantity: requestedTotal })



  // 同步後端（建議用 /api/cart/add 的「增加量」語意）
  const auth = useAuthStore()
  if (auth.user?.id) {
    const res = await fetch('/api/cart/add', { // ⭐️ 修正：直接使用相對路徑
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: auth.user.id,      // 數字
        product_id: id,             // 字串（你的 schema）
        add_quantity: addQty
      })
    })
    // 檢查回應是否成功
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      // 回滾
      if (existing) existing.quantity -= addQty
      else this.items = this.items.filter(p => p.id !== id)
      if (data.error === 'INSUFFICIENT_STOCK') {
        alert(`庫存不足，最多可再加 ${data.availableToAdd} 件（目前購物車已有 ${data.currentInCart} 件，庫存共 ${data.stock}）`)
      } else {
        alert(data.error || '加入購物車失敗')
      }
    }
  }
},


// 更新商品數量
  async updateQuantity(id, quantity) {
    const item = this.items.find(p => p.id === id)
    if (item) item.quantity = quantity

    const auth = useAuthStore()
    if (auth.user?.id) {
      await fetch('/api/cart', { // ⭐️ 修正：直接使用相對路徑
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: auth.user.id,
          product_id: id,
          quantity
        })
      })
    }
  },
 // 移除商品
  async removeItem(id) {
    this.items = this.items.filter(p => p.id !== id)

    const auth = useAuthStore()
    if (auth.user?.id) {
      await fetch('/api/cart', { // ⭐️ 修正：直接使用相對路徑
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: auth.user.id,
          product_id: id,
          quantity: 0
        })
      })
    }},

  // 從伺服器載入購物車資料
  async loadFromServer(user_id) {
    try {
      const res = await fetch(`/api/cart?user_id=${user_id}`) // ⭐️ 修正：直接使用相對路徑
      const cartData = await res.json()

    const productRes = await fetch('/api/products') // ⭐️ 修正：直接使用相對路徑
    const products = await productRes.json()

    this.items = Array.isArray(cartData.items)
      ? cartData.items.map(i => {
          const product = products.find(p => p.product_id === i.product_id)
          return {
            id: i.product_id,
            name: product?.name || '',
            price: product?.price || 0,
            image: product?.image || '',
            quantity: i.quantity
          }
        })
      : []
    } catch (err) {
      console.error('❌ 載入購物車失敗', err)
      this.items = []
    }
  }},

  getters: {
    // 計算總金額
    totalPrice: (state) =>
      state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),

    totalQuantity: (state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  },
  persist: true // ✅ 設定在這裡
})