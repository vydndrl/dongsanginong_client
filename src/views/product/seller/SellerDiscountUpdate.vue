<template>
    <v-dialog :model-value="dialog" @update:model-value="updateDialog" @click:outside="handleOutsideClick" max-width="550" class="custom-dialog">
      <v-card class="custom-card" style="padding-top: 20px;">
        <v-card-title class="custom-title">
          <span class="headline">할인 수정</span>
        </v-card-title>
        <v-card-text style="font-size: 15px;">
          <v-form ref="form">
            <v-text-field label="할인금액" v-model="localDiscount.discount" type="number" required></v-text-field>
            <v-text-field v-model="localDiscount.startAt" label="시작 날짜" type="date" required></v-text-field>
            <v-text-field v-model="localDiscount.endAt" label="종료 날짜" type="date" required></v-text-field>
  
            <!-- 상품 검색 입력 -->
            <v-text-field
              v-model="searchTerm"
              label="상품 검색"
              append-icon="mdi-magnify"
              @click:append="searchProducts"
            ></v-text-field>
  
            <!-- 검색 결과로 나온 상품 리스트 및 페이지네이션 -->
            <div v-if="searchResults.length > 0" class="product-list-wrapper">
              <v-list class="product-list">
                <v-list-item
                  v-for="product in paginatedProducts"
                  :key="product.value"
                  class="product-item"
                >
                  <v-checkbox
                    :label="product.text"
                    :value="product.value"
                    v-model="localDiscount.productIdList"
                  ></v-checkbox>
                </v-list-item>
              </v-list>
              <!-- 페이지네이션 -->
              <v-pagination
                v-model="currentPage"
                :length="totalPages"
                prev-icon="mdi-chevron-left"
                next-icon="mdi-chevron-right"
                class="mt-2"
                :show-first-last="false"
              ></v-pagination>
            </div>
  
            <!-- 선택된 상품 리스트 -->
            <div v-if="localDiscount.productIdList.length > 0" class="mt-4 selected-product-list">
              <h3>선택된 상품:</h3>
              <div class="chip-container">
                <v-chip
                  v-for="productId in localDiscount.productIdList"
                  :key="productId"
                  class="ma-2 custom-chip"
                  @click="removeProduct(productId)"
                >
                  {{ getProductNameById(productId) }}
                </v-chip>
              </div>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="action-buttons">
          <v-spacer></v-spacer>
          
          <v-btn color="light_green" 
            class="custom-button" 
            @click="handleSave">수정</v-btn>
  
          <v-btn color="light_green" 
            class="custom-close-button"
            text  
            @click="confirmCloseModal = true">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  
    <!-- 닫기 확인 모달 -->
    <v-dialog v-model="confirmCloseModal" max-width="300px">
      <v-card class="modal" style="text-align: center;">
        <v-card-text style="margin-top: 3px;">정말 닫으시겠습니까?</v-card-text>
        <span style="color: gray; font-size: 13px; margin-top: -10px">현재 작성중인 내용은 저장되지 않습니다.</span><br>
        <v-card-actions class="action-buttons" style="justify-content: center; margin-left: 2%; margin-top: -6%;">
          <v-btn @click="confirmClose" class="custom-button">닫기</v-btn>
          <v-btn @click="confirmCloseModal = false" class="custom-close-button">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  
    <!-- 완료 메시지 모달 -->
    <v-dialog v-model="alertModal" max-width="260px">
      <v-card class="modal" style="padding: 10px; padding-right: 20px; text-align: center;">
        <v-card-text style="white-space: pre-line;">{{ alertMessage }}</v-card-text>
        <v-btn @click="closeAlertModal" class="submit-btn">닫기</v-btn>
      </v-card>
    </v-dialog>
  
    <!-- 오류 메시지 모달 -->
    <v-dialog v-model="errorModal" max-width="300px">
      <v-card class="modal" style="padding: 10px; padding-right: 20px; text-align: center;">
        <v-card-text style="white-space: pre-line;">{{ errorMessage }}</v-card-text>
        <v-btn @click="closeErrorModal" class="submit-btn">닫기</v-btn>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    props: {
      dialog: {
        type: Boolean,
        required: true,
      },
      discount: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        discountId: null,
        localDiscount: {
          discount: null,
          startAt: null,
          endAt: null,
          productIdList: [],
        },
        searchTerm: '',
        productOptions: [],
        searchResults: [],
        currentPage: 1,
        itemsPerPage: 3,
        confirmCloseModal: false, // 닫기 확인 모달 상태
        alertModal: false, // 완료 메시지 모달 상태
        alertMessage: '', // 완료 메시지 내용
        errorModal: false, // 오류 메시지 모달 상태
        errorMessage: '', // 오류 메시지 내용
      };
    },
    computed: {
      paginatedProducts() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.searchResults.slice(start, end);
      },
      totalPages() {
        return Math.ceil(this.searchResults.length / this.itemsPerPage);
      },
    },
    watch: {
      dialog(val) {
        if (val) {
          this.initializeData();
        }
      },
    },
    methods: {
      initializeData() {
        this.discountId = this.discount.discountId;
        this.fetchDiscountDetail();
        this.fetchAllProducts();
      },
      async fetchDiscountDetail() {
        try {
          const response = await axios.get(
            `${process.env.VUE_APP_API_BASE_URL}/product-service/discounts/${this.discountId}/detail`,
            {
              headers: {
                sellerId: localStorage.getItem('sellerId'),
              },
            }
          );
          const data = response.data;
          this.localDiscount.discount = data.discount;
          this.localDiscount.startAt = data.startAt;
          this.localDiscount.endAt = data.endAt;
          this.localDiscount.productIdList = data.productIdList;
        } catch (error) {
          this.errorMessage = '할인 상세 정보를 가져오는 중 오류가 발생했습니다.';
          this.errorModal = true;
          console.error('할인 상세 정보를 가져오는 중 오류 발생:', error);
        }
      },
      resetFormData() {
        this.localDiscount = {
          discount: null,
          startAt: null,
          endAt: null,
          productIdList: [],
        };
        this.searchTerm = '';
        this.currentPage = 1;
        this.searchResults = [];
      },
      updateDialog(value) {
        this.$emit('update:model-value', value);
      },
      handleOutsideClick() {
        this.resetFormData(); // 모달 밖을 클릭해 닫힐 때도 폼 데이터 초기화
        this.updateDialog(false); // 메인 모달 닫기
      },
      confirmClose() {
        this.resetFormData();
        this.closeDialog();
      },
      closeDialog() {
        this.confirmCloseModal = false; // 닫기 확인 모달 닫기
        this.updateDialog(false); // 메인 모달 닫기
      },
      closeAlertModal() {
        this.alertModal = false;
        this.confirmCloseModal = false;
        this.updateDialog(false); // 모든 모달 닫기
        window.location.reload();
      },
      closeErrorModal() {
        this.errorModal = false;
      },
      async fetchAllProducts() {
        try {
          const farmId = localStorage.getItem('farmId');
          if (!farmId) {
            console.error('farmId가 localStorage에 없습니다.');
            return;
          }
  
          const response = await axios.get(
            `${process.env.VUE_APP_API_BASE_URL}/product-service/product/no-auth/for-sale/${farmId}`,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
  
          this.productOptions = response.data.content.map((product) => ({
            text: product.packageName,
            value: product.packageId,
          }));
        } catch (error) {
          this.errorMessage = '상품 목록을 가져오는 중 오류가 발생했습니다.';
          this.errorModal = true;
          console.error('상품 목록을 가져오는 중 오류 발생:', error);
        }
      },
      searchProducts() {
        if (this.productOptions.length === 0) {
          return;
        }
  
        if (this.searchTerm && this.searchTerm.trim() !== '') {
          const searchLower = this.searchTerm.trim().toLowerCase();
          this.searchResults = this.productOptions.filter((product) =>
            product.text.toLowerCase().includes(searchLower)
          );
        } else {
          this.searchResults = this.productOptions;
        }
        this.currentPage = 1;
      },
      getProductNameById(productId) {
        const product = this.productOptions.find(
          (p) => p.value === productId
        );
        return product ? product.text : '';
      },
      removeProduct(productId) {
        this.localDiscount.productIdList = this.localDiscount.productIdList.filter(
          (id) => id !== productId
        );
      },
      handleSave() {
        if (!this.localDiscount.discount || !this.localDiscount.startAt || !this.localDiscount.endAt) {
          this.alertMessage = "할인금액과 날짜를 입력하세요.";
          this.alertModal = true;
          return;
        }
  
        if (this.localDiscount.productIdList.length === 0) {
          this.alertMessage = "적용하실 상품을 선택해 주세요.";
          this.alertModal = true;
          return;
        }
  
        this.updateDiscount();
      },
      async updateDiscount() {
        try {
          await axios.put(
            `${process.env.VUE_APP_API_BASE_URL}/product-service/discounts/${this.discountId}/update`,
            this.localDiscount,
            {
              headers: {
                sellerId: localStorage.getItem('sellerId'),
              },
            }
          );
          this.alertMessage = "할인이 성공적으로 수정되었습니다.";
          this.alertModal = true;
        } catch (error) {
          this.errorMessage = "이미 할인이 적용된\n 상품이 있습니다.";
          this.errorModal = true;
          console.error('할인 수정 중 오류 발생:', error);
        }
      },
    },
  };
  </script>
  
  <style scoped>
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
  }
  
  .product-list-wrapper {
    border: 1px solid #d4d4d4; /* 테두리 추가 */
    border-radius: 8px;
    padding: 10px;
    margin-top: 10px;
  }
  
  .action-buttons {
    margin-bottom: 10px;
    gap: 5px;
    margin-right: 3%;
    margin-top: -5px;
  }
  
  .custom-button {
    background-color: #BCC07B;
    color: black !important;
    border-radius: 30px;
    padding: 7px 30px;
    font-size: 14px;
    line-height: 1.5;
  }
  
  .custom-close-button {
    background-color: #e0e0e0;
    color: black !important;
    border-radius: 30px;
    padding: 7px 30px;
    font-size: 14px;
    line-height: 1.5;
  }
  
  .v-card-text {
    padding-top: 0;
  }
  
  .v-card-actions {
    justify-content: flex-end;
  }
  
  .product-item {
    margin-bottom: -40px;
  }
  
  .v-checkbox .v-label {
    font-size: 14px;
  }
  
  .v-pagination {
    justify-content: center;
  }
  
  .v-pagination .v-btn {
    min-width: 32px;
    height: 32px;
    margin: 0 2px;
  }
  
  .product-list-container {
    max-height: 250px;
    overflow: hidden;
  }
  
  .product-list {
    max-height: 100%;
    overflow: hidden;
  }
  
  .selected-product-list {
    text-align: left; /* 선택된 상품을 왼쪽 정렬 */
  }
  
  .chip-container {
    margin-left: -8px;
  }
  </style>
  