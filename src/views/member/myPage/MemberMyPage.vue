<template>
    <!-- 회원 탈퇴 확인 모달 -->
    <div v-if="isModalOpen" class="modal">
        <div class="modal-content">
            <h3 class="modal-title">동상이농 회원 탈퇴</h3>
            <p>정말 탈퇴하시겠습니까?</p>

            <input type="text" v-model="confirmationText" placeholder="탈퇴하시려면 [동상이농 탈퇴] 를 입력하세요." class="form-input"
                @keydown.enter="submitWithdraw" />

            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

            <div class="button-group">
                <button @click="submitWithdraw" class="withdraw-button">탈퇴하기</button>
                <button @click="closeModal" class="close-button">취소</button>
            </div>
        </div>
    </div>

    <!-- 완료 모달 -->
    <v-dialog v-model="alertModal" max-width="300px">
        <v-card class="modal" style="align-items: center; text-align: center; height: 160px; padding-bottom: 20px; top: -100px; background-color: white;
        overflow-y: hidden;">
            <v-card-text style="margin-top: 20px;">탈퇴가 완료되었습니다.</v-card-text>
            <v-btn @click="handleAlertClose" class="submit-btn">닫기</v-btn>
        </v-card>
    </v-dialog>

    <div class="member-page" style="padding-right: 300px;">
        <MemberSidebar />
        <h3 style="margin-right: 78%;">내 정보 조회</h3>
        <br>
        <div class="member-info" style="padding-top: 5%;">
            <div>
                <div style="margin-left: 7%;">
                    <v-row>
                        <v-col cols="2" class="d-flex" style="margin-top: 2%;">
                            <i class="mdi mdi-pencil"></i>&nbsp;
                            <label style="font-size: 16px; font-weight: 400;">이름</label>
                        </v-col>
                        <v-col cols="9">
                            <v-text-field type="text" readonly :value="memberInfo.name" />
                        </v-col>
                    </v-row>
                </div>
                <div style="margin-left: 7%;">
                    <v-row>
                        <v-col cols="2" class="d-flex" style="margin-top: 2%;">
                            <i class="mdi mdi-mail"></i>&nbsp;
                            <label style="font-size: 16px; font-weight: 400;">이메일</label>
                        </v-col>
                        <v-col cols="9">
                            <v-text-field type="text" readonly :value="memberInfo.email" />
                        </v-col>
                    </v-row>
                </div>
                <div style="margin-left: 7%;">
                    <v-row>
                        <v-col cols="2" class="d-flex" style="margin-top: 2%;">
                            <i class="mdi mdi-phone"></i>&nbsp;
                            <label style="font-size: 16px; font-weight: 400;">전화번호</label>
                        </v-col>
                        <v-col cols="9">
                            <v-text-field type="text" readonly :value="memberInfo.phone" />
                        </v-col>
                    </v-row>
                </div>
                <div style="margin-left: 7%;">
                    <v-row>
                        <v-col cols="2" class="d-flex" style="margin-top: 2%;">
                            <i class="mdi mdi-map-marker"></i>&nbsp;
                            <label style="font-size: 16px; font-weight: 400;">우편번호</label>
                        </v-col>
                        <v-col cols="9">
                            <v-text-field type="text" readonly :value="memberInfo.zipcode" />
                        </v-col>
                    </v-row>
                </div>
                <div style="margin-left: 7%;">
                    <v-row>
                        <v-col cols="2" class="d-flex" style="margin-top: 2%;">
                            <i class="mdi mdi-home"></i>&nbsp;
                            <label style="font-size: 16px; font-weight: 400;">배송지</label>
                        </v-col>
                        <v-col cols="9">
                            <v-text-field type="text" readonly :value="`${memberInfo.address} ${memberInfo.addressDetail}`" />
                        </v-col>
                    </v-row>
                </div>
            </div>

            <div class="footer">
                <div class="withdraw-container">
                    <a class="withdraw" @click="confirmWithdraw" style="margin-top: -6%; margin-right: 8%;">탈퇴하기</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import MemberSidebar from '@/components/sidebar/MemberSidebar.vue';

