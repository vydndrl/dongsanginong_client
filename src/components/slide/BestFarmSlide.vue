<template>
    <v-container style="display: flex; align-items: center; margin: auto;">
        <button class="carousel-button left" @click="scrollLeft">❮</button>
        <div class="carousel-container" >
            <div class="carousel" ref="carousel">
                <div class="carousel-inner">
                    <div class="carousel-item" v-for="(item, index) in items" :key="index">
                        <img :src="item.imageUrl"
                        alt="item image"
                        class="item-img"
                        @click="this.$router.push(`/farm/${item.id}/packages`)"
                        />
                        <div class="item-info">
                            <h2>{{ item.farmName }}</h2>
                            <p class="farm-intro">{{ item.farmIntro }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 오른쪽 버튼 -->
            
        </div>
        <button class="carousel-button right" @click="scrollRight">❯</button>
    </v-container>
</template>

<script>
import axios from 'axios';
export default {
    data() {
        return {
            currentSlide: 0,
            itemsPerPage: 9,  // Number of items to show per page
            items: [],
            farmList: [],
            likes: [],
            likeCount: [],
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.items.length / this.itemsPerPage);
        },
    },
    async created() {
        const params = {
            "page": 0,
            "size": 9,
            "sort": "favoriteCount,desc"
        }

        try {
            const response2 = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/product-service/farm/no-auth`, { params });
            this.items = response2.data.content;

            this.likes = new Array(this.farmList.length);
            this.likeCount = new Array(this.farmList.length);
            for (let i = 0; i < this.farmList.length; ++i) {
                if (this.farmList[i].isLiked === true) {
                    this.likes[i] = 1;
                } else {
                    this.likes[i] = 0;
                }
                this.likeCount[i] = Number(this.farmList[i].favoriteCount);
            }

        } catch (e) {
            console.log(e);
        }
    },
    mounted() {
        this.startCarousel();
    },
    methods: {
        startCarousel() {
            setInterval(() => {
                this.currentSlide = (this.currentSlide + 1) % this.totalPages;  // Move to next page
            }, 5000); // Change slide every 3 seconds
        },
        scrollLeft() {
            const carousel = this.$refs.carousel;
            const scrollAmount = 270;  // 스크롤할 픽셀 양
            carousel.scrollLeft -= scrollAmount;
        },
        scrollRight() {
            const carousel = this.$refs.carousel;
            const scrollAmount = 270;  // 스크롤할 픽셀 양
            carousel.scrollLeft += scrollAmount;
        },
    },
};
</script>

<style scoped>
.carousel-container {
  /*position: relative;*/
  display: flex;
  align-items: center;
  width: 1100px;
}

.carousel {
  overflow-x: scroll;
  overflow-y: hidden;
  -ms-overflow-style: none;
  padding-right: 20px; /* To make the next item partially visible */
  scroll-behavior: smooth; /* 부드러운 스크롤 효과 추가 */
}

.carousel::-webkit-scrollbar {
    display: none;
}

.carousel-inner {
  display: flex;
  width: calc(100% + 20px); /* Compensate for the padding */
}

.carousel-item {
  /*flex: 1 0 calc(28.333% - 20px); /* Three items per page with spacing */
  /*margin-right: 20px; /* Create space between items */
  margin-right: 20px;
  text-align: center;
  box-sizing: border-box;
}

.item-img {
  width: 250px;
  height: 250px;
  object-fit: cover;
  border-radius: 50%;
}

.item-img:hover {
    cursor: pointer;
}

.item-info {
  margin-top: 10px;
}

.item-info h2 {
  font-size: 18px;
  font-weight: bold;
}


.farm-intro {
    font-size: 15px;
    font-weight: medium;
    opacity: 0.9;
    color: #5D5D5D;
}

.carousel-button {
  transform: translateY(-50%);
  /*background-color: rgba(0, 0, 0, 0.5);*/
  border: none;
  color: black;
  font-size: 2rem;
  padding: 10px;
  cursor: pointer;
  z-index: 1;
}

.carousel-button.left {
  left: 10px;
}

.carousel-button.right {
  right: 10px;
}

</style>
