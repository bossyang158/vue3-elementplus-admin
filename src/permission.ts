import router from "@/router";
// import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { useUserStoreHook } from "@/store/modules/user";
// 引入权限模块
import { usePermissionStoreHook } from "@/store/modules/permission";

import NProgress from "nprogress"; // 进度条
import "nprogress/nprogress.css"; // 进度条样式

NProgress.configure({ showSpinner: false }); // 进度条

const permissionStore = usePermissionStoreHook();

// 白名单路由
const whiteList = ["/login", "/404"];

router.beforeEach(async (to, from, next) => {
  NProgress.start();
  const hasToken = localStorage.getItem("accessToken");
  if (hasToken) {
    if (to.path === "/login") {
      // 如果已登录，跳转首页
      next({ path: "/" });
      NProgress.done();
    } else {
      const userStore = useUserStoreHook(); // 用户信息 store
      // 判断用户是否有角色
      const hasRoles = userStore.roles && userStore.roles.length > 0;
      if (hasRoles) {
        // 如果有角色
        // 未匹配到任何路由，跳转404
        if (to.matched.length === 0) {
          // 如果未匹配到路由
          // 从 from.name 跳转，如果 from.name 不存在则跳转 404
          from.name ? next({ name: from.name }) : next("/404");
        } else {
          next();
        }
      } else {
        // 用户没有角色
        try {
          // 获取用户角色
          const { roles } = await userStore.getInfo();
          // 动态添加路由
          const accessRoutes = await permissionStore.generateRoutes(roles);
          router.options.routes = accessRoutes; // 动态添加可访问路由表
          accessRoutes.forEach((route) => {
            // 遍历动态路由
            router.addRoute(route); // 添加路由
          });
          next({ ...to, replace: true });
        } catch (error) {
          // 移除 token 并跳转登录页
          await userStore.resetToken();
          next(`/login?redirect=${to.path}`); // 重定向到登录页 并携带当前页面路由
          NProgress.done();
        }
      }
    }
  } else {
    // 未登录可以访问白名单页面
    if (whiteList.indexOf(to.path) !== -1) {
      next();
    } else {
      next(`/login?redirect=${to.path}`); // 重定向到登录页 并携带当前页面路由
      NProgress.done();
    }
  }
});

// 路由跳转后 NProgress.done() 结束进度条
router.afterEach(() => {
  NProgress.done();
});
