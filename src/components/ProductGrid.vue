<template>
  <section class="lattest-product-area pb-40 category-list">
    <!-- Filter Bar -->
    <div class="filter-bar mb-4 d-flex align-items-center gap-3">
      <!-- ✅ 寫死分類 -->
      <select v-model="selectedCategory" class="form-control w-auto">
        <option value="">全部分類</option>
        <option value="Candles">Candles</option>
        <option value="Diffusers">Diffusers</option>
        <option value="Room Spray">Room Spray</option>
        <option value="Body Care">Body Care</option>
        <option value="Perfumes">Perfumes</option>
        <option value="Kids">Kids</option>
      </select>

      <!-- 🔍 商品名稱搜尋 -->
      <input
        v-model="searchQuery"
        type="text"
        class="form-control"
        placeholder="輸入商品名稱"
      />
    </div>

    <!-- 商品卡片 -->
    <div class="row justify-content-center">
      <div
        class="col-md-6 col-lg-4"
        v-for="product in paginatedProducts"
        :key="product.product_id"
      >
        <div class="card text-center card-product">
          <router-link
            :to="`/product/${product.product_id}`"
            class="card text-center card-product"
          >
            <div class="card-product__img">
              <img class="card-img" :src="product.image" :alt="product.name" />
            </div>
            <div class="card-body">
              <p>{{ product.category }}</p>
              <h4 class="card-product__title">{{ product.name }}</h4>
              <p class="card-product__price">${{ product.price }}</p>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- 分頁按鈕 -->
    <div class="pagination mt-4 d-flex justify-content-center">
      <button
        v-for="page in totalPages"
        :key="page"
        class="btn btn-outline-dark mx-1"
        :class="{ active: currentPage === page }"
        @click="currentPage = page"
      >
        {{ page }}
      </button>
    </div>
    <!-- <div class="row">
      <div class="col-md-6 col-lg-4" v-for="product in products" :key="product.id">
        <div class="card text-center card-product">
          <div class="card-product__img">
            <img v-if="product" class="card-img" :src="product.image" :alt="product.title">
          </div>
          <div class="card-body">
            <p>{{ product.category }}</p>
            <h4 class="card-product__title">
              <router-link :to="`/product/${product.product_id}`">{{ product.name }}</router-link>
            </h4>
            <p class="card-product__price">${{ product.price }}</p>
          </div>
        </div>
      </div>
    </div> -->
  </section>
</template>

<script>
export default {
  name: "ProductGrid",
  data() {
    return {
      products: [],
      selectedCategory: "",
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 9,
    };
  },

  // ✅ 新增獲取商品資料的函數，負責構建帶參數的 URL
  methods: {
    async fetchProducts() {
      // 確保後端伺服器已啟動並運行
      const API_URL = "http://localhost:5000";

      // 1. 構建 API URL 和查詢參數
      let url = `${API_URL}/api/products`;
      const params = [];

      // 加入關鍵字參數 (searchQuery)
      if (this.searchQuery) {
        params.push(`keyword=${this.searchQuery}`);
      }
      // 加入分類參數 (selectedCategory)
      if (this.selectedCategory) {
        // 注意：如果您的分類下拉選單中 '全部分類' 的 value 是空字串 ''，
        // 這裡的邏輯可以不用判斷 category !== 'all'
        params.push(`category=${this.selectedCategory}`);
      }

      // 將所有參數組合成查詢字串
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      // 為了方便測試，您可以檢查發出的 URL：
      // console.log("發出請求的 URL:", url);

      try {
        // 發送請求給後端，後端會根據 keyword 和 category 進行 MongoDB 查詢
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        this.products = data;

        // 數據載入後，頁碼重置為 1
        this.currentPage = 1;
      } catch (error) {
        console.error("無法載入商品資料:", error);
      }
    },
  },

  computed: {
    // Step 1: 移除前端篩選邏輯，因為數據已由後端篩選
    filteredProducts() {
      return this.products;
    },

    // Step 2: 計算總頁數 (保持不變)
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    },

    // Step 3: 擷取目前頁面該顯示的商品 (保持不變)
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredProducts.slice(start, start + this.itemsPerPage);
    },
  },

  watch: {
    // 監聽分類選擇的變化，當它改變時，呼叫 fetchProducts 重新載入數據
    selectedCategory() {
      this.fetchProducts();
    },
    // 監聽搜尋關鍵字的變化，當它改變時，呼叫 fetchProducts 重新載入數據
    searchQuery() {
      this.fetchProducts();
    },
  },

  // 首次載入頁面時，呼叫 fetchProducts 獲取初始商品列表
  mounted() {
    this.fetchProducts();
  },
};
</script>

<style scoped>
@media (max-width: 576px) {
  .card-product {
    margin-bottom: 10px;
  }
}
.card-product__img {
  width: 100%;
  height: 300px; /* 固定高度，可依需求調整 */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background-color: #f5f5f5; /* 預設背景，避免空白 */
}

.card-product__img img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 圖片保持比例並填滿容器 */
}
.card-product__title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 3em; /* 預留高度，避免 1 行時太矮 */
}
</style>
