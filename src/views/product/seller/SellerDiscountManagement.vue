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
          <tr v-for="(discount) in paginatedDiscounts" :key="discount.id" @click="openActionModal(discount)">
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

    <!-- 할인 수정 모달 컴포넌트 -->
    <SellerDiscountUpdate :dialog="showDiscountUpdateModal"
      :discount="selectedDiscount"
      @update:model-value="value => showDiscountUpdateModal = value"
      @updated="getDiscountList" />

    <!-- 할인 삭제 확인 모달 -->
    <v-dialog v-model="showDeleteConfirmModal" max-width="340px">
      <v-card class="deleteModalCard" style="padding: 7px; text-align: center;">
        <v-card-text>
          정말 이 할인을 삭제하시겠습니까?
        </v-card-text>
        <v-card-actions style="justify-content: center;">
          <v-btn @click="confirmDeleteDiscount" class="submit-btn">삭제</v-btn>
          <v-btn @click="cancelDelete" class="submit-btn" style="background-color: #e0e0e0;">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 삭제 성공 모달 -->
<v-dialog v-model="successModal" max-width="300px">
  <v-card class="successDeleteModal" style="padding: 7px; text-align: center;">
    <v-card-text class="text-center">
      할인이 성공적으로<br>삭제되었습니다.
    </v-card-text>
    <v-card-actions style="justify-content: center;">
      <v-btn @click="closeSuccessModal" class="submit-btn" style="margin-top: -10px;">확인</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>


    <!-- 액션 모달 (수정, 삭제 버튼) -->
    <v-dialog v-model="showActionModal" max-width="350" class="custom-dialog">
      <v-card class="custom-card" style="padding-top: 20px;">
        <v-card-title class="custom-title">
          <span class="headline">할인 관리</span>
        </v-card-title>
        <v-card-text class="button-container">
          <v-btn @click="openDiscountUpdateModal" class="modal-btn submit-btn" style="width: 150px; margin-right: 10px;">수정</v-btn>
          <v-btn @click="openDeleteConfirmModal" class="modal-btn submit-btn" style="width: 150px; background-color: #e0e0e0;">삭제</v-btn>
        </v-card-text>
        
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios';
import SellerSidebar from '@/components/sidebar/SellerSidebar.vue';
import SellerDiscountCreate from './SellerDiscountCreate.vue';
import SellerDiscountUpdate from './SellerDiscountUpdate.vue';

export default {
  components: {
    SellerSidebar,
    SellerDiscountCreate,
    SellerDiscountUpdate,
  },
  data() {
    return {
      discountList: [],
      currentPage: 1,
      itemsPerPage: 10,
      showDiscountCreateModal: false, // 할인 생성 모달 열림 여부
      showActionModal: false, // 액션 모달 열림 여부
      selectedDiscount: null, // 선택된 할인 데이터
      showDiscountUpdateModal: false, // 할인 수정 모달 열림 여부
      showDeleteConfirmModal: false, // 삭제 확인 모달 열림 여부
      successModal: false, // 삭제 성공 모달 열림 여부
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
    openActionModal(discount) {
      this.selectedDiscount = discount;
      this.showActionModal = true;
    },
    closeActionModal() {
      this.showActionModal = false;
      this.selectedDiscount = null;
    },
    openDiscountUpdateModal() {
      this.showDiscountUpdateModal = true;
      this.showActionModal = false;
    },
    openDeleteConfirmModal() {
      this.showDeleteConfirmModal = true;
      this.showActionModal = false;
    },
    async confirmDeleteDiscount() {
      try {
        // 삭제 API 호출
        await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/product-service/discounts/${this.selectedDiscount.discountId}/delete`, {
          headers: {
            sellerId: localStorage.getItem("sellerId")
          }
        });
        this.showDeleteConfirmModal = false;
        this.successModal = true;
        this.getDiscountList();
      } catch (error) {
        console.error('Error deleting discount:', error);
      }
    },
    cancelDelete() {
      this.showDeleteConfirmModal = false;
      this.selectedDiscount = null; // 선택된 할인 초기화
    },
    closeSuccessModal() {
      this.successModal = false;
    },
    formatDateTime(dateString) {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return date.toLocaleString('ko-KR', options).replace(/\.$/, '');
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

.custom-dialog {
  padding: 20px;
}

.custom-card {
  border-radius: 30px;
  padding: 10px;
}

.custom-title {
  background-color: #BCC07B;
  border-radius: 10px;
  text-align: center;
  width: calc(97% - 30px);
  margin: 0 auto;
  padding: 7px;
  font-size: 17px;
  margin-bottom: 10px;
}

.submit-btn {
  margin-left: 0px;
  margin-top: 8px;
  background-color: #BCC07B;
  color: black;
  border-radius: 50px;
  width: 150px; /* 버튼 가로 길이 조정 */
}

.modal-btn {
  border: none;
  box-shadow: none;
}

.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.successDeleteModal {
  padding: 7px;
  text-align: center;
}
</style>
