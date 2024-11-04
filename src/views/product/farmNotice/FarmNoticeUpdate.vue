<template>
  <v-dialog v-model="dialog" max-width="550" class="custom-dialog">
    <v-card class="custom-card" style="padding-top: 20px; font-size: 15px;">
      <v-card-title class="custom-title">
        <span class="headline" style="font-size: 18px;">커뮤니티 수정</span>
      </v-card-title>
      <v-card-text style="font-size: 15px;">
        <form @submit.prevent="updateNotice">
          <div>
            <input 
              type="text" 
              v-model="notice.title" 
              id="title" 
              placeholder="제목을 입력하세요" 
              required 
              class="custom-input" />
          </div>
          <div>
            <textarea 
              v-model="notice.content" 
              id="content" 
              placeholder="내용을 입력하세요" 
              required 
              class="custom-input"></textarea>
          </div>
          <div>
            <input 
              type="file" 
              @change="handleFileSelection" 
              class="custom-input" 
              ref="fileInput" 
              multiple />
          </div>
          <div v-if="filePreviews.length">
            <p style="font-weight: 400;">선택된 파일:</p>
            <ul class="preview-list">
              <li v-for="(preview, index) in filePreviews" :key="index" class="preview-container">
                <div class="image-wrapper">
                  <img :src="preview.url" class="preview-image" alt="선택된 이미지" />
                  <v-btn icon @click="removeFile(index)" class="remove-btn">
                    <v-icon color="#BCC07B">mdi-close-circle</v-icon>
                  </v-btn>
                </div>
              </li>
            </ul>
          </div>
        </form>
      </v-card-text>
      <v-card-actions class="action-buttons">
        <v-spacer />
        <v-btn 
          class="custom-button"
          @click="updateNotice"
          style="background-color: #BCC07B; margin-right: 10px;"
        >
          수정
        </v-btn>
        <v-btn 
          class="custom-button" 
          @click="showConfirmCloseModal"
          style="background-color: #e0e0e0; margin-right: 15px;"
        >
          닫기
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 닫기 확인 모달 -->
  <v-dialog v-model="confirmCloseModal" max-width="300px">
    <v-card class="modal" style="text-align: center;">
      <v-card-text style="margin-top: 3px;">정말 닫으시겠습니까?</v-card-text>
      <span style="color: gray; font-size: 13px; margin-top: -10px">현재 작성중인 내용은 저장되지 않습니다.</span><br>
      <v-card-actions class="action-buttons" style="justify-content: center; margin-left: 2%; margin-top: -6%;">
        <v-btn @click="closeDialog" class="custom-button">닫기</v-btn>
        <v-btn @click="confirmCloseModal = false" class="custom-close-button">취소</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    noticeId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      notice: {
        title: '',
        content: '',
        imageUrls: []
      },
      dialog: false,
      confirmCloseModal: false, // 닫기 확인 모달 상태
      selectedFiles: [],
      filePreviews: [],
    };
  },
  methods: {
    async openEditDialog() {
      this.dialog = true;
      try {
        const farmId = this.$route.params.farmId;
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/product-service/farm/no-auth/${farmId}/notice/${this.noticeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        this.notice.title = data.title;
        this.notice.content = data.content;
        this.notice.imageUrls = data.noticeImages || [];
        this.filePreviews = this.notice.imageUrls.map(url => ({ url }));
      } catch (error) {
        console.error('Error fetching notice data:', error);
      }
    },
    async handleFileSelection(event) {
      const files = Array.from(event.target.files);
      for (const file of files) {
        this.selectedFiles.push(file);
        const s3Url = await this.uploadImage(file);
        this.filePreviews.push({ url: s3Url, file });
      }
      this.$refs.fileInput.value = null;
    },
    removeFile(index) {
      this.selectedFiles.splice(index, 1);
      this.filePreviews.splice(index, 1);
      if (index < this.notice.imageUrls.length) {
        this.notice.imageUrls.splice(index, 1);
      }
    },
    async uploadFiles() {
      const uploadedImageUrls = [];
      for (let file of this.selectedFiles) {
        const imageUrl = await this.uploadImage(file);
        uploadedImageUrls.push(imageUrl);
      }
      this.notice.imageUrls = [...this.notice.imageUrls, ...uploadedImageUrls];
    },
    async uploadImage(blob) {
      const accessToken = localStorage.getItem('accessToken');
      const body = {
        prefix: "community-notice",
        url: `${blob?.name}`,
      };
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };
      const getUrl = await fetch(`${process.env.VUE_APP_API_BASE_URL}/product-service/api/upload/presigned-url`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });

      const getUrlResult = await getUrl.text();
      const awsUrl = {
        data: `${getUrlResult.split("?")[0]}`,
        auth: `?${getUrlResult.split("?")[1]}`,
      };

      const options = {
        method: "PUT",
        headers: {
          "Content-Type": blob.type,
        },
        body: blob,
      };
      await fetch(awsUrl.data + awsUrl.auth, options);

      return awsUrl.data;
    },
    async updateNotice() {
      await this.uploadFiles();

      const remainingImageUrls = this.filePreviews.map(preview => preview.url);

      const requestData = {
        title: this.notice.title,
        content: this.notice.content,
        imageUrls: remainingImageUrls,
      };

      const accessToken = localStorage.getItem('accessToken');
      try {
        await fetch(`${process.env.VUE_APP_API_BASE_URL}/product-service/farm/notice/${this.noticeId}/update`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });
        this.$emit('notice-updated');
        this.dialog = false;
      } catch (error) {
        console.error('공지사항 수정 실패:', error);
      }
    },
    showConfirmCloseModal() {
      this.confirmCloseModal = true;
    },
    closeDialog() {
      this.dialog = false;
      this.confirmCloseModal = false;
      this.resetFormData();
    },
    resetFormData() {
      this.notice = {
        title: '',
        content: '',
        imageUrls: []
      };
      this.selectedFiles = [];
      this.filePreviews = [];
    },
  },
};
</script>

<style scoped>
/* form 스타일 */
form {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

button {
  margin-top: 1em;
}

.custom-input {
  width: 100%;
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1em;
}

textarea.custom-input {
  resize: vertical;
  min-height: 300px;
}

.preview-list {
  display: flex;
  gap: 10px;
  list-style-type: none;
  padding: 0;
  margin-bottom: 10px;
}

.preview-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
}

.preview-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: black;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.custom-dialog {
  padding: 10px;
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
}

.action-buttons {
  margin-bottom: 10px;
  gap: 5px;
}

.custom-button {
  background-color: #BCC07B;
  color: black !important;
  transition: background-color 0.3s ease;
  border-radius: 50px;
}

.custom-close-button{
  background-color: #e0e0e0e0;
  color: black !important;
  transition: background-color 0.3s ease;
  border-radius: 50px;
}

.modal {
  background-color: rgb(255, 255, 255);
  border: none;
  box-shadow: none;
  border-radius: 10px;
}

.submit-btn {
  margin-left: 10px;
  margin-top: 8px;
  background-color: #BCC07B;
  color: black;
  border-radius: 50px;
}
</style>
