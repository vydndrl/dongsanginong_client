import { createRouter, createWebHistory } from "vue-router";
import MainPage from "../views/main/MainPage.vue";

import { farmNoticeRouter } from "./farmNoticeRouter";
import { sellerRouter } from '@/router/sellerRouter';
import { memberRouter } from "./memberRouter";
import { farmRouter } from "./farmRouter";
import { liveRouter } from "./liveRouter";
import { reviewRouter } from "./reviewRouter";
import { receiptRouter } from "./receiptRouter";
import { productRouter } from "./productRouter";
import { orderRouter } from "./orderRouter";
import { notificationRouter } from "./notificationRouter";


const routes = [
  {
    path: "/",
    name: "home",
    component: MainPage,
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  },

  ...farmNoticeRouter,
  ...sellerRouter,
  ...memberRouter,
  ...reviewRouter,
  ...farmRouter,
  ...liveRouter,
  ...receiptRouter,
  ...productRouter,
  ...orderRouter,
  ...notificationRouter
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // savedPosition이 있으면 해당 위치로 이동 (뒤로가기 등에서 사용)
    if (savedPosition) {
      return savedPosition;
    } else {
      // 새로운 페이지에서는 항상 최상단으로 이동
      return { top: 0 };
    }
  }
});

export default router;
