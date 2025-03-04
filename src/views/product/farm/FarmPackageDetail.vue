<template>
  <v-container>
    <v-row justify="center" align="center">
      <!-- 왼쪽: 이미지 슬라이더 -->
      <v-col cols="12" md="5" class="image-container">
        <v-card v-if="packageProduct && packageProduct.imageUrls && packageProduct.imageUrls.length" flat>
          <v-carousel hide-delimiters height="480px" show-arrows="false">
            <v-carousel-item v-for="(image, index) in packageProduct.imageUrls" :key="index">
              <v-img :src="image" alt="Package image" height="480px" contain style="border-radius: 10px;"></v-img>
            </v-carousel-item>
          </v-carousel>
        </v-card>
      </v-col>

      <div class="custom-divider"></div>

      <!-- 오른쪽: 상품 정보 -->
      <v-col cols="12" md="6" class="right-content" style="padding-left: 3%;">
        <v-card flat>
          <div v-if="packageProduct.discountId != null && packageProduct.discountActive == true">
            <v-card-title class="product-title" style="white-space: normal;">
              {{ packageProduct.packageName }} - [배송주기] {{ packageProduct.deliveryCycle }}일
              <span class="sale-style">SALE</span>
            </v-card-title>
            <v-card-subtitle>
              <div class="price">
                <span class="original-price">
                  <span style="font-weight: 700;">{{ formatPrice(packageProduct.price, packageProduct.discount) }}원&nbsp;&nbsp;</span>
                  <span style="text-decoration: line-through; color: #999; font-size: 15px;">{{ formatPrice(packageProduct.price, 0) }}원 </span>
                </span>
              </div>
            </v-card-subtitle>
          </div>

          <div v-else>
            <v-card-title class="product-title" style="white-space: normal;">
              {{ packageProduct.packageName }} - [배송주기] {{ packageProduct.deliveryCycle }}일
            </v-card-title>
            <v-card-subtitle>
              <div class="price">
                <span class="original-price">
                  <strong>{{ packageProduct.price ? packageProduct.price.toLocaleString() : '' }} 원</strong>
                </span>
              </div>
            </v-card-subtitle>
          </div>
          <v-card-text class="subscription-info">
            <hr class="custom-hr" />
            <strong class="green-text">정기구독</strong>
            <span class="black-text">
              은 꾸준히 오랜기간 먹는 음식을 믿을 수 있는 생산자의 먹거리로 제안합니다.<br>
              매번 재구매하실 필요 없이 정해진 주기로 배송해드립니다.
            </span>
            <hr class="custom-hr" /><br>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 패키지 설명 및 결제 방식 -->
    <v-row>
      <v-col cols="12" md="6" offset-md="6" class="package-description-container" style="padding-left: 3%;">
        <v-card flat>
          <v-card-subtitle class="package-title">패키지 설명</v-card-subtitle>
          <v-card-text class="package-description">
            <div v-html="packageProduct.productDescription"></div>
          </v-card-text>
        </v-card>

        <v-card flat>
          <v-card-subtitle class="payment-title">결제방식</v-card-subtitle>
          <v-card-text class="payment-info">
            정기구독은 카드결제만 가능합니다. 등록하신 카드로 선택한 주기에 따라 자동결제되며,<br>
            상품은 결제일 기준 1~2일 내 출고됩니다.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 정기구독 신청 버튼을 오른쪽으로 이동 -->
    <v-row>
      <v-col class="right-aligned">
        <v-btn class="subscription-btn" @click="handleSubscriptionClick">정기구독 신청</v-btn>
      </v-col>
    </v-row>

    <!-- 판매자 구매 제한 모달 -->
    <v-dialog v-model="sellerRestrictionModal" max-width="300" persistent>
      <v-card class="modal" style="padding: 10px; text-align: center;">
        <v-card-text>판매자는 상품을 <br> 구매할 수 없습니다.</v-card-text>
        <v-card-actions class="modal-actions" style="justify-content: center;">
          <v-btn @click="closeSellerRestrictionModal" class="submit-btn">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Viewer와 Editor -->
    <v-row>
      <v-col cols="12">
        <!-- Viewer -->
        <div v-if="!isEditing" ref="viewer"></div>
      </v-col>
    </v-row>


    <!-- 리뷰 목록 -->
    <h4 class="review-header">전체 리뷰({{ reviews.length }})</h4>
    <v-row v-if="paginatedReviews.length > 0" class="review-row">
      <v-col v-for="(review, index) in paginatedReviews" :key="index" cols="12" md="4" class="review-item">
        <v-card class="review-card" @click="goToReviewDetail(review.id)">
          <!-- 리뷰 카드 내용 -->
          <div class="card-header">
            <div class="rating">
              <!-- 별점 표시 -->
              <span v-for="star in 5" :key="star">
                <v-icon v-if="star <= review.rating" class="star-icon">mdi-star</v-icon>
                <v-icon v-else class="star-icon">mdi-star-outline</v-icon>
              </span>
            </div>
            <div class="review-date">{{ formatDate(review.updateAt) }}</div>
          </div>
          <!-- 내 리뷰면 -->
          <div class="review-title" v-if="review.memberId == this.memberId">
            <strong>{{ review.title }}</strong>&nbsp;&nbsp;
            <span class="my-review" style="background-color: #eee; padding: 3px 5px; border-radius: 10px; font-size: 13px;
            margin-bottom: 5px; color: blue;">내 리뷰</span>
          </div>
          <div class="review-title" v-else>
            <strong>{{ review.title }}</strong>
          </div>
          <!-- 첫 번째 리뷰 이미지, 이미지가 없으면 빈 div로 공간 확보 -->
          <v-img v-if="review.imageUrls && review.imageUrls.length > 0" :src="review.imageUrls[0]"
            class="review-image-list" />
          <div v-else class="review-image empty-image"></div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 리뷰 디테일 모달 -->
    <v-dialog v-model="reviewModal" max-width="800px" @click:outside="closeReviewModal">
      <v-card class="review-card elevation-0" outlined v-if="selectedReview">
        <v-row>
          <v-col cols="12" class="review-info">
            <div class="header-content">
              <!-- 별점 표시 -->
              <div class="rating" style="margin-top: -20px;">
                <span v-for="star in 5" :key="star">
                  <v-icon v-if="star <= selectedReview.rating" class="star-icon">mdi-star</v-icon>
                  <v-icon v-else class="star-icon">mdi-star-outline</v-icon>
                </span>
              </div>
              <!-- 업데이트 날짜 표시 -->
              <div class="review-date">
                {{ formatDate(selectedReview.updateAt) }}
              </div>
            </div>

            <!-- 리뷰 제목 -->
            <div class="review-title">
              <strong>{{ selectedReview.title }}</strong>
            </div>

            <!-- 수정/삭제 버튼: 현재 로그인한 유저와 리뷰 작성자가 같을 경우에만 표시 -->
            <v-row class="button-row">
              <v-col v-if="isReviewOwner" cols="12" class="action-buttons">
                <v-btn @click="openEditDialog()" class="edit-btn">수정</v-btn>
                <v-btn @click="openDeleteConfirmation" class="delete-btn">삭제</v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- 리뷰 내용과 이미지 -->
        <v-row class="review-content justify-center">
          <v-col cols="12" class="d-flexjustify-center">
            <p class="review-text">{{ selectedReview.contents }}</p>
            <div v-if="selectedReview.imageUrls && selectedReview.imageUrls.length">
              <div class="image-slider-container">
                <button v-if="selectedReview.imageUrls.length > imagesPerPage" @click="scrollLeft"
                  class="scroll-button left-button">‹</button>
                <div ref="imageSlider" class="image-slider">
                  <img v-for="(imageUrl, i) in visibleImages" :key="i" :src="imageUrl" class="review-image-detail"
                    alt="리뷰 이미지" />
                </div>
                <button v-if="selectedReview.imageUrls.length > imagesPerPage" @click="scrollRight"
                  class="scroll-button right-button">›</button>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- 삭제 확인 모달 -->
        <v-dialog v-model="deleteModal" max-width="300">
          <v-card class="modal" style="padding: 10px; padding-bottom: 5px;">
            <v-card-title class="modal-title">정말 삭제하시겠습니까?</v-card-title>
            <v-card-actions class="modal-actions">
              <v-spacer></v-spacer>
              <v-btn @click="confirmDelete" class="delete-confirm-btn">삭제</v-btn>
              <v-btn @click="closeDeleteModal" class="cancel-btn">닫기</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="successModal" max-width="260px">
          <v-card class="modal" style="padding: 10px; text-align: center;">
                <v-card-text style="text-align: center;">삭제가 완료되었습니다.</v-card-text>
                <v-btn @click="closeModals" class="submit-btn" style="margin-right: 10px;">확인</v-btn>
            </v-card>
        </v-dialog>

        <!-- 리뷰 수정 모달 -->
        <review-update v-if="selectedReview && selectedReview.id" :review-id="selectedReview.id" ref="editModal" @review-updated="fetchReviewDetail" />

      </v-card>
    </v-dialog>

    <!-- 페이지네이션 -->
    <v-row justify="center" align="center">
      <v-col cols="12" class="text-center">
        <!-- 현재 페이지와 총 페이지 수를 보여줌 -->
        <v-pagination v-model="currentPage" :length="pageCount"></v-pagination>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import ReviewUpdate from '@/views/product/review/ReviewUpdate.vue';
