<template>
    <v-carousel cycle :show-arrows="false" delimiter-icon="mdi-square" delimiter-color="light_green" height="510"
        interval="5000" hide-delimiter-background> <!--4초마다 슬라이드-->
        <v-carousel-item v-for="(image, index) in images" :key="index" style="overflow: hidden;">
            <img :src="image.src" :alt="image.alt" class="banner-img" />
        </v-carousel-item>
    </v-carousel>


    <!-- 인기 농장 -->
    <br>
    <v-container class="farm-container">
        <div class="text-center info-title" style="border-radius:12px;">
            동상이농 (同床利農), 같은 상상 서로 다른 이익 
        </div>
        <br />
        <div class="text-center info-content">
            소비자는 신선한 농산물을 저렴하고 편리하게 구매하고 싶고, <br />
            농가는 직거래를 통해 신선한 농산물을 손쉽게 전달하고 싶습니다. <br />
            <br />
            '동상이농'은 이 둘의 같은 상상을 연결해, <br />
            서로의 꿈을 같은 방향으로 실현할 수 있는 직거래 플랫폼을 제공합니다.
        </div>
        <br />
        <br />
        <!-- 1번 카드 섹션 -->
        <div class="content-wrap">
            <div>
                <div class="info-image">
                    <img src="/vege.png" alt="1" style="width: 70%;">
                </div>
                <div>
                    <p style="text-align: center;"><span
                            style="font-size: 22px; border-radius:3px; background-color:#ffeecc">
                            높은 가치의 농산물을
                        </span></p>
                    <br />
                    <div class="text-center content-text">
                        실시간으로 직접 확인한 싱싱한 농산물을 <br />
                        가장 좋은 품질로만 철저하게 선정해 제공합니다.
                    </div>
                </div>
            </div>

            <!-- 2번 카드 섹션 -->
            <div>
                <div class="info-image">
                    <img src="/farmer.png" alt="2" style="width: 70%;">
                </div>
                <div>
                    <p style="text-align: center;"><span
                            style="font-size: 22px; border-radius:3px; background-color:#ffeecc">
                            가장 신선할 때</span></p>
                    <br />
                    <div class="text-center content-text">
                        최적의 수확 시점에 수확한 농산물을 <br />
                        싱싱한 상태 그대로 농부가 직접 보내드립니다.
                    </div>
                </div>
            </div>

            <!-- 3번 카드 섹션 -->
            <div>
                <div class="info-image">
                    <img src="/eating.png" alt="3" style="width: 70%;">
                </div>
                <div>
                    <p style="text-align: center;"><span
                            style="font-size: 22px;border-radius:3px; background-color:#ffeecc">
                            우리집 식탁으로
                        </span></p>
                    <br />
                    <div class="text-center content-text">
                        라이브 방송으로 보았던 신선한 농산물이 <br />
                        우리집 식탁에 오르는 행복을 경험해보세요 !
                    </div>
                </div>
            </div>
        </div>
        <br />
        <br />
        <br />
        <!-- <div class="hr-style"></div> -->
        <br />
        <br />
        <!-- 제목 -->
        <v-col cols="12">
            <div class="text-center slide-title" @click="this.$router.push('/farm')">
                🏠 Farm Best 9 🏠
                <v-icon icon="mdi-chevron-right" style="font-size: 46px;" />
            </div>
            <p class="text-center" style="color: grey; font-size: 16px;">즐겨찾기 수가 많은 농장들입니다.</p>
        </v-col>
        <br>

        <BestFarmSlide />

        <br><br>
        <div class="hr-style"></div>
        <br>
    </v-container>
    <!-- 인기 농장 끝 -->

    <!-- 인기 패키지 -->
    <v-container>
        <div class="text-center info-title" style="border-radius:12px;">
            신선한 농산물을 당일 배송으로 받아보세요!
        </div>
        <br />
        <div class="text-center info-content">
            당일에 신선한 농산물을 받아볼 수 있는 편리함! <br />
            농장에서 바로 배송된 식품을 신선하게 즐길 수 있는 기회를 제공합니다. <br />
            <br />
            '동상이농'은 신선함을 최우선으로 생각하며, <br />
            언제 어디서나 손쉽게 주문하고 즉시 받아볼 수 있는 서비스를 제공합니다.
        </div>

        <br />
        <br />
        <v-row cols="12">
            <v-col cols="6" style="text-align: center;">
                <img src="/grain.jpg" width="100%">
                <br>
                <h5 style="text-align: center; margin-top: 10px;"><span style="font-size: 19px; color: rgb(51, 51, 51);">
                        ✔️ 당일 신선 배송 서비스</span></h5>
                <br />
                <span style="font-size: 16px; color: rgb(102, 102, 102);">
                    오늘 농부가 발송하면 오늘 우리집 식탁에 ! <br />
                    빠르고 간편하게 농장에서 바로 여러분의 집으로, 신선함을 그대로 전달합니다. <br />
                    믿을 수 있는 품질로 여러분의 식탁을 더욱 풍성하게 만들어 드립니다.
                </span>
            </v-col>
            <v-col cols="6" style="text-align: center;">
                <img src="/farm-pic.jpg" width="100%">
                <br>
                <h5 style="text-align: center; margin-top: 10px;"><span style="font-size: 19px; color: rgb(51, 51, 51);">
                        ✔️ 도시에서 만나는 농장</span></h5>
                <br />
                <span style="font-size: 16px; color: rgb(102, 102, 102);">
                    다양한 농산물을 손쉽게 선택하고 주문하세요! <br />
                    언제 어디서나 간편하게 접근할 수 있는 동상이농으로, <br />
                    원하는 신선한 농산물을 빠르게 받아보는 즐거움을 누리실 수 있습니다.
                </span>
            </v-col>
        </v-row>
        <br />
        <br />
        <br />
        <!-- <div class="hr-style"></div> -->
        <br />
        <br />
        <div style="margin-bottom: 40px; padding-top: 20px; display: flex; justify-content: center;">
            <div>
                <div class="text-center slide-title" @click="this.$router.push('/product')">
                    🥦 Best Packages 🥦
                    <v-icon icon="mdi-chevron-right" style="font-size: 46px;" />
                </div>
                <p class="text-center" style="color: grey; font-size: 16px;">가장 많이 팔린 패키지를 주문해보세요.</p>
            </div>
        </div>
        <BestPackageSlide />

    </v-container>
    <!-- 인기 패키지 끝 -->

    <v-dialog v-model="this.loginModal" max-width="300px">
        <v-card class="modal"
            style="align-items: center; text-align: center; height: 160px; padding-bottom: 20px; overflow-y: hidden;">
            <v-card-text>
                로그인이 필요한 서비스입니다.<br>
                로그인 하시겠습니까?
            </v-card-text>
            <v-row>
                <v-btn @click="this.$router.push('/member/sign-in')" class="submit-btn"
                    style="background-color: #BCC07B;">로그인하기</v-btn>
                <v-btn @click="this.loginModal = false" class="submit-btn"
                    style="background-color: #e0e0e0;">닫기</v-btn>
            </v-row>

        </v-card>
    </v-dialog>


    <v-dialog v-model="this.sellerModal" max-width="300px">
        <v-card class="modal"
            style="align-items: center; text-align: center; height: 160px; padding-bottom: 20px; overflow-y: hidden;">
            <v-card-text>
                판매자 회원은 다른 농장을<br>즐겨찾기할 수 없습니다.
            </v-card-text>
            <v-row>
                <v-btn @click="this.sellerModal = false" class="submit-btn"
                    style="background-color: #e0e0e0;">닫기</v-btn>
            </v-row>

        </v-card>
    </v-dialog>

