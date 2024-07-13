<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

import { addClass, removeClass } from "@/utils/index"; // 引入工具函数

const show = ref(false); // 是否显示右侧面板 默认不显示

defineProps({
  buttonTop: {
    // 按钮距离顶部距离 默认250
    default: 250,
    type: Number,
  },
});

watch(show, (value) => {
  // 监听显示状态 变化 添加点击事件 或 移除点击事件
  if (value) {
    addEventClick(); // 添加点击事件
  }
  if (value) {
    addClass(document.body, "showRightPanel"); // 添加body样式 showRightPanel
  } else {
    removeClass(document.body, "showRightPanel"); // 移除body样式 showRightPanel
  }
});

function addEventClick() {
  // 添加点击事件 用于关闭右侧面板
  window.addEventListener("click", closeSidebar, { passive: true }); // 添加点击事件 用于关闭右侧面板
}

function closeSidebar(evt: any) {
  // 关闭右侧面板 用于点击事件
  // 主题选择点击不关闭
  let parent = evt.target.closest(".right-panel-container"); // 获取点击元素的最近的右侧面板容器 如果存在则不关闭
  if (!parent) {
    // 如果不存在则关闭 右侧面板
    show.value = false; // 关闭右侧面板
    window.removeEventListener("click", closeSidebar); // 移除点击事件 用于点击事件 用于关闭右侧面板
  }
}

const rightPanel = ref(); // 右侧面板 ref 对象

function insertToBody() {
  // 插入到body 用于显示右侧面板
  const body = document.querySelector("body") as any; // 获取body 元素
  body.insertBefore(rightPanel.value, body.firstChild); // 插入到body 元素 第一个子元素 前面
}

onMounted(() => {
  insertToBody(); // 插入到body 用于显示右侧面板
});

onBeforeUnmount(() => {
  rightPanel.value.remove(); // 移除点击事件 用于点击事件 用于关闭右侧面板
});
</script>

<template>
  <!-- 右侧面板，通过ref属性引用，用于后续的JS操作 -->
  <div ref="rightPanel" :class="{ show: show }">
    <!-- 遮罩层，用于点击外部区域隐藏面板 -->
    <div class="right-panel-overlay"></div>
    <!-- 面板容器，包含控制按钮和内容区域 -->
    <div class="right-panel-container">
      <!-- 控制按钮，通过点击切换面板的显示状态 -->
      <div
        class="right-panel-btn"
        :style="{
          top: buttonTop + 'px',
        }"
        @click="show = !show"
      >
        <!-- 当面板显示时，显示关闭图标 -->
        <i-ep-close v-show="show" />
        <!-- 当面板隐藏时，显示设置图标 -->
        <i-ep-setting v-show="!show" />
      </div>
      <!-- 内容区域，通过插槽动态注入内容 -->
      <div>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.showRightPanel {
  position: relative;
  width: calc(100% - 15px);
  overflow: hidden;
}

.right-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  background: rgb(0 0 0 / 20%);
}

.right-panel-container {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 999;
  width: 100%;
  max-width: 300px;
  height: 100vh;
  background-color: var(--el-bg-color-overlay);
  box-shadow: 0 0 15px 0 rgb(0 0 0 / 5%);
  transition: all 0.25s cubic-bezier(0.7, 0.3, 0.1, 1);
  transform: translate(100%);
}

.show {
  transition: all 0.3s cubic-bezier(0.7, 0.3, 0.1, 1);

  .right-panel-overlay {
    z-index: 99;
    width: 100%;
    height: 100%;
    opacity: 1;
  }

  .right-panel-container {
    transform: translate(0);
  }
}

.right-panel-btn {
  position: absolute;
  left: -36px;
  width: 36px;
  height: 36px;
  color: var(--el-color-white);
  text-align: center;
  cursor: pointer;
  background-color: var(--el-color-primary);
  border-radius: 6px 0 0 6px;

  svg {
    width: 20px;
    height: 20px;
    vertical-align: -10px;
  }
}
</style>
