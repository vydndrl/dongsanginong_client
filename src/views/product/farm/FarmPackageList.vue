<template>
    <FarmMenuComponent :currentMenu="1"/>
    <br>
    <v-container fluid style="padding-left: 250px;"> 
      <!-- 에러 메시지 출력 -->
      <v-row v-if="errorMessage">
        <v-col>
          <v-alert type="error">
            {{ errorMessage }}
          </v-alert>
        </v-col>
      </v-row>
  
      <!-- 패키지 리스트 -->
      <v-row v-else justify="start" style="gap: 10px;">
        <v-col
          v-for="packageProduct in displayedPackageList"
          :key="packageProduct.packageId"
          cols="12"
          sm="6"
          md="3"
          class="d-flex justify-start"
          style="margin:9px; padding: 0px;"
        >
          <v-card 
            elevation="0" 
            class="v-card" 
            style="width: 100%; height: 470px; padding: 0px;"
            @click="goToPackageDetail(packageProduct.packageId)"
          >
            <v-img
              :src="packageProduct.imageUrl || 'https://your-default-image-url.com/default.png'"
              alt="Package Image"
              class="square-image"
              cover
            ></v-img>
            <v-chip
              style="position: absolute; top: 10px; left: 10px; padding: 5px 10px; border-radius: 8px; background-color: rgba(128, 128, 128, 0.9); color: white;">
              {{ packageProduct.deliveryCycle }}일 주기 배송🚚
            </v-chip>

            <!-- 위시리스트 버튼 추가 -->
            <v-btn style="width: 100%; margin-top:10px; border: 0.5px solid gray; box-shadow: none;"
                  @click.stop="addToWishList(packageProduct)" v-if="member">
                <div v-if="wishAnimation.get(packageProduct.packageId)" class="heart-emoji">
                    <svg-icon type="mdi" :path="mdiHeart" class="icon-colored"></svg-icon>
                </div>
                <svg-icon type="mdi" :path="wishlistItems[packageProduct.packageId] ? mdiHeart : mdiHeartOutline"
                    :style="{ marginRight: '2px', color: wishlistItems[packageProduct.packageId] ? 'red' : 'black' }"
                    class="heart-icon"></svg-icon>
                <span style="font-size: 14px;">{{ wishlistItems[packageProduct.packageId] ? '위시리스트 취소' : '위시리스트 담기' }}</span>
            </v-btn>

            <div v-if="packageProduct.discountId != null && packageProduct.discountActive == true">
              <v-card-text style="padding-left: 0px;">
                <span style="font-size:medium; font-weight: 400;" v-if="packageProduct.packageName.length > 10">
                  {{ packageProduct.packageName.substring(0, 10) }}...
                </span>
                <span style="font-size:medium; font-weight: 400;" v-else>
                  {{ packageProduct.packageName }}
                </span>
                <br />
                <p style="text-decoration: line-through; color: #999; font-size: 14px;">{{ formatPrice(packageProduct.price) }}</p>
                <div style="margin-bottom: 2px;">
                    <span style="color:darkgreen; font-size:medium;">{{ formatPrice(packageProduct.price - packageProduct.discount) }}&nbsp;&nbsp;</span>
                    <span class="sale-style">SALE</span>
                </div>
                <span style="color:#999; font-size: small;"> 1회 제공 금액 {{
                    formatPrice(getPerCyclePrice(packageProduct.price - packageProduct.discount, packageProduct.deliveryCycle)) }} </span>
                <br />
                <span style="color:#999; font-size: small;">
                  🧾 누적 주문 {{ packageProduct.orderCount }}
                </span>
              </v-card-text>
            </div>
            <div v-else>
              <v-card-text style="padding-left: 0px;">
                <span style="font-size:medium; font-weight: 400;" v-if="packageProduct.packageName.length > 10">
                  {{ packageProduct.packageName.substring(0, 10) }}...
                </span>
                <span style="font-size:medium; font-weight: 400;" v-else>
                  {{ packageProduct.packageName }}
                </span>
                <br />
                <span style="color:darkgreen; font-size:medium;">
                  {{ formatPrice(packageProduct.price) }}
                </span>
                <br />
                <span style="color:#999; font-size: small;">
                  1회 제공 금액 {{ formatPrice(getPerCyclePrice(packageProduct.price, packageProduct.deliveryCycle)) }}
                </span>
                <br />
                <span style="color:#999; font-size: small;">
                  🧾 누적 주문 {{ packageProduct.orderCount }}
                </span>
              </v-card-text>
            </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 로딩 스피너 -->
    <v-row v-if="isLoading" justify="center" class="mt-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiHeartOutline, mdiHeart } from '@mdi/js';
import FarmMenuComponent from '@/components/menubar/FarmMenuComponent.vue';
import { debounce } from 'lodash';

