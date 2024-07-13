<script lang="ts" setup>
import { useRoute } from "vue-router"; // 引入路由钩子
import SidebarItem from "./SidebarItem.vue"; // 引入侧边栏子组件
import { useSettingsStore } from "@/store/modules/settings"; // 引入设置状态管理
import { useAppStore } from "@/store/modules/app"; // 引入应用状态管理
import variables from "@/styles/variables.module.scss"; // 引入样式变量

import path from "path-browserify"; // 引入路径解析
import { isExternal } from "@/utils/index"; // 引入工具函数

const settingsStore = useSettingsStore(); // 引入设置状态管理
const appStore = useAppStore(); // 引入应用状态管理
const currRoute = useRoute(); // 引入路由钩子
const layout = computed(() => settingsStore.layout); // 引入设置状态管理
const props = defineProps({
  menuList: {
    required: true,
    default: () => {
      return [];
    },
    type: Array<any>,
  },
  basePath: {
    type: String,
    required: true,
  },
});

/**
 * 解析路径
 *
 * @param routePath 路由路径
 */
function resolvePath(routePath: string) {
  if (isExternal(routePath)) {
    // 判断是否为外部链接
    return routePath; // 返回外部链接
  }
  if (isExternal(props.basePath)) {
    // 判断是否为外部链接
    return props.basePath; // 返回外部链接
  }

  // 完整路径 = 父级路径(/level/level_3) + 路由路径
  const fullPath = path.resolve(props.basePath, routePath); // 相对路径 → 绝对路径
  return fullPath;
}
</script>
<template>
  <el-menu
    :default-active="layout === 'top' ? '-' : currRoute.path"
    :collapse="!appStore.sidebar.opened"
    :background-color="variables.menuBg"
    :text-color="variables.menuText"
    :active-text-color="variables.menuActiveText"
    :unique-opened="false"
    :collapse-transition="false"
    :mode="layout === 'top' ? 'horizontal' : 'vertical'"
  >
    <sidebar-item
      v-for="route in menuList"
      :key="route.path"
      :item="route"
      :base-path="resolvePath(route.path)"
      :is-collapse="!appStore.sidebar.opened"
    />
  </el-menu>
</template>
