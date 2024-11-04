- 패키지 수정

<template>
  <div class="product-register-page-wrapper">
    <SellerSidebar />

    <div class="product-register-page">
      <!-- 패키지 이미지 수정 -->
      <div class="image-upload package-upload">
        <h3 class="title" style="text-align: center">패키지 이미지 수정</h3>

        <!-- 이미지 슬라이더 -->
        <div class="image-slider">
          <button class="slider-btn prev-btn" @click="prevImage" :disabled="currentIndex === 0">
            <v-icon>mdi-chevron-left</v-icon>
          </button>

          <div class="slider-wrapper">
            <!-- 이미지가 있는 경우 보여주는 부분 -->
            <div v-if="currentIndex < imageUrls.length" class="image-slide">
              <img :src="imageUrls[currentIndex]" alt="패키지 이미지" class="image-preview" />
              <button class="delete-btn" @click="removeImage(currentIndex)">
                <v-icon>mdi-delete</v-icon>
              </button>
            </div>

            <!-- 이미지 추가 슬라이드 -->
            <div v-else class="image-slide" @click="triggerImageUpload">
              <div class="add-image-box">
                <input type="file" @change="onImageUpload" class="image-input" ref="imageInput" multiple />
                <div class="upload-icon">+</div>
              </div>
            </div>
          </div>

          <button class="slider-btn next-btn" @click="nextImage" :disabled="currentIndex >= imageUrls.length">
            <v-icon>mdi-chevron-right</v-icon>
          </button>
        </div>
      </div>

      <!-- 상품 정보 수정 폼 -->
      <div class="product-info">
        <div class="input-group">
          <label for="productName">상품 명</label>
          <input type="text" id="productName" v-model="productName" placeholder="이름을 입력해주세요." />
        </div>

        <div class="input-group">
          <label for="productDescription">상품 설명</label>
          <textarea id="productDescription" v-model="productDescription" placeholder="설명을 입력해주세요."></textarea>
        </div>

        <div class="input-group">
          <label for="price">가격</label>
          <input type="number" id="price" v-model="price" placeholder="가격을 입력해주세요." />
        </div>

        <div class="input-group">
          <label for="deliveryPeriod">배송주기</label>
          <select id="deliveryPeriod" v-model="deliveryPeriod">
            <option value="1">1일</option>
            <option value="4">4일</option>
            <option value="7">7일</option>
            <option value="14">14일</option>
            <option value="28">28일</option>
          </select>
        </div>

        <div class="input-group">
          <label for="origin">원산지</label>
          <input type="text" id="origin" v-model="origin" placeholder="원산지를 입력해주세요." />
        </div>
      </div>

      <!-- 버튼 그룹 -->
      <div class="button-group">
        <!-- 패키지 수정 버튼 -->
        <!-- <button type="button" @click="updateProduct" class="submit-button">패키지 수정</button> -->
        <button type="button" @click="toggleEditor" class="submit-button" style="background-color: #e0e0e0;">
          {{ isEditorVisible ? '상세 정보 숨기기' : '상세 정보 수정' }}
        </button>
        <button type="button" @click="updateProduct" class="submit-button">수정 완료</button>
      </div>

      <!-- 상세 정보 에디터 -->
      <transition name="fade" @after-enter="onAfterEnter" @before-leave="onBeforeLeave">
        <div class="input-group" v-if="isEditorVisible">
          <label for="detailedDescription">상세 설명</label>
          <div ref="editorContainer"></div>
        </div>
      </transition>
    </div>

    <!-- 성공 모달 -->
    <v-dialog v-model="successModal" max-width="300px">
      <v-card class="successModal" style="padding: 7px; padding-bottom: 12px; text-align: center;">
        <v-card-text style="text-align: center;">
          상품이 성공적으로<br>수정되었습니다.
        </v-card-text>
        <v-btn @click="closeSuccessModal" class="submit-btn" style="margin-top: -10px; margin-right: 10px;">확인</v-btn>
      </v-card>
    </v-dialog>

    <!-- 검증 실패 모달 -->
    <v-dialog v-model="validationModal" max-width="340px">
      <v-card class="validationModal" style="padding: 7px; padding-bottom: 12px; text-align: center;">
        <v-card-text>
          {{ validationMessage }}
        </v-card-text>
        <v-btn @click="closeValidationModal" class="submit-btn" style="margin-top: -8px; margin-right: 10px;">확인</v-btn>
      </v-card>
    </v-dialog>

    <!-- 상세 정보 숨기기 확인 모달 -->
    <v-dialog v-model="confirmHideEditorModal" max-width="370px">
      <v-card class="validationModal" style="padding: 10px; text-align: center;">
        <v-card-text>
          <p>입력한 모든 데이터가 사라집니다.</p>
          <p>숨기시겠습니까?</p>
        </v-card-text>
        <v-card-actions class="justify-center" style="margin-top: -15px;">
          <v-btn @click="handleConfirmHideEditor" class="submit-btn">확인</v-btn>
          <v-btn @click="closeConfirmHideEditor" class="submit-btn" style="background-color: #e0e0e0;">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import SellerSidebar from '@/components/sidebar/SellerSidebar.vue';