import { Editor } from '@toast-ui/editor';
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'; // Viewer 가져오기
import fontSize from "tui-editor-plugin-font-size";
import colorSyntax from '@toast-ui/editor-plugin-color-syntax';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/toastui-editor-viewer.css'; // Viewer CSS 가져오기
import '@toast-ui/editor/dist/i18n/ko-kr';
import "tui-editor-plugin-font-size/dist/tui-editor-plugin-font-size.css";
import 'tui-color-picker/dist/tui-color-picker.css';
import '@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css';

export default {
  components: {
    ReviewUpdate,
  },
  data() {
    return {
      reviewModal: false,
      packageProduct: {},
      reviews: [],
      review: {},
      selectedReview: null, // 선택한 리뷰
      currentPage: 1,
      pageSize: 3,
      totalReviews: 0,
      currentImageIndex: 0,
      imagesPerPage: 2,
      deleteModal: false, // 삭제 확인 모달 상태
      memberId: localStorage.getItem('memberId'),
      farmId: localStorage.getItem('farmId'),
      successModal: false,
      editorInstance: null, // 에디터 인스턴스 저장
      isEditing: false, // 편집 모드 여부
      originalDetailedDescription: '', // 원본 상세 설명 저장
      viewerInstance: null,
      sellerRestrictionModal: false, // 판매자 제한 모달 상태
      role: localStorage.getItem('role'), // role 정보 추가
    };
  },
  mounted() {
    this.initializeViewer();
  },
  beforeUnmount() {
    // 컴포넌트가 파괴되기 전에 에디터 인스턴스를 파괴합니다.
    if (this.editorInstance) {
      this.editorInstance.destroy();
    }
    if (this.viewerInstance) {
      this.viewerInstance.destroy();
    }
  },
  watch: {
    isEditing(newVal) {
      if (!newVal) {
        // 편집이 종료되면 Viewer를 다시 초기화
        this.initializeViewer();
      } else {
        // 편집이 시작되면 Viewer 파괴
        if (this.viewerInstance) {
          this.viewerInstance.destroy();
          this.viewerInstance = null;
        }
      }
    },
    'packageProduct.detailedProductDescription'() {
      // 내용이 변경되면 Viewer를 다시 초기화
      if (!this.isEditing) {
        this.initializeViewer();
      }
    },
  },
  computed: {
    pageCount() {
      return Math.ceil(this.totalReviews / this.pageSize);
    },
    paginatedReviews() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.reviews.slice(start, end);
    },
    visibleImages() {
      return this.selectedReview ? this.selectedReview.imageUrls.slice(
        this.currentImageIndex,
        this.currentImageIndex + this.imagesPerPage
      ) : [];
    },
    isReviewOwner() {
      // 현재 로그인한 사용자의 memberId와 리뷰 작성자의 memberId 비교
      return this.selectedReview && Number(this.memberId) === this.selectedReview.memberId;
    },
    isSeller() {
      return (
        this.packageProduct.farmId &&
        Number(this.farmId) === this.packageProduct.farmId
      );
    },
  },
  async created() {
    const packageId = this.$route.params.packageId;
    try {
      const productResponse = await axios.get(
        `${process.env.VUE_APP_API_BASE_URL}/product-service/product/no-auth/detail/${packageId}`
      );
      const productData = productResponse.data;
      console.log(productData)
      console.log(">>>>id: " + productData.discountId + "  >>>>discount: " + productData.discount + ">>>> name: " + productData.packageName);

      // delivery_cycle -> deliveryCycle로 변환
      this.packageProduct = {
        ...productData,
        deliveryCycle: productData.delivery_cycle,  // 필드명 변환
      };

      const reviewResponse = await axios.get(
        `${process.env.VUE_APP_API_BASE_URL}/product-service/reviews/no-auth/${packageId}/list`
      );
      this.reviews = reviewResponse.data.reverse();
      this.totalReviews = this.reviews.length;
    } catch (e) { 
      console.error(e);
    }
  },

  methods: {
    handleSubscriptionClick() {
      if (this.role === 'MEMBER') {
        this.subscribe();
      } else {
        this.sellerRestrictionModal = true;
      }
    },
    closeSellerRestrictionModal() {
      this.sellerRestrictionModal = false;
    },
    subscribe() {
      this.$router.push(`/product/${this.packageProduct.id}/payment`)
    },
    formatDate(date) {
      if (!date) return '';
      return date.split('T')[0]; // 날짜를 'YYYY-MM-DD' 형식으로 반환
    },
    async goToReviewDetail(reviewId) {
      try {
        // 선택된 리뷰의 상세 정보를 가져오는 함수 호출
        await this.fetchReviewDetail(reviewId);
        console.log("Selected Review ID:", this.selectedReview.id);
        this.reviewModal = true; // 리뷰 디테일 모달을 표시 
      } catch (error) {
        console.error("리뷰 디테일을 불러오는 중 오류 발생:", error);
      }
    },
    async fetchReviewDetail(reviewId) {
      try {
        const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/product-service/reviews/no-auth/detail/${reviewId}`);
        if (response.ok) {
          const data = await response.json();
          this.selectedReview = data;  // 선택된 리뷰의 정보를 저장
          console.log("Fetched review data:", data);
        } else {
          console.error("리뷰 디테일을 불러오는 중 오류 발생:", response.status);
          this.selectedReview = null;
        }
      } catch (error) {
        console.error("리뷰 디테일을 불러오는 중 오류 발생:", error);
        this.selectedReview = null;
      }
    },
    closeReviewModal() {
      this.reviewModal = false;
      this.selectedReview = null; // 모달을 닫을 때 selectedReview 초기화
    },
    scrollLeft() {
      this.currentImageIndex = Math.max(this.currentImageIndex - this.imagesPerPage, 0);
    },
    scrollRight() {
      const maxIndex = this.selectedReview.imageUrls.length - this.imagesPerPage;
      this.currentImageIndex = Math.min(this.currentImageIndex + this.imagesPerPage, maxIndex);
    },
    openEditDialog() {
      if (this.selectedReview && this.selectedReview.id) {
        console.log("Opening Edit Dialog for Review ID:", this.selectedReview.id);
        this.$refs.editModal.openEditDialog();
      } else {
        console.error("No selected review found!");
      }
    },
    openDeleteConfirmation() {
      this.deleteModal = true;
    },
    closeDeleteModal() {
      this.deleteModal = false;
    },
    async confirmDelete() {
      const accessToken = localStorage.getItem('accessToken');
      try {
        await axios.delete(
          `${process.env.VUE_APP_API_BASE_URL}/product-service/reviews/${this.selectedReview.id}/delete`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        this.deleteModal = false;
        this.successModal = true;
        // this.fetchReviews(); // 리뷰 목록을 다시 불러옴
      } catch (error) {
        console.error('리뷰 삭제 실패:', error);
      }
    },
    closeModals() {
      this.successModal = false;
      this.reviewModal = false;
      window.location.reload();
    },
    formatPrice(price, discount) {
      if (price == null) {
        return "0";
      }
      const finalPrice = discount ? price - discount : price;
      return parseInt(finalPrice).toLocaleString('ko-KR');
    },

     startEdit() {
      this.isEditing = true;
      this.originalDetailedDescription = this.packageProduct.detailedProductDescription || '';

      if (this.editorInstance) {
        // 에디터 인스턴스가 이미 있으면 초기화만 수행
        this.editorInstance.setHTML(this.originalDetailedDescription);
      } else {
        this.$nextTick(() => {
          // 에디터 초기화
          console.log('Editor Element:', this.$refs.editor);
          this.editorInstance = new Editor({
            el: this.$refs.editor,
            previewStyle: 'vertical',
            height: '500px',
            initialEditType: 'wysiwyg',
            initialValue: this.originalDetailedDescription,
            language: 'ko',
            hideModeSwitch: true,
            hooks: {
              addImageBlobHook: this.onImageUpload, // 이미지 업로드 훅 설정
            },
            toolbarItems: [
              ['heading', 'bold'],
              ['ul', 'ol', 'task'],
              ['image']
            ],
            plugins: [fontSize, colorSyntax],

            customHTMLRenderer: {
              htmlBlock: {
                iframe(node) {
                  return [
                    { type: 'openTag', tagName: 'iframe', outerNewLine: true, attributes: node.attrs },
                    { type: 'html', content: node.childrenHTML },
                    { type: 'closeTag', tagName: 'iframe', outerNewLine: true },
                  ];
                }
              }
            }
          });
        });
      }
    },

     cancelEdit() {
      this.isEditing = false;
      if (this.editorInstance) {
        this.editorInstance.destroy();
        this.editorInstance = null;
      }
      this.packageProduct.detailedProductDescription = this.originalDetailedDescription;
    },

    async saveDetailedDescription() {
      const packageId = this.$route.params.packageId;
      const accessToken = localStorage.getItem('accessToken');
      const updatedDescription = this.editorInstance.getHTML();
      const updateData = {
        packageName: this.packageProduct.packageName,
        deliveryCycle: this.packageProduct.deliveryCycle,
        price: this.packageProduct.price,
        deleteImageUrls: [],
        newImageUrls: [],
        productDescription: this.packageProduct.productDescription,
        detailedProductDescription: updatedDescription,
        origin: this.packageProduct.origin,
      };

      if (!this.editorInstance) {
        console.error('에디터 인스턴스가 유효하지 않습니다.');
        return;
      }

      try {
        const updatedDescription = this.editorInstance.getHTML();
        await axios.put(
          `${process.env.VUE_APP_API_BASE_URL}/product-service/seller/packages/${packageId}/update`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              sellerId: localStorage.getItem('sellerId'),
              'Content-Type': 'application/json',
            },
          }
        );

        this.packageProduct.detailedProductDescription = updatedDescription;
        this.isEditing = false;

        if (this.editorInstance) {
          this.editorInstance.destroy();
          this.editorInstance = null;
        }

        this.isEditing = false;
      } catch (error) {
        console.error('상세 정보 업데이트 실패:', error);
      }
    },

    initializeViewer() {
      if (this.viewerInstance) {
        this.viewerInstance.destroy();
      }
      this.$nextTick(() => {
        this.viewerInstance = new Viewer({
          el: this.$refs.viewer,
          initialValue: this.packageProduct.detailedProductDescription || '',
          language: 'ko',
        });
      });
    },


    async uploadImage(blob) {
      const accessToken = localStorage.getItem('accessToken');
      const body = {
        prefix: "Farm",
        url: `${blob.name}`,
      };
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };

      // presigned URL 요청
      const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/product-service/api/upload/presigned-url`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });
      const contentType = response.headers.get("content-type");
      let presignedUrl;
      let imageUrl;

      if (contentType && contentType.includes("application/json")) {
        // 응답이 JSON인 경우
        const result = await response.json();
        presignedUrl = result.url;
        imageUrl = result.imageUrl;
      } else {
        // 응답이 텍스트인 경우
        const textResult = await response.text();
        presignedUrl = textResult;
        // 이미지 URL은 presigned URL에서 '?' 이전 부분
        imageUrl = presignedUrl.split("?")[0];
      }

      // 이미지 업로드
      await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": blob.type,
        },
        body: blob,
      });

      return imageUrl; // 업로드된 이미지의 최종 URL 반환
    },

    async onImageUpload(blobOrBlobArray, callback) {
      const blobs = Array.isArray(blobOrBlobArray) ? blobOrBlobArray : [blobOrBlobArray];
      for (const blob of blobs) {
        try {
          const imageUrl = await this.uploadImage(blob);
          callback(imageUrl, blob.name);
        } catch (error) {
          console.error('이미지 업로드 실패:', error);
        }
      }
    },
  },
};
</script>

