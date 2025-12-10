<template>
   
  <div>
            <Header :cartCount="cart.items.length" />

           
    <div class="container mt-5">
           
      <h2>📝 結帳表單</h2>

           
      <form @submit.prevent="submitOrder">
               
        <div class="form-group">
                    <label>姓名</label>          
          <input
            v-model="form.name"
            type="text"
            class="form-control"
            required
          />
                 
        </div>
               
        <div class="form-group">
                    <label>地址</label>          
          <input
            v-model="form.address"
            type="text"
            class="form-control"
            required
          />
                 
        </div>
               
        <div class="form-group">
                    <label>電話</label>          
          <input
            v-model="form.phone"
            type="text"
            class="form-control"
            required
          />
                 
        </div>
               
        <div class="form-group">
                    <label>備註</label>          
          <textarea v-model="form.note" class="form-control"></textarea>        
        </div>

               
        <button class="btn btn-success mt-3" type="submit">送出訂單</button>    
         
      </form>
         
    </div>
     
  </div>
</template>

<script setup>
import Header from "@/components/Header.vue";
import { reactive } from "vue";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router"; // 🎯 新增：引入 Vue Router
import axios from "axios";

const API_URL = "http://localhost:5000";
const cart = useCartStore();
const auth = useAuthStore();
const router = useRouter(); // 🎯 新增：實例化 Router

const form = reactive({
  name: "",
  address: "",
  phone: "",
  note: "",
});

async function submitOrder() {
  try {
    if (!auth.user?.id) {
      alert("❌ 尚未登入，請先登入");
      return;
    } // 1. 建立訂單資料

    const payload = {
      user_id: auth.user.id,
      ...form,
      items: cart.items.map((item) => ({
        product_id: String(item.id), // 確保 product_id 轉為字串
        quantity: item.quantity,
      })),
    }; // 🎯 修正點：在發送前檢查購物車是否為空 (後端雖然會擋，但前端先檢查用戶體驗更好)

    if (payload.items.length === 0) {
      alert("❌ 您的購物車是空的，無法送出訂單。");
      return;
    }

    const orderRes = await axios.post(`${API_URL}/api/orders`, payload);
    const order = orderRes.data;
    console.log("訂單資料:", order); // 2. 處理訂單成功（後端回傳 CASH_SUCCESS）

    if (order.payment_mode === "CASH_SUCCESS") {
      alert("✅ 訂單已成功送出！將以現金模式結帳。"); // 3. 清空購物車

      cart.clearCart(); // 4. 導向首頁或訂單查詢頁

      router.push("/"); // 🎯 使用實例化的 router 進行導航
      return;
    }

    // 如果後端返回成功但 mode 不對，也給予提示
    alert("✅ 訂單已送出，但支付模式不符預期。");
    cart.clearCart();
    router.push("/");
  } catch (err) {
    // 🎯 修正：這是乾淨且完整的 catch 區塊
    if (
      err?.response?.status === 400 &&
      err?.response?.data?.error === "庫存不足"
    ) {
      alert("❌ 庫存不足，請調整數量後再嘗試");
      return;
    } else if (err?.response?.status === 400) {
      // 處理缺少資訊或購物車為空的錯誤
      const errorMsg = err.response.data.error || "數據驗證失敗";
      alert(`❌ 訂單送出失敗：${errorMsg}`);
      return;
    }

    alert("❌ 訂單送出失敗，請檢查網路或稍後再試。");
    console.error(err);
  }
}
</script>
