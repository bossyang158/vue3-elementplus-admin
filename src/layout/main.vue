<script lang="ts" setup>
import { computed, watchEffect } from "vue"; // 引入计算属性 watchEffect
import { useWindowSize } from "@vueuse/core"; // 引入窗口大小 hook 函数 useWindowSize
import { AppMain, Navbar, Settings, TagsView } from "./components/index";
import RightPanel from "@/components/RightPanel/index.vue"; // 引入右侧面板组件
import { useAppStore } from "@/store/modules/app"; // 引入应用状态管理
import { useSettingsStore } from "@/store/modules/settings"; // 引入设置状态管理
const { width } = useWindowSize(); // 引入窗口大小 hook 函数

/**
 * 响应式布局容器固定宽度
 *
 * 大屏（>=1200px）
 * 中屏（>=992px）
 * 小屏（>=768px）
 */
const WIDTH = 992; // 定义宽度 992

const appStore = useAppStore(); // 引入应用状态管理 useAppStore 函数  获取应用状态管理
const settingsStore = useSettingsStore(); // 引入设置状态管理 useSettingsStore 函数
const fixedHeader = computed(() => settingsStore.fixedHeader); // 获取设置状态管理 fixedHeader
const showTagsView = computed(() => settingsStore.tagsView); // 获取设置状态管理 tagsView
const showSettings = computed(() => settingsStore.showSettings); // 获取设置状态管理 showSettings
const layout = computed(() => settingsStore.layout); // 获取设置状态管理 layout

watchEffect(() => {
  // 监听窗口大小变化
  if (width.value < WIDTH) {
    // 判断窗口大小是否小于 992
    appStore.toggleDevice("mobile"); // 调用应用状态管理 toggleDevice 函数
    appStore.closeSideBar(true); // 调用应用状态管理 closeSideBar 函数 关闭侧边栏 true
  } else {
    appStore.toggleDevice("desktop"); // 调用应用状态管理 toggleDevice 函数

    if (width.value >= 1200) {
      // 判断窗口大小是否大于等于 1200
      //大屏
      appStore.openSideBar(true); // 调用应用状态管理 openSideBar 函数 打开侧边栏 true
    } else {
      appStore.closeSideBar(true); // 调用应用状态管理 closeSideBar 函数 关闭侧边栏 true
    }
  }
});
</script>
<template>
  <div :class="{ hasTagsView: showTagsView }" class="main-container">
    <div :class="{ 'fixed-header': fixedHeader }">
      <navbar v-if="layout === 'left'" />
      <tags-view v-if="showTagsView" />
    </div>
    <!--主页面-->
    <app-main />
    <!-- 设置面板 -->
    <RightPanel v-if="showSettings">
      <settings />
    </RightPanel>
  </div>
</template>
