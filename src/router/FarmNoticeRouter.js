import FarmNoticeList from "@/views/product/farmNotice/FarmNoticeList.vue";
import NoticeDetailWithComment from "@/views/product/farmNotice/NoticeDetailWithComment.vue";

export const FarmNoticeRouter = [
    {
        path: '/farm/:id/notice/list',
        name: 'FarmNoticeList',
        component: FarmNoticeList,
    },
    {
        path: '/farm/:farm_id/notice/:notice_id',
        name: 'NoticeDetailWithComment',
        component: NoticeDetailWithComment,
    }

]