<style scoped>
@import '~@toast-ui/editor/dist/toastui-editor.css';

.review-header {
  text-align: left;
  width: 100%;
  max-width: 950px;
  margin-bottom: 30px;
  margin-top: 60px;
  padding-left: 0;
  /* 왼쪽 여백을 없앰 */
}

/* 리뷰 리스트에서 사용하는 이미지 크기 */
.review-image-list {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 10px;
  margin-top: 10px;
}

/* 리뷰 디테일에서 사용하는 이미지 크기 */
.review-image-detail {
  width: 290px;
  height: 290px;
  object-fit: cover;
  border-radius: 10px;
  margin-top: 10px;
}

.image-container {
  margin-right: 5%;
}

.pagination-buttons {
  text-align: center;
  margin-top: 10px;
}

.right-content {
  margin-bottom: 30%;
}

.product-title {
  font-size: 28px;
  font-weight: bold;
  margin-top: 15%;
}

.price {
  margin-top: 0px;
  margin-left: -10px;
}

.original-price {
  font-size: 18px;
  color: black;
  margin-left: 10px;
}

.subscription-info {
  margin-top: 10px;
  line-height: 1.6;
}

.green-text {
  color: green;
  font-size: 16px;
}

.black-text {
  color: black;
  font-size: 14px;
}

