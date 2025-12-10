<template>
  <div>
    <a class="navbar-brand logo_h"><router-link to="/"><img src="/aroma/img/logo.png" alt=""></router-link></a>
    <button class="btn btn-danger mb-3" @click="handleLogout">登出</button>
    <h4>會員資料</h4>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>ID</th>
          <th>姓名</th>
          <th>Email</th>
          <th>註冊時間</th>
          <!-- <th>頭像</th> -->
        </tr>
      </thead>
      <tbody>
        <tr v-if="token && user">
          <td>{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.registered }}</td>
          <!-- <td><img src="aroma/img/r1.jpg" alt="avatar" style="height: 50px;"></td> -->
        </tr>
        <tr v-else>
          <td colspan="5">尚未登入</td>
        </tr>
      </tbody>
    </table>
  </div>
  <h4>購買紀錄</h4>
  <table class="table table-bordered" v-if="orders.length">
    <thead>
      <tr>
        <th>訂單編號</th>
        <th>金額</th>
        <th>狀態</th>
        <th>日期</th>
        <th>商品明細</th>
         <!-- anchor:thead-action 新增操作欄 -->
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="order in orders" :key="order.order_id">
        <td>{{ order.order_id }}</td>
        <td>${{ order.amount }}</td>
        <td>{{ order.status }}</td>
        <td>{{ new Date(order.created_at).toLocaleString() }}</td>
        <td>
          <ul>
            <li v-for="item in order.items" :key="item.product_id">
              {{ item.product_id }} × {{ item.quantity }}（單價: ${{ item.price }}）
            </li>
          </ul>
        </td>
        <!-- anchor:tbody-action 新增付款按鈕 -->
        <td>
          <button
            v-if="order.status === '未付款'"      
            class="btn btn-success btn-sm"
            :disabled="payingOrderId === order.order_id"
            @click="handlePay(order)"
          >
            {{ payingOrderId === order.order_id ? '前往付款中…' : '前往付款' }}
          </button>
          <span v-else>—</span>
        </td>
      </tr>
    </tbody>
  </table>
  <p v-else>尚無購買紀錄</p>
</template>


<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
// anchor:import-axios
import axios from 'axios'
const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()
const orders = ref([])
// anchor:paying-order-id
const payingOrderId = ref(null) // 追蹤哪一筆正在付款

const handleLogout = () => {
  auth.logout()
  cart.clearCart()
  router.push('/')
}

const user = computed(() => auth.user)
const token = computed(() => auth.token)
const API_URL = process.env.VUE_APP_API
onMounted(async () => {
  if (auth.user?.id) {
    const res = await fetch(`${API_URL}/api/orders/${auth.user.id}`)
    orders.value = await res.json()
  }
  })
  // anchor:handle-pay-method
async function handlePay(order) {
  try {
    if (!auth.user?.id) {
      alert('❌ 尚未登入，請先登入')
      return
    }
    if (order.status !== '未付款') { 
      alert('此訂單非未付款狀態')
      return
    }

    payingOrderId.value = order.order_id

    const ecpayRes = await axios.post(
      `${API_URL}/api/ecpay-pay`,
      {
        orderNo: order.order_id,
        amount: order.amount,
        desc: `訂單 ${order.order_id} 補款`,
        itemName: `訂單 ${order.order_id}`
      },
      {
        headers: token.value ? { Authorization: `Bearer ${token.value}` } : {}
      }
    )

    const formDiv = document.createElement('div')
    formDiv.style.position = 'fixed'
    formDiv.style.left = '-9999px'
    formDiv.innerHTML = ecpayRes.data
    document.body.appendChild(formDiv)

    const form = formDiv.querySelector('form')
    if (!form) throw new Error('付款表單產生失敗')
    form.submit()
  } catch (err) {
    console.error(err)
    alert('❌ 付款啟動失敗，請稍後再試')
  } finally {
    payingOrderId.value = null
  }
}

</script>