export default {
    components: {
        MemberSidebar
    },
    data() {
        return {
            memberInfo: {
                name: '',
                email: '',
                phone: '',
                address: '',
                addressDetail: '',
                zipcode: ''
            },
            loading: false,
            error: null,
            isModalOpen: false,
            confirmationText: '',
            errorMessage: '',
            alertModal: false
        };
    },
    methods: {
        async fetchMemberInfo() {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/member-service/member/member-info`, {
                    headers: {
                        "myId": localStorage.getItem("memberId")
                    }
                });
                this.memberInfo = response.data;
            } catch (error) {
                this.error = error.response ? error.response.data.message : error.message;
            } finally {
                this.loading = false;
            }
        },
        confirmWithdraw() {
            this.isModalOpen = true; // Open the confirmation modal
        },
        async withdraw() {
            this.loading = true;
            this.error = null;
            try {
                await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/member-service/member/withdraw`, {
                    headers: {
                        "myId": localStorage.getItem('memberId')
                    }
                });
                localStorage.clear();
                this.isModalOpen = false;
                this.alertModal = true;
                console.log("탈퇴 성공: alertModal 상태", this.alertModal);
            } catch (error) {
                console.log(error);
            } finally {
                this.loading = false;
            }
        },
        submitWithdraw() {
            if (this.confirmationText === "동상이농 탈퇴") {
                this.withdraw();
            } else {
                this.errorMessage = "올바른 텍스트를 입력하세요.";
            }
        },
        closeModal() {
            this.isModalOpen = false;
            this.confirmationText = ''; 
            this.errorMessage = '';
        },
        handleAlertClose() {
            this.alertModal = false;
            window.location.href = '/';
        }
    },
    mounted() {
        this.fetchMemberInfo();
    }
};
</script>

<style scoped>
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.modal-content {
    background-color: white;
    padding: 40px;
    border-radius: 5px;
    width: 500px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #333;
}

.form-input {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-sizing: border-box;
    margin-bottom: 20px;
}

.modal-title+p {
    margin-bottom: 20px;
    /* Adjust space between text and input */
}

.error-message {
    color: red;
    margin-bottom: 10px;
}

.button-group {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

.withdraw-button {
    background-color: #BCC07B;
    color: black;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    flex: 1;
    margin-right: 10px;
}

.close-button {
    background-color: #e0e0e0;
    color: black;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    flex: 1;
}

.withdraw-button:hover {
    background-color: #a4b06f;
}

.close-button:hover {
    background-color: #CFCFCF;
}

.submit-btn {
    margin-left: 10px;
    background-color: #BCC07B;
    color: black;
    border-radius: 50px;
}

label {
    font-weight: 900;
    font-size: large;
}

.member-page {
    background-color: #F3F3F3;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
    flex-direction: column;
}

.member-info {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 10px 40px;
    width: 905px;
    min-height: 550px;
    margin-left: 20%;
    background-color: white;
}

/* .header {
    margin-bottom: 20px;
} */

/* .info-container {
    display: grid;
    grid-template-columns: 4fr auto 6fr;
    gap: 20px;
    align-items: center;
    width: 100%;
    flex-grow: 1;
} */

.label {
    display: flex;
    color: #4a4a4a;
    flex-direction: column;
    height: 100%;
    text-align: left;
    justify-content: space-evenly;
    align-items: flex-start;
    padding-left: 100px;
    width: fit-content;
}

.value {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-evenly;
    text-align: left;
    padding-left: 100px;
}

.value p {
    margin: 0;
}

h2 {
    margin: 0;
    font-size: 24px;
}

.horizontal-divider {
    width: 100%;
    border: none;
    border-top: 1px solid #ccc;
    margin: 20px 0;
}

.footer {
    display: flex;
    flex-direction: column;
    margin-top: auto;
}

.withdraw-container {
    width: 100%;
    display: flex;
    justify-content: flex-end;
}

.withdraw {
    color: #999;
    font-size: 14px;
    cursor: pointer;
    text-decoration: none;
}

.divider {
    width: 1px;
    background-color: #ccc;
    height: 100%;
}
</style>