</template>
<script>
import BestFarmSlide from '@/components/slide/BestFarmSlide.vue';
import BestPackageSlide from '@/components/slide/BestPackageSlide.vue';
import axios from 'axios';
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export default {
    components: {
        BestPackageSlide,
        BestFarmSlide,
    },
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },
    data() {
        return {
            images: [],
            farmWindowCount: 0,
            onboarding: 1,
            scrollPosition: 0,
            farmList: [],
            farmOnboarding: 1,
            likes: [], // 0: 안눌려있는 상태, 1: 눌려있는 상태, 2: 눌리고 있는 상태(애니메이션처리)
            likeCount: [],
            isLiveListInView: false,
        }
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    },
    methods: {
        saveScrollPosition() {
            this.scrollPosition = window.scrollY;  // 현재 스크롤 위치 저장
        },
        restoreScrollPosition() {
            window.scrollTo(0, this.scrollPosition);  // 저장된 스크롤 위치로 이동
        },
        clickLike(idx, farmId) {
            try {

                if (this.likes[Number(idx)] != 0 && this.likes[Number(idx)] != 1) {
                    return;
                }
                axios.post(`${process.env.VUE_APP_API_BASE_URL}/member-service/favorites/farm/${farmId}`);

                let ret;

                if (this.likes[Number(idx)] == 0) {
                    this.likes[Number(idx)] = 2;
                    this.likeCount[Number(idx)] += 1;
                    ret = 1;
                } else if (this.likes[Number(idx)] == 1) {
                    this.likes[Number(idx)] = 3;
                    this.likeCount[Number(idx)] -= 1;
                    ret = 0
                } else {
                    return;
                }

                setTimeout(() => {
                    this.likes[Number(idx)] = ret;  // 1초 후에 liked 상태 정적인 상태로 변경
                }, 1000);  // 1초 동안 하트 표시

            } catch (e) {
                console.log(e);

            }
        },
        handleScroll() {
            const liveListComponent = this.$refs.liveListBest;
            if (liveListComponent && liveListComponent.$el) {
                const rect = liveListComponent.$el.getBoundingClientRect();
                const windowHeight = (window.innerHeight || document.documentElement.clientHeight);

                if (rect.top <= windowHeight && rect.bottom >= 0) {
                    // LiveListBest가 뷰포트 안에 있음
                    if (!this.isLiveListInView) {
                        this.isLiveListInView = true;
                        liveListComponent.playPreviewAll();
                    }
                } else {
                    // LiveListBest가 뷰포트 밖에 있음
                    if (this.isLiveListInView) {
                        this.isLiveListInView = false;
                        liveListComponent.stopAllPreviews();
                    }
                }
            }
        },
    },
    async created() {
        // 테스트용 임시 데이터
        this.images = [
            { "src": "https://dongsanginong-bucket.s3.ap-northeast-2.amazonaws.com/mainpage/main_banner1.png", "alt": "배너사진1", "link": "/event2" },
            { "src": "https://dongsanginong-bucket.s3.ap-northeast-2.amazonaws.com/farm/c556f77b-55c7-484e-b923-ce7fb7b00a01banner6", "alt": "배너사진5", "link": "/event2" },
            { "src": "https://dongsanginong-bucket.s3.ap-northeast-2.amazonaws.com/mainpage/main_banner2.png", "alt": "배너사진2", "link": "/event2" },
            { "src": "https://dongsanginong-bucket.s3.ap-northeast-2.amazonaws.com/mainpage/main_banner3.png", "alt": "배너사진3", "link": "/event2" },
        ];


    },
    computed: {
        chunkedItems() {
            // 한 번에 4개씩 아이템을 나누어서 배열을 생성
            const chunkSize = 4;
            const result = [];
            for (let i = 0; i < this.items.length; i += chunkSize) {
                result.push(this.items.slice(i, i + chunkSize));
            }
            return result;
        }
    },
}
</script>
<style scoped>
.v-carousel-item {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    /* 넘치는 부분 감추기 */
    background-color: #f5f5f5;
}