.package-description-container {
  margin-top: -33%;
}

.package-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  margin-left: -15px;
}

.payment-title {
  font-size: 16px;
  font-weight: bold;
  margin-left: -15px;
}

.package-description {
  font-size: 14px;
  line-height: 1.8;
  background-color: #f7f7f7;
  padding: 15px;
  padding-bottom: 30px;
  border-radius: 8px;
  margin-bottom: 10%;
  min-height: 150px;
}

.payment-info {
  font-size: 14px;
  line-height: 1.8;
  color: #666;
  margin-left: -15px;
}

.subscription-btn {
  background-color: #bcc07b;
  color: black;
  padding: 10px 20px;
  border-radius: 30px;
  margin-top: 6%;
}

.right-aligned {
  text-align: right;
  margin-top: -10%;
}

.custom-divider {
  width: 2px;
  height: 650px;
  background-color: #ccc;
  margin-top: 5%;
}

.custom-hr {
  border: none;
  border-top: 1px solid #ccc;
  margin: 15px 0;
}

.review-item {
  margin-bottom: 20px;
}

.review-card {
  padding: 5%;
  border-radius: 10px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  text-align: left;
  min-height: 200px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.rating {
  display: flex;
  align-items: center;
}

.star-icon {
  color: #ffcc80;
  font-size: 24px;
}

.review-date {
  font-size: 14px;
  color: #888;
}

.package-name {
  font-size: 16px;
  color: #888;
}

.review-title {
  margin: 10px 0;
  font-size: 16px;
  margin-bottom: 20px;
}

.empty-image {
  width: 100px;
  height: 100px;
  background-color: #ffffff;
  border-radius: 10px;
  margin-top: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: -7%;
  justify-content: flex-end;
}

.edit-btn {
  margin-top: -30px;
  background-color: #BCC07B;
  color: black;
  border-radius: 30px;
  padding: 10px 20px;
  font-size: 13px;
  line-height: 1.5;
  max-width: 200px;
}

.delete-btn {
  margin-top: -30px;
  background-color: #e0e0e0;
  color: black;
  border-radius: 30px;
  padding: 10px 20px;
  font-size: 13px;
  line-height: 1.5;
  max-width: 200px;
}

.scroll-button {
  color: rgb(78, 78, 78);
  border: none;
  width: 30px;
  height: 30px;
  cursor: pointer;
  z-index: 1;
  font-size: 25px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.left-button {
  margin-right: 20px;
  /* 이미지 왼쪽에서 버튼 떨어뜨림 */
}

.right-button {
  margin-left: 20px;
  /* 이미지 오른쪽에서 버튼 떨어뜨림 */
}

.image-slider {
  display: flex;
  gap: 10px;
  overflow: hidden;
}

.image-slider-container {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  margin-top: 20px;
}

.modal-title {
  font-size: 16px;
  text-align: center;
}

.delete-confirm-btn {
  background-color: #BCC07B;
  color: black;
  border-radius: 30px;
  padding: 10px 20px;
  font-size: 13px;
  max-width: 200px;
  margin-right: 10px;
}

.cancel-btn {
  background-color: #e0e0e0;
  color: black;
  border-radius: 30px;
  padding: 10px 20px;
  font-size: 13px;
  max-width: 200px;
}

.submit-btn {
    margin-left: 10px;
    margin-top: 8px;
    background-color: #BCC07B;
    color: black;
    border-radius: 50px;
}

.sale-style {
    background-color: rgb(245, 77, 77); 
    color: white; 
    padding-right: 7px;
    padding-left: 7px;
    padding-bottom: 3px;
    padding-top: 5px;
    font-size: 12px;
}

/* Styles for Edit and Save buttons */
.edit-button {
  margin-top: 10px;
  background-color: #BCC07B;
  color: black;
  border-radius: 30px;
  padding: 10px 20px;
  font-size: 14px;
}

.edit-actions {
  margin-top: 10px;
}
</style>
