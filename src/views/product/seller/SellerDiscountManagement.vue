<template>
  <SellerSidebar />
  <v-container fluid>
    <h3 style="padding: 10px; padding-left: 70px;">할인 관리</h3><br><br>

    <v-row class="align-center" style="padding-left: 70px; margin-top: -45px;">
      <v-col>
        <h4>등록된 할인 목록</h4>
      </v-col>
      <v-col class="text-right">
        <v-btn @click="openDiscountCreateModal" class="create-btn" style="border-radius: 50px; right: 200px;">
          할인 생성
        </v-btn>
      </v-col>
    </v-row>

    <v-col style="position: relative;"></v-col>
    <v-card class="product-card elevation-0" outlined>
      <v-table class="table-header">
        <thead>
          <tr>
            <th class="table-header">상품명</th>
            <th class="table-header">정가</th>
            <th class="table-header">할인가</th>
            <th class="table-header">시작 날짜</th>
            <th class="table-header">종료 날짜</th>
            <th class="table-header">활성화 상태</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(discount) in paginatedDiscounts" :key="discount.id">
            <td>{{ truncateProductName(discount.productName) }}</td>
            <td>{{ discount.productPrice }}원</td>
            <td>{{ discount.discountPrice }}원</td>
            <td>{{ formatDateTime(discount.startAt) }}</td>
            <td>{{ formatDateTime(discount.endAt) }}</td>
            <td>{{ discount.discountActive ? "활성화" : "비활성화" }}</td>
          </tr>
        </tbody>
      </v-table>

      <!-- 페이징 처리 -->
      <v-pagination v-model="currentPage" :length="pageCount"></v-pagination>
    </v-card>

    <!-- 할인 생성 모달 컴포넌트 -->
    <SellerDiscountCreate :dialog="showDiscountCreateModal"
      @update:model-value="value => showDiscountCreateModal = value" @created="getDiscountList" />


  </v-container>
</template>

<script>
import axios from 'axios';
import SellerSidebar from '@/components/sidebar/SellerSidebar.vue';
import SellerDiscountCreate from './SellerDiscountCreate.vue'; // 올바른 경로로 수정

export default {
  components: {
    SellerSidebar,
    SellerDiscountCreate,
  },
  data() {
    return {
      discountList: [],
      currentPage: 1,
      itemsPerPage: 10,
      showDiscountCreateModal: false, // 모달 열림 여부 상태
    };
  },
  computed: {
    paginatedDiscounts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.discountList.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.discountList.length / this.itemsPerPage);
    },
  },
  mounted() {
    this.getDiscountList();
  },
  methods: {
    async getDiscountList() {
      try {
        const farmId = localStorage.getItem('farmId'); // localStorage에서 farmId 가져오기
        if (!farmId) {
          console.error('farmId가 localStorage에 없습니다.');
          return;
        }

        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/product-service/product/discount/list`, {
          headers: {
            sellerId: localStorage.getItem("sellerId")
          },
          params: {
            farmId: farmId, // farmId 전달
          }
        });
        this.discountList = response.data.content;
      } catch (error) {
        console.error('Error fetching discount list:', error);
      }
    },
    openDiscountCreateModal() {
      this.showDiscountCreateModal = true;
    },
    formatDateTime(dateString) {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: '2-digit', day: '2-digit'};
      return date.toLocaleString(undefined, options);
    },
    truncateProductName(productName) {
      if (productName.length > 10) {
        return productName.substring(0, 10) + '...';
      }
      return productName;
    },
  },
};
</script>

<style scoped>
.product-card {
  overflow-x: hidden;
  margin-top: 20px;
  width: 77%;
  margin: 0 auto;
  height: auto;
  border: 1px solid #d4d4d4;
  border-radius: 10px;
  padding: 20px;
  margin-right: 17%;
}

.table-header {
  text-align: center !important;
  font-size: 14px;
  background-color: none;
  border-bottom: 1px solid #d4d4d4;
}

.create-btn {
  background-color: #bcc07b;
  color: black;
}

.v-pagination {
  margin-top: 20px;
  justify-content: center;
}
</style>