.banner-img {
    width: 100%;
    /* 부모의 너비에 맞추기 */
    height: 100%;
    /* 부모의 높이에 맞추기 */
}

.text-center {
    text-align: center;
}

.package-img {
    width: 190px;
    height: 190px;
    border-radius: 10px;
    transition: transform 0.3s ease;
    /* 이미지 확대 시 부드러운 트랜지션 */
}

.package-img:hover {
    transform: scale(1.05);
    /* 이미지 확대 */
    transition: transform 0.3s ease;
    /* 이미지 확대 시 부드러운 트랜지션 */
    cursor: pointer;
}

.package-img-box {
    display: flex;
    border-radius: 10px;
    overflow: hidden;
    /* 영역을 넘어가는 부분을 잘라냄 */
    transition: all 0.3s ease;
    /* 부드러운 트랜지션 효과 */
}

.farm-img {
    width: 190px;
    height: 190px;
    border-radius: 10px;
    transition: transform 0.3s ease;
    /* 이미지 확대 시 부드러운 트랜지션 */
}

.farm-container {
    margin-top: 10px;
}

.slider-wrapper {
    width: 100%;
    overflow: hidden;
    position: relative;
}

.slider {
    display: flex;
    width: max-content;
    transition: transform 0.1s linear;
}

.card {
    flex-shrink: 0;
    width: 300px;
    margin: 0 10px;
}

.grade {
    width: 20px;
    height: 20px;
    min-width: 20px;
    text-align: center;
    line-height: 20px;
    background-color: #D8D8D8;
    margin-right: 7px;
    border-radius: 4px;
    color: #424242;
}

.top-grade {
    background-color: #FFE2A6;
    font-weight: bold;
    font-size: large;
    color: #DF7401;
}

.like-chip {
    border-radius: 4px;
}

.like-chip:hover {
    background-color: #FFE2A6;
    transition: 0.5s ease;
}

.selected-like-chip {
    background-color: #FFE2A6;
}

.heart-emoji {
    position: absolute;
    transform: translateX(-50%);
    /* 중앙 정렬을 위한 트랜스폼 */
    font-size: 24px;
    opacity: 0;
    /* 애니메이션 전에는 보이지 않도록 설정 */
    animation: popUp 1s ease-in-out forwards;
    /* 애니메이션 정의 */
    margin-left: 35px;
}

.card-outer {
    border: 1px #D4D4D4 solid;
    border-radius: 10px;
    padding: 5px;
    margin-bottom: 20px;
    transition: 0.5s ease;
}

.card-outer:hover {
    box-shadow: 10px 10px #5D5D5D, 0 25px 40px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22);
    transition: 0.7s ease;
}

.slide-title {
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;

}

.info-image {
    display: flex;
    justify-content: center;
}

.content-wrap {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
}

.content-text {
    font-size: 14px;
    color: rgb(153, 153, 153);
    border-radius: 12px;
}

.info-title {
    font-size: 27px;
    font-weight: bold;
}

.info-content {
    font-size: 17px;
}

.hr-style {
    border-bottom: 1px solid #efefef;
    border-radius: 3px;
}

@keyframes popUp {
    0% {
        opacity: 0;
        transform: translate(-50%, 0) scale(0);
        /* 처음에는 원래 위치에서 scale 0으로 시작 */
    }

    50% {
        opacity: 1;
        transform: translate(-50%, -50px) scale(1.5);
        /* 위로 이동하면서 크기 확대 */
    }

    100% {
        opacity: 0;
        transform: translate(-50%, -100px) scale(0);
        /* 더 위로 이동하면서 크기 축소 */
    }
}
</style>