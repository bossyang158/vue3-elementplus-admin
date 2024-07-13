import { defineStore } from "pinia";

import { loginApi, logoutApi } from "@/api/auth";
import { getUserInfo } from "@/api/user";
import { resetRouter } from "@/router";
import { store } from "@/store";

import { LoginData } from "@/api/auth/types";
import { UserInfo } from "@/api/user/types";

/**
 * 导入useStorage函数，用于在Vue组件中使用存储功能。
 * @packageDocumentation
 */
import { useStorage } from "@vueuse/core";

import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  // 状态
  const userId = ref();
  const token = useStorage("accessToken", "");
  const nickname = ref("");
  const avatar = ref("");
  const roles = ref<Array<string>>([]); // 用户角色编码集合 → 用于判断路由权限
  const perms = ref<Array<string>>([]); // 用户权限编码集合 → 用于判断按钮权限

  /**
   * 登录操作
   *
   * @returns
   * @param loginData
   */
  function login(loginData: LoginData) {
    return new Promise<void>((resolve, reject) => {
      loginApi(loginData)
        .then((response) => {
          const { tokenType, accessToken } = response.data;
          token.value = tokenType + " " + accessToken; // Bearer eyJhbGciOiJIUzI1NiJ9.xxx.xxx
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // 获取用户信息(昵称、头像、角色集合、权限集合)
  function getInfo() {
    return new Promise<UserInfo>((resolve, reject) => {
      getUserInfo()
        .then(({ data }) => {
          if (!data) {
            return reject("验证失败，请重新登录。");
          }
          if (!data.roles || data.roles.length <= 0) {
            reject("getUserInfo: roles 必须是非空数组！");
          }
          userId.value = data.userId;
          nickname.value = data.nickname;
          avatar.value = data.avatar;
          roles.value = data.roles;
          perms.value = data.perms;
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // 注销操作
  function logout() {
    return new Promise<void>((resolve, reject) => {
      logoutApi()
        .then(() => {
          resetRouter();
          resetToken();
          location.reload(); // 清空路由
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // 重置token和用户信息
  function resetToken() {
    token.value = "";
    nickname.value = "";
    avatar.value = "";
    roles.value = [];
    perms.value = [];
  }
  return {
    token,
    nickname,
    avatar,
    roles,
    perms,
    login,
    getInfo,
    logout,
    resetToken,
    /**
     * 当前登录用户ID
     */
    userId,
  };
});

// 非setup方式使用store
export function useUserStoreHook() {
  return useUserStore(store);
}