export default {
  components: {
    FarmMenuComponent,
    SvgIcon
  },
  data() {
    return {
      displayedPackageList: [], // 현재 화면에 표시되는 패키지
      currentPage: 0, // 현재 페이지 번호 (0부터 시작)
      pageSize: 5, // 페이지당 아이템 수
      farmId: null,
      errorMessage: null,
      isLoading: false,
      isLastPage: false,
      member: localStorage.getItem("memberId"),
      wishlistItems: {},
      mdiHeartOutline: mdiHeartOutline,
      mdiHeart: mdiHeart,
      wishAnimation: new Map(),
    };
  },
  mounted() {
    this.farmId = this.$route.params.farmId;

    // 스크롤 이벤트 리스너 추가 (debounce 적용)
    window.addEventListener('scroll', this.scrollPagination);

    // 첫 페이지 로드
    this.loadMorePackages();
  },
  unmounted() {
    // 스크롤 이벤트 리스너 제거
    window.removeEventListener('scroll', this.scrollPagination);
  },
  methods: {
    async loadMorePackages() {
      if (this.isLoading || this.isLastPage) return;

      this.isLoading = true;

      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/product-service/product/no-auth/for-sale/${this.farmId}`, {
          params: {
            page: this.currentPage, // 현재 페이지
            size: this.pageSize,    // 페이지당 아이템 수
          },
        });

        console.log(response.data); // 응답 데이터 확인

        const newItems = response.data.content; // 패키지 리스트
        const lastPage = response.data.last;    // 마지막 페이지 여부

        if (Array.isArray(newItems)) {
          this.displayedPackageList = [...this.displayedPackageList, ...newItems];
          if (lastPage) {
            this.isLastPage = true;
          } else {
            this.currentPage++;
          }
        } else {
          console.error('Unexpected API response format:', response.data);
          this.errorMessage = '데이터 형식이 올바르지 않습니다.';
        }

      } catch (e) {
        this.errorMessage = '데이터를 불러오는 중 오류가 발생했습니다.';
        console.error(e);
      } finally {
        this.isLoading = false;
      }
    },
    scrollPagination: debounce(function() {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.body.offsetHeight;

      // 사용자가 페이지의 90% 이상 스크롤했을 때 로드
      if (scrollTop + windowHeight >= fullHeight * 0.9) {
        this.loadMorePackages();
      }
    }, 200), // 200ms 지연
    async addToWishList(packageProduct) {
      try {
        const memberId = localStorage.getItem('memberId');
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/member-service/wishlist/product/${packageProduct.packageId}`, {}, {
          headers: {
            myId: memberId,
          }
        });
        this.wishlistItems[packageProduct.packageId] = !this.wishlistItems[packageProduct.packageId];
        if (this.wishlistItems[packageProduct.packageId]) {
          // 애니메이션 시작
          this.wishAnimation.set(packageProduct.packageId, true);
          setTimeout(() => {
            this.wishAnimation.set(packageProduct.packageId, false);
          }, 1000); // 애니메이션 지속 시간 조절 가능
        }
      } catch (e) {
        console.log(e.message);
      }
    },
    // 패키지 상세 페이지로 이동하는 메서드
    goToPackageDetail(packageId) {
      this.$router.push({ name: 'FarmPackageDetail', params: { packageId } });
    },
    formatPrice(value) {
      if (value == null) {
        return "0원";
      }
      return parseInt(value).toLocaleString('ko-KR') + ' 원'; // 한국어 화폐 양식으로 변환
    },
    getPerCyclePrice(price, deliveryCycle) {
      if (price == null || deliveryCycle == null || deliveryCycle === 0) {
        return 0; // 값이 없거나 deliveryCycle이 0일 경우 0 반환
      }
      // 10단위 반올림 처리
      const perCyclePrice = Math.round(price / (28 / deliveryCycle) / 10) * 10;
      return perCyclePrice;
    },
  }
}
</script>

<style scoped>
.package-name {
    font-size: 15px;
    font-weight: bold;
    margin-top: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.package-price {
    font-size: 13px;
    color: #8e8e8e;
}

/* 위시리스트 관련 스타일 */
.heart-icon {
  width: 17px;
  height: 17px;
}

.icon-colored {
  color: red;
}

.heart-emoji {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  opacity: 0;
  animation: popUp 1s ease-in-out forwards;
}

@keyframes popUp {
  0% {
      opacity: 0;
      transform: translate(-50%, 0) scale(0);
  }

  50% {
      opacity: 1;
      transform: translate(-50%, -50px) scale(1.5);
  }

  100% {
      opacity: 0;
      transform: translate(-50%, -100px) scale(0);
  }
}

.square-image {
  width: 100%;
  aspect-ratio: 1 / 1; /* 정사각형 비율 */
  object-fit: cover;
}
.sale-style {
    background-color: rgb(245, 77, 77); 
    color: white; 
    padding-right: 7px;
    padding-left: 7px;
    padding-bottom: 3px;
    padding-top: 5px;
    font-size: 10px;
    margin-bottom: 10px;
}
</style>