import axios from 'axios';
import { Editor } from '@toast-ui/editor';
import colorSyntax from '@toast-ui/editor-plugin-color-syntax';
import fontSize from 'tui-editor-plugin-font-size';
import '@toast-ui/editor/dist/toastui-editor.css';
import 'tui-editor-plugin-font-size/dist/tui-editor-plugin-font-size.css';
import '@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css';

export default {
  components: {
    SellerSidebar
  },

  data() {
    return {
      productId: this.$route.params.id, // 상품 ID
      productName: '',
      productDescription: '',
      detailedProductDescription: '',
      price: '',
      deliveryPeriod: 1,
      origin: '',
      imageUrls: [], // 기존 이미지 리스트
      newImageUrls: [], // 새로 추가된 이미지 리스트
      deleteImageUrls: [], // 삭제할 이미지 리스트
      currentIndex: 0, // 슬라이더에서 현재 인덱스
      successModal: false,
      validationModal: false,
      validationMessage: '',
      isEditorVisible: false, // 에디터 표시 여부
      editorInstance: null, // 에디터 인스턴스 저장
      confirmHideEditorModal: false, // 상세 정보 숨기기 확인 모달 상태
    };
  },

  created() {
    this.fetchProductDetails();
  },

  methods: {
    // 상품 정보를 API로 불러오기
    async fetchProductDetails() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/product-service/product/no-auth/detail/${this.productId}`);
        const productData = response.data;
        this.productName = productData.packageName;
        this.productDescription = productData.productDescription;
        this.price = productData.price;
        this.deliveryPeriod = productData.delivery_cycle;
        this.origin = productData.origin;
        this.imageUrls = productData.imageUrls;
        this.detailedProductDescription = productData.detailedProductDescription || ''; // 기존 상세 설명
        console.log(response);
      } catch (error) {
        console.error('상품 정보 로드 실패:', error);
      }
    },

    // 이미지 업로드 트리거
    triggerImageUpload() {
      this.$refs.imageInput.click();
    },

    // 이미지 업로드 처리
    async onImageUpload(event) {
      const files = Array.from(event.target.files);
      for (let file of files) {
        try {
          const imageUrl = await this.uploadImage(file);
          this.imageUrls.push(imageUrl); // 업로드된 이미지 URL을 리스트에 추가
          this.newImageUrls.push(imageUrl);
        } catch (error) {
          console.error('이미지 업로드 실패:', error);
          this.validationMessage = '이미지 업로드에 실패했습니다.';
          this.validationModal = true;
        }
      }
      this.currentIndex = this.imageUrls.length - 1; // 방금 추가한 이미지를 표시
    },

    // 이미지 업로드 메서드
    async uploadImage(blob) {
      const accessToken = localStorage.getItem('accessToken');
      const body = {
        prefix: 'package',
        url: `${blob?.name}`,
      };
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };
      const getUrl = await fetch(`${process.env.VUE_APP_API_BASE_URL}/product-service/api/upload/presigned-url`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });

      if (!getUrl.ok) {
        throw new Error('프리사인 URL 요청 실패');
      }

      const getUrlResult = await getUrl.text();

      const awsUrl = {
        data: `${getUrlResult.split('?')[0]}`,
        auth: `?${getUrlResult.split('?')[1]}`,
      };

      // S3로 이미지 업로드
      const options = {
        method: 'PUT',
        headers: {
          'Content-Type': blob.type,
        },
        body: blob,
      };
      const uploadResponse = await fetch(awsUrl.data + awsUrl.auth, options);

      if (!uploadResponse.ok) {
        throw new Error('이미지 업로드 실패');
      }

      return awsUrl.data; // 업로드된 이미지 URL 반환
    },

    // 이미지 제거 메서드
    removeImage(index) {
      this.deleteImageUrls.push(this.imageUrls[index]); // 삭제할 이미지 리스트에 추가
      this.imageUrls.splice(index, 1); // 이미지 리스트에서 삭제
      if (this.imageUrls.length === 0) {
        this.currentIndex = 0;
      } else if (this.currentIndex >= this.imageUrls.length) {
        this.currentIndex = this.imageUrls.length - 1;
      }
    },

    // 다음 이미지 보기
    nextImage() {
      if (this.currentIndex < this.imageUrls.length) {
        this.currentIndex++;
      }
    },

    // 이전 이미지 보기
    prevImage() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }
    },

    // 에디터 토글 메서드
    toggleEditor() {
      if (this.isEditorVisible) {
        this.confirmHideEditorModal = true;
      } else {
        this.isEditorVisible = true;
      }
    },

    // 상세 정보 숨기기 취소 핸들러
    closeConfirmHideEditor() {
      this.confirmHideEditorModal = false;
    },

    // 에디터 초기화 메서드
    initializeEditor() {
      if (!this.$refs.editorContainer) {
        console.error('에디터 컨테이너를 찾을 수 없습니다.');
        return;
      }


      if (this.editorInstance) {
        // 이미 에디터가 초기화되어 있으면 종료
        return;
      }

      this.editorInstance = new Editor({
        el: this.$refs.editorContainer,
        height: '400px',
        initialEditType: 'wysiwyg',
        previewStyle: 'vertical',
        language: 'ko',
        initialValue: this.detailedProductDescription || '',
        plugins: [colorSyntax, fontSize],
        hideModeSwitch: true,
        toolbarItems: [
          ['heading', 'bold', 'italic', 'strike'],
          ['ul', 'ol', 'task'],
          ['image', 'link']
        ],
        hooks: {
          addImageBlobHook: (blob, callback) => {
            this.handleEditorImageUpload(blob, callback);
          },
        },
      });
    },

    // 에디터 이미지 업로드 핸들러
    async handleEditorImageUpload(blob, callback) {
      try {
        const imageUrl = await this.uploadImage(blob);
        callback(imageUrl, blob.name);
      } catch (error) {
        console.error('에디터 이미지 업로드 실패:', error);
        alert('이미지 업로드에 실패했습니다.');
      }
    },

    // 상품 수정 메서드
    async updateProduct() {
      // 입력 값 검증 로직 추가
      if (!this.productName || !this.productDescription || !this.price || !this.deliveryPeriod || !this.origin) {
        this.validationMessage = '모든 필수 입력 항목을 입력해주세요.';
        this.validationModal = true;
        return;
      }

      const detailedDescription = this.editorInstance ? this.editorInstance.getHTML() : this.detailedProductDescription;

      try {
        const accessToken = localStorage.getItem('accessToken');
        const sellerId = localStorage.getItem('sellerId');

        const updateData = {
          packageName: this.productName,
          productDescription: this.productDescription,
          detailedProductDescription: detailedDescription,
          price: this.price,
          deliveryCycle: this.deliveryPeriod,
          origin: this.origin,
          newImageUrls: this.newImageUrls,
          deleteImageUrls: this.deleteImageUrls
        };

        console.log('삭제할 이미지 URLs:', this.deleteImageUrls);
        console.log('새로운 이미지 URLs:', this.newImageUrls);

        const headers = {
          Authorization: `Bearer ${accessToken}`,
          sellerId: sellerId,
          'Content-Type': 'application/json'
        };

        await axios.put(`${process.env.VUE_APP_API_BASE_URL}/product-service/seller/packages/${this.productId}/update`, updateData, {
          headers: headers
        });
        this.successModal = true;

        // 에디터 초기화 및 폼 리셋
        if (this.editorInstance) {
          this.editorInstance.destroy();
          this.editorInstance = null;
        }
        this.isEditorVisible = false;
        this.resetForm();
      } catch (error) {
        console.error('상품 수정 실패:', error);
        this.validationMessage = error.response?.data?.message || '상품 수정 중 문제가 발생했습니다.';
        this.validationModal = true;
      }
    },

    closeSuccessModal() {
      this.successModal = false;
      this.$nextTick(() => {
        // 모달이 닫힌 후 페이지 이동
        this.$router.push({ 
          name: 'FarmPackageDetail',
          params: { packageId: this.productId } 
        });
      })
    },

    closeValidationModal() {
      this.validationModal = false;
    },

    // 폼 리셋 메서드
    resetForm() {
      this.productName = '';
      this.productDescription = '';
      this.detailedProductDescription = '';
      this.price = '';
      this.deliveryPeriod = 1;
      this.origin = '';
      this.imageUrls = [];
      this.newImageUrls = [];
      this.deleteImageUrls = [];
      this.currentIndex = 0;
      if (this.editorInstance) {
        this.editorInstance.setHTML('');
      }
    },

    onAfterEnter() {
      if (!this.editorInstance) {
        this.initializeEditor();
      }
    },

    onBeforeLeave() {
      if (this.editorInstance) {
        this.detailedProductDescription = this.editorInstance.getHTML(); // 에디터 내용 저장
        this.editorInstance.destroy();
        this.editorInstance = null;
      }
    },

    handleConfirmHideEditor() {
      this.confirmHideEditorModal = false;
      this.isEditorVisible = false;
      // 에디터 소멸은 onBeforeLeave에서 처리
    },
  },
};
</script>

<style scoped>
.product-register-page-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.product-register-page {
  display: flex;
  flex-direction: column; /* 수직 정렬 */
  align-items: flex-start; /* 왼쪽 정렬로 변경하여 폼이 오른쪽에 위치하도록 */
  padding: 20px;
  width: 80%;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  margin: 0 auto; /* 좌우 중앙 정렬 */
}

.image-upload {
  width: 100%;
  margin-bottom: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.image-slider {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
}

.slider-wrapper {
  display: flex;
  justify-content: center;
  width: 300px;
  overflow: hidden;
  position: relative;
}

.image-slide {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-preview {
  width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
}

.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.delete-btn:hover {
  background-color: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.add-image-box {
  width: 300px;
  height: 300px;
  background-color: #f0f0f0;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.image-input {
  display: none;
}

.upload-icon {
  font-size: 36px;
  color: #666;
  cursor: pointer;
}

.slider-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  padding: 10px;
  border: none;
  cursor: pointer;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease;
}

.slider-btn:hover {
  background-color: rgba(107, 104, 104, 0.7);
}

.prev-btn {
  left: -1px;
}

.next-btn {
  right: -1px;
}

.slider-btn v-icon {
  font-size: 24px;
  color: black;
}

.product-info {
  width: 100%;
  margin-bottom: 20px;
  /* 기존 폼이 오른쪽에 정렬되도록 유지 */
}

.input-group {
  width: 100%;
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

input,
textarea,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  background-color: #f9f9f9;
}

textarea {
  resize: none;
  height: 100px;
}

.button-group {
  display: flex;
  justify-content: flex-end; /* 오른쪽 정렬 */
  gap: 20px; /* 버튼 사이 간격 */
  margin-bottom: 20px;
  width: 100%;
}

.submit-button {
  width: 150px;
  padding: 10px;
  background-color: #bcc07b;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 15px;
  color: black;
}

.submit-button:hover {
  background-color: #9ca06b;
}

.successModal {
  background-color: rgb(255, 255, 255);
  border: none;
  box-shadow: none;
  border-radius: 10px;
  width: 300px;
}

.validationModal {
  background-color: rgb(255, 255, 255);
  border: none;
  box-shadow: none;
  border-radius: 10px;
  width: 340px;
  white-space: pre-line;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}
</style>
