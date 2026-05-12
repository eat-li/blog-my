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
  routes
})

router.beforeEach((to, from, next) => {
  // 后台页面需要验证
  if (to.matched.some(r => r.meta.requiresAuth)) {
    const token = localStorage.getItem('token')
    if (!token) {
      next('/admin/login')
      return
    }
  }
  next()
})

export default router
