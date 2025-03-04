<template>
    <div class="member-page" style="padding-right: 300px;">
        <MemberSidebar />
        <h3 style="margin-right: 78%;">내 쿠폰함</h3><br>
        <div class="member-change-coupon">

            <!-- 쿠폰 리스트 -->
            <v-container fluid>
                <br>
                <v-row justify="center">
                    <!-- 쿠폰 리스트  -->
                    <v-col cols="12" md="12">
                        <v-row class="coupon-grid" justify="start">
                            <div
                                v-for="(coupon, index) in paginatedCoupons"
                                :key="coupon.couponId"
                                :class="{'coupon-item': true, 'bottom-row': index >= 3}"
                            >
                                <div class="coupon-content" style="margin-top: 4%;">
                                    <p class="coupon-name">{{ coupon.couponName }}</p>
                                    <p class="coupon-discount">{{ coupon.discountPercentage }}%</p>
                                </div>
                                <p class="coupon-expiration">유효기간: {{ formatDateTime(coupon.expiration) }}</p>
                            </div>
                        </v-row>
                    </v-col>
                </v-row>

                <!-- Pagination -->
                <v-row justify="center" class="pagination-buttons">
                    <v-btn icon @click="prevPage" :disabled="currentPage === 1">
                        <v-icon>mdi-menu-left</v-icon>
                    </v-btn>
                    <v-btn icon @click="nextPage" :disabled="isLastPage">
                        <v-icon>mdi-menu-right</v-icon>
                    </v-btn>
                </v-row>
            </v-container>
        </div>
    </div>

    <v-dialog v-model="alertModal" max-width="300px">
        <v-card class="modal" style="align-items: center; text-align: center; height: 130px; padding-bottom: 20px; overflow-y: hidden;">
            <v-card-text style="margin-bottom:5px">{{ modalMessage }}</v-card-text>
            <v-btn @click="handleAlertClose" class="submit-btn" style="border-radius: 50px; width: 100px">닫기</v-btn>
        </v-card>
    </v-dialog>

    <v-dialog v-model="errorModal" max-width="300px">
        <v-card class="modal" style="align-items: center; text-align: center;">
            <v-card-text>쿠폰 리스트 갱신 중 오류가 발생했습니다. 다시 시도해주세요.</v-card-text>
            <v-btn @click="handleCloseErrorModal" class="submit-btn" width="100px">닫기</v-btn>
        </v-card>
    </v-dialog>
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
            couponList: [], // 쿠폰 리스트 데이터
            currentPage: 1, // 현재 페이지
            itemsPerPage: 6, // 한 페이지에 표시할 쿠폰 수 (가로 3개 * 세로 2개)
            isLastPage: false, // 마지막 페이지 여부
            alertModal: false,
            errorModal: false,
            modalMessage: '',
            loading: false
        };
    },
    computed: {
        paginatedCoupons() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.couponList.slice(start, end); // 페이지에 해당하는 쿠폰 리스트 반환
        }
    },
    methods: {
        async getCouponList() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/order-service/coupon/downloaded-coupon`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                // 유효기간이 지난 쿠폰을 필터링하고 유효기간이 임박한 순서대로 정렬
                const currentDateTime = new Date();
                this.couponList = response.data
                    .filter(coupon => new Date(coupon.expiration) > currentDateTime && coupon.useYn === 'N')
                    .sort((a, b) => new Date(a.expiration) - new Date(b.expiration));
                this.checkIfLastPage();
            } catch (error) {
                console.error('쿠폰 리스트 로드 실패:', error);
                this.errorModal = true;
            }
        },
        nextPage() {
            if (!this.isLastPage) {
                this.currentPage++;
                this.checkIfLastPage();
            }
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.isLastPage = false;
            }
        },
        checkIfLastPage() {
            const totalItems = this.couponList.length;
            const totalPages = Math.ceil(totalItems / this.itemsPerPage);
            this.isLastPage = this.currentPage >= totalPages;
        },
        formatDateTime(dateString) {
            const date = new Date(dateString);
            const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
            return date.toLocaleString(undefined, options); // 날짜 포맷
        },
        handleAlertClose() {
            this.alertModal = false;
        },
        handleCloseErrorModal() {
            this.errorModal = false;
        },
    },
    mounted() {
        this.getCouponList(); // 컴포넌트 로드 시 쿠폰 리스트 불러오기
    }
};
</script>

<style scoped>
/* 스타일 그대로 유지 */
.member-page {
    background-color: #F3F3F3;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
    flex-direction: column;
}

.member-change-coupon {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 15px 10px;
    width: 905px;
    min-height: 550px;
    margin-left: 20%;
    background-color: white;
}

.coupon-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    row-gap: 80px; /* 세로 쿠폰 간의 간격 유지 */
    column-gap: 20px; /* 가로 간격 유지 */
}

.coupon-item {
    width: 270px;
    height: 140px;
    background-image: url('/public/coupon3.png');
    background-size: cover;
    background-position: center;
    position: relative;
}

.coupon-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start; /* 왼쪽 정렬 */
    height: 90%;
    padding-left: 45px; /* 왼쪽으로 40px 이동 */
    transform: translateY(20px); /* 아래로 20px 이동 */
}

/* 유효기간 텍스트를 쿠폰 이미지 아래로 배치 */
.coupon-expiration {
    font-size: 13px;
    color: grey;
    margin-top: -5px;
    text-align: center;
}

.coupon-name {
    font-size: 12px;
    margin-bottom: 20px;
    margin-top: -15px;
    white-space: pre-wrap; 
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-width: 60%;
}

.coupon-discount {
    font-size: 28px;
    margin-bottom: 50px;
}

.pagination-buttons {
    margin-top: 8%;
    margin-bottom: 2%;
    display: flex;
    gap: 10px;
    background-color: white;
}

.horizontal-divider {
    border: none;
    border-top: 1px solid #ddd;
    margin: 20px 0;
}
</style>
