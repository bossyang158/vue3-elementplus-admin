import { RouteRecordRaw } from "vue-router";
import { defineStore } from "pinia";
import { constantRoutes } from "@/router";
import { store } from "@/store";
import { listRoutes } from "@/api/menu";
import { ref } from "vue";

const modules = import.meta.glob("../../views/**/**.vue");
const Layout = () => import("@/layout/index.vue");

/**
 * Use meta. Role to determine if the current user has permission
 *
 * @param roles 用户角色集合
 * @param route 路由
 * @returns
 */
const hasPermission = (roles: string[], route: RouteRecordRaw) => {
  // if (route.meta && route.meta.roles) { // 如果路由有meta属性，则判断用户角色是否有该路由的访问权限
  if (route.meta) {
    // 由于后台路由meta属性没有role 我直接注释掉了 你可以根据自己的需求来修改
    if (roles.includes("ADMIN")) {
      // 超级管理员拥有所有权限，忽略校验
      return true;
    }
    return roles.some((role) => {
      // 遍历角色集合
      if (route.meta?.roles !== undefined) {
        // 如果路由有meta属性，则判断用户角色是否有该路由的访问权限
        return (route.meta.roles as string[]).includes(role); // 如果路由有meta属性，则判断用户角色是否有该路由的访问权限
      }
    });
  }
  return false;
};

/**
 * 递归过滤有权限的异步(动态)路由
 *
 * @param routes 接口返回的异步(动态)路由
 * @param roles 用户角色集合
 * @returns 返回用户有权限的异步(动态)路由
 */
const filterAsyncRoutes = (routes: RouteRecordRaw[], roles: string[]) => {
  const asyncRoutes: RouteRecordRaw[] = []; // 有权限的异步(动态)路由

  routes.forEach((route) => {
    // 遍历异步(动态)路由
    const tmpRoute = { ...route }; // ES6扩展运算符复制新对象
    if (!route.name) {
      // 如果路由没有name，则设置name为path
      tmpRoute.name = route.path; // 设置name为path
    }

    // 判断用户(角色)是否有该路由的访问权限
    if (hasPermission(roles, tmpRoute)) {
      // 用户(角色)有该路由的访问权限
      if (tmpRoute.component?.toString() == "Layout") {
        // 如果路由的组件是Layout，则设置组件为Layout
        tmpRoute.component = Layout; // 设置组件为Layout
      } else {
        const component = modules[`../../views/${tmpRoute.component}.vue`]; // 获取组件
        if (component) {
          // 如果组件存在，则设置组件
          tmpRoute.component = component; // 设置组件
        } else {
          tmpRoute.component = modules[`../../views/error-page/404.vue`]; // 设置组件为404
        }
      }

      if (tmpRoute.children) {
        // 如果路由有子路由，则递归过滤
        tmpRoute.children = filterAsyncRoutes(tmpRoute.children, roles); // 递归过滤
      }

      asyncRoutes.push(tmpRoute); // 添加到异步(动态)路由集合中
    }
  });

  return asyncRoutes;
};

// 定义权限模块
export const usePermissionStore = defineStore("permission", () => {
  // state
  const routes = ref<RouteRecordRaw[]>([]);

  // actions
  function setRoutes(newRoutes: RouteRecordRaw[]) {
    routes.value = constantRoutes.concat(newRoutes); // 添加到路由集合中
  }
  /**
   * 生成动态路由
   *
   * @param roles 用户角色集合
   * @returns
   */
  function generateRoutes(roles: string[]) {
    return new Promise<RouteRecordRaw[]>((resolve, reject) => {
      // 接口获取所有路由
      listRoutes()
        .then(({ data: asyncRoutes }) => {
          // 根据角色获取有访问权限的路由
          const accessedRoutes = filterAsyncRoutes(asyncRoutes, roles);
          setRoutes(accessedRoutes); // 设置路由 => 用于左侧菜单
          resolve(accessedRoutes); // 返回有访问权限的路由
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 混合模式左侧菜单
   */
  const mixLeftMenu = ref<RouteRecordRaw[]>([]);
  function getMixLeftMenu(activeTop: string) {
    routes.value.forEach((item) => {
      if (item.path === activeTop) {
        mixLeftMenu.value = item.children || [];
      }
    });
  }
  return { routes, setRoutes, generateRoutes, getMixLeftMenu, mixLeftMenu };
});

// 非setup
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
