import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // ========== 前台路由 ==========
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/articles',
    name: 'ArticleList',
    component: () => import('../views/articles/ArticleList.vue')
  },
  {
    path: '/articles/archive',
    name: 'ArticleArchive',
    component: () => import('../views/articles/Archive.vue')
  },
  {
    path: '/articles/:id',
    name: 'ArticleDetail',
    component: () => import('../views/articles/ArticleDetail.vue')
  },
  {
    path: '/anime',
    name: 'AnimeList',
    component: () => import('../views/anime/AnimeList.vue')
  },
  {
    path: '/anime/:id',
    name: 'AnimeDetail',
    component: () => import('../views/anime/AnimeDetail.vue')
  },
  {
    path: '/galgame',
    name: 'GalgameList',
    component: () => import('../views/galgame/GalgameList.vue')
  },
  {
    path: '/galgame/:id',
    name: 'GalgameDetail',
    component: () => import('../views/galgame/GalgameDetail.vue')
  },
  {
    path: '/tags/:id',
    name: 'TagPosts',
    component: () => import('../views/TagPosts.vue')
  },
  {
    path: '/guestbook',
    name: 'Guestbook',
    component: () => import('../views/Guestbook.vue')
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('../views/Projects.vue')
  },
  {
    path: '/yearly',
    name: 'YearlyReport',
    component: () => import('../views/YearlyReport.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/links',
    name: 'FriendLinks',
    component: () => import('../views/FriendLinks.vue')
  },
  {
    path: '/diary',
    name: 'DiaryList',
    component: () => import('../views/diary/DiaryList.vue')
  },
  {
    path: '/diary/:id',
    name: 'DiaryDetail',
    component: () => import('../views/diary/DiaryDetail.vue')
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: () => import('../views/Gallery.vue')
  },

  // ========== 后台路由 ==========
  {
    path: '/admin',
    component: () => import('../components/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue'),
        meta: { requiresAuth: true, title: '控制台' }
      },
      {
        path: 'login',
        name: 'AdminLogin',
        component: () => import('../views/admin/Login.vue'),
        meta: { title: '管理员登录' }
      },
      {
        path: 'posts',
        name: 'AdminPosts',
        component: () => import('../views/admin/PostManager.vue'),
        meta: { requiresAuth: true, title: '内容管理' }
      },
      {
        path: 'posts/create',
        name: 'AdminCreatePost',
        component: () => import('../views/admin/PostEditor.vue'),
        meta: { requiresAuth: true, title: '写新内容' }
      },
      {
        path: 'posts/edit/:id',
        name: 'AdminEditPost',
        component: () => import('../views/admin/PostEditor.vue'),
        meta: { requiresAuth: true, title: '编辑内容' }
      },
      {
        path: 'messages',
        name: 'AdminMessages',
        component: () => import('../views/admin/MessagesAdmin.vue'),
        meta: { requiresAuth: true, title: '留言管理' }
      },
      {
        path: 'links',
        name: 'AdminFriendLinks',
        component: () => import('../views/admin/FriendLinksAdmin.vue'),
        meta: { requiresAuth: true, title: '友链管理' }
      },
      {
        path: 'quotes',
        name: 'AdminQuotes',
        component: () => import('../views/admin/QuotesAdmin.vue'),
        meta: { requiresAuth: true, title: '名言管理' }
      },
      {
        path: 'announcements',
        name: 'AdminAnnouncements',
        component: () => import('../views/admin/AnnouncementsAdmin.vue'),
        meta: { requiresAuth: true, title: '公告管理' }
      },
      {
        path: 'diaries',
        name: 'AdminDiaries',
        component: () => import('../views/admin/DiaryAdmin.vue'),
        meta: { requiresAuth: true, title: '日记管理' }
      },
      {
        path: 'gallery',
        name: 'AdminGallery',
        component: () => import('../views/admin/GalleryAdmin.vue'),
        meta: { requiresAuth: true, title: '画廊管理' }
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('../views/admin/Settings.vue'),
        meta: { requiresAuth: true, title: '站点设置' }
      },
    ]
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  // 后台页面需要验证
  if (to.matched.some(r => r.meta.requiresAuth)) {
    const { useAuthStore } = await import('../stores/auth')
    const auth = useAuthStore()

    if (!auth.checked) {
      await auth.checkAuth()
    }

    if (!auth.isLoggedIn) {
      next('/admin/login')
      return
    }
  }
  next()
})

export default router
