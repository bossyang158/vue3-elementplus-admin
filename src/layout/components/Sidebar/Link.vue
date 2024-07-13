<script lang="ts" setup>
import { computed } from "vue"; // 引入计算属性
import { isExternal } from "@/utils/index"; // 引入工具函数
import { useRouter } from "vue-router"; // 引入路由钩子

import { useAppStore } from "@/store/modules/app"; // 引入应用状态管理

const appStore = useAppStore(); // 获取应用状态管理

const sidebar = computed(() => appStore.sidebar); // 获取侧边栏状态
const device = computed(() => appStore.device); // 获取设备状态

const props = defineProps({
  to: {
    type: String,
    required: true,
  },
});

const router = useRouter(); // 获取路由钩子
function push() {
  // 路由跳转
  if (device.value === "mobile" && sidebar.value.opened == true) {
    // 判断是否是移动端并且侧边栏打开
    appStore.closeSideBar(false); // 关闭侧边栏
  }
  router.push(props.to).catch((err) => {
    // 路由跳转错误
    console.error(err); // 打印错误
  });
}
</script>

<template>
  <a v-if="isExternal(to)" :href="to" target="_blank" rel="noopener">
    <slot></slot>
  </a>
  <div v-else @click="push">
    <slot></slot>
  </div>
</template>
