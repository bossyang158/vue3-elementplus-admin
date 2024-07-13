<script setup lang="ts">
// 引入Vue相关函数和Pinia的storeToRefs
import {
  getCurrentInstance,
  ComponentInternalInstance,
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
} from "vue";
import { storeToRefs } from "pinia";

// 引入path-browserify以在浏览器中使用Node.js path模块的功能
import path from "path-browserify";

// 引入Vue Router的钩子
import { useRoute, useRouter } from "vue-router";

// 引入国际化处理函数
import { translateRouteTitleI18n } from "@/utils/i18n";

// 引入Pinia状态管理中的各个模块
// 引入权限管理模块的store，用于控制页面访问权限
import { usePermissionStore } from "@/store/modules/permission";
// 引入标签视图模块的store，用于管理页面标签
import { useTagsViewStore, TagView } from "@/store/modules/tagsView";
// 引入设置模块的store，用于管理应用的全局设置
import { useSettingsStore } from "@/store/modules/settings";
// 引入应用模块的store，用于管理应用级的状态和逻辑
import { useAppStore } from "@/store/modules/app";

// 引入滚动面板组件
import ScrollPane from "./ScrollPane.vue";

// 获取当前Vue实例的代理对象
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();
const route = useRoute();

// 使用Pinia状态管理模块
const permissionStore = usePermissionStore();
const tagsViewStore = useTagsViewStore();
const appStore = useAppStore();

// 使用storeToRefs将Pinia状态转换为响应式引用
const { visitedViews } = storeToRefs(tagsViewStore);
const settingsStore = useSettingsStore();
const layout = computed(() => settingsStore.layout);

// 定义响应式数据
const selectedTag = ref({});
const scrollPaneRef = ref();
const left = ref(0);
const top = ref(0);
const affixTags = ref<TagView[]>([]);

// 监听路由变化，添加标签并移动到当前标签
watch(
  route,
  () => {
    addTags();
    moveToCurrentTag();
  },
  {
    immediate: true,
  }
);

// 标签菜单的显示状态
const tagMenuVisible = ref(false);
watch(tagMenuVisible, (value) => {
  if (value) {
    document.body.addEventListener("click", closeTagMenu);
  } else {
    document.body.removeEventListener("click", closeTagMenu);
  }
});

// 筛选固定标签
function filterAffixTags(routes: any[], basePath = "/") {
  let tags: TagView[] = [];

  routes.forEach((route) => {
    if (route.meta && route.meta.affix) {
      const tagPath = path.resolve(basePath, route.path);
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name,
        meta: { ...route.meta },
      });
    }

    if (route.children) {
      const childTags = filterAffixTags(route.children, route.path);
      if (childTags.length >= 1) {
        tags = tags.concat(childTags);
      }
    }
  });
  return tags;
}

// 初始化标签
function initTags() {
  const tags: TagView[] = filterAffixTags(permissionStore.routes);
  affixTags.value = tags;
  for (const tag of tags) {
    if (tag.name) {
      tagsViewStore.addVisitedView(tag);
    }
  }
}

// 添加标签
function addTags() {
  if (route.name) {
    tagsViewStore.addView(route);
  }
}

// 移动到当前标签
function moveToCurrentTag() {
  nextTick(() => {
    for (const r of tagsViewStore.visitedViews) {
      if (r.path === route.path) {
        scrollPaneRef.value.moveToTarget(r);
        if (r.fullPath !== route.fullPath) {
          tagsViewStore.updateVisitedView(route);
        }
      }
    }
  });
}

// 判断标签是否激活
function isActive(tag: TagView) {
  return tag.path === route.path;
}

// 判断标签是否固定
function isAffix(tag: TagView) {
  return tag.meta && tag.meta.affix;
}

// 判断是否为第一个视图
function isFirstView() {
  try {
    return (
      (selectedTag.value as TagView).fullPath ===
        tagsViewStore.visitedViews[1].fullPath ||
      (selectedTag.value as TagView).fullPath === "/index"
    );
  } catch (err) {
    return false;
  }
}

// 判断是否为最后一个视图
function isLastView() {
  try {
    return (
      (selectedTag.value as TagView).fullPath ===
      tagsViewStore.visitedViews[tagsViewStore.visitedViews.length - 1].fullPath
    );
  } catch (err) {
    return false;
  }
}

// 刷新选中的标签
function refreshSelectedTag(view: TagView) {
  tagsViewStore.delCachedView(view);
  const { fullPath } = view;
  nextTick(() => {
    router.replace({ path: "/redirect" + fullPath }).catch((err) => {
      console.warn(err);
    });
  });
}

// 跳转到最后一个视图
function toLastView(visitedViews: TagView[], view?: any) {
  const latestView = visitedViews.slice(-1)[0];
  if (latestView && latestView.fullPath) {
    router.push(latestView.fullPath);
  } else {
    if (view.name === "Dashboard") {
      router.replace({ path: "/redirect" + view.fullPath });
    } else {
      router.push("/");
    }
  }
}

// 关闭选中的标签
function closeSelectedTag(view: TagView) {
  tagsViewStore.delView(view).then((res: any) => {
    if (isActive(view)) {
      toLastView(res.visitedViews, view);
    }
  });
}

// 关闭左侧标签
function closeLeftTags() {
  tagsViewStore.delLeftViews(selectedTag.value).then((res: any) => {
    if (
      !res.visitedViews.find((item: any) => item.fullPath === route.fullPath)
    ) {
      toLastView(res.visitedViews);
    }
  });
}

// 关闭��侧标签
function closeRightTags() {
  tagsViewStore.delRightViews(selectedTag.value).then((res: any) => {
    if (
      !res.visitedViews.find((item: any) => item.fullPath === route.fullPath)
    ) {
      toLastView(res.visitedViews);
    }
  });
}

// 关闭其他标签
function closeOtherTags() {
  router.push(selectedTag.value);
  tagsViewStore.delOtherViews(selectedTag.value).then(() => {
    moveToCurrentTag();
  });
}

// 关闭所有标签
function closeAllTags(view: TagView) {
  tagsViewStore.delAllViews().then((res: any) => {
    toLastView(res.visitedViews, view);
  });
}

// 打开标签菜单
function openTagMenu(tag: TagView, e: MouseEvent) {
  const menuMinWidth = 105;

  const offsetLeft = proxy?.$el.getBoundingClientRect().left; // container margin left
  const offsetWidth = proxy?.$el.offsetWidth; // container width
  const maxLeft = offsetWidth - menuMinWidth; // left boundary
  const l = e.clientX - offsetLeft + 15; // 15: margin right

  if (l > maxLeft) {
    left.value = maxLeft;
  } else {
    left.value = l;
  }

  top.value = e.clientY;
  tagMenuVisible.value = true;
  selectedTag.value = tag;
}

// 关闭标签菜单
function closeTagMenu() {
  tagMenuVisible.value = false;
}

// 处理滚动
function handleScroll() {
  closeTagMenu();
}

// 查找最外层的父级
function findOutermostParent(tree: any[], findName: string) {
  let parentMap: any = {};

  function buildParentMap(node: any, parent: any) {
    parentMap[node.name] = parent;

    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        buildParentMap(node.children[i], node);
      }
    }
  }

  for (let i = 0; i < tree.length; i++) {
    buildParentMap(tree[i], null);
  }

  let currentNode = parentMap[findName];
  while (currentNode) {
    if (!parentMap[currentNode.name]) {
      return currentNode;
    }
    currentNode = parentMap[currentNode.name];
  }

  return null;
}

// 如果是混合模式，更改selectedTag，需要对应高亮的activeTop
const againActiveTop = (newVal: string) => {
  if (layout.value !== "mix") return;
  const parent = findOutermostParent(permissionStore.routes, newVal);
  if (appStore.activeTopMenu !== parent.path) {
    appStore.changeTopActive(parent.path);
  }
};

// 监听路由名称变化，以更新顶部菜单激活状态
watch(
  () => route.name,
  (newVal) => {
    if (newVal) {
      againActiveTop(newVal as string);
    }
  },
  {
    deep: true,
  }
);

// 组件挂载时初始化标签
onMounted(() => {
  initTags();
});
</script>

<template>
  <!-- 标签容器 -->
  <div class="tags-container">
    <!-- 滚动面板 -->
    <scroll-pane ref="scrollPaneRef" @scroll="handleScroll">
      <!-- 动态生成路由链接作为标签 -->
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :class="'tags-item ' + (isActive(tag) ? 'active' : '')"
        :data-path="tag.path"
        :to="{ path: tag.path, query: tag.query }"
        @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''"
        @contextmenu.prevent="openTagMenu(tag, $event)"
      >
        <!-- 标签标题，使用i18n进行国际化处理 -->
        {{ translateRouteTitleI18n(tag.meta?.title) }}
        <!-- 关闭按���，非固定标签显示 -->
        <span
          v-if="!isAffix(tag)"
          class="tags-item-close"
          @click.prevent.stop="closeSelectedTag(tag)"
        >
          <i-ep-close class="text-[10px]" />
        </span>
      </router-link>
    </scroll-pane>

    <!-- 标签操作菜单 -->
    <ul
      v-show="tagMenuVisible"
      class="tag-menu"
      :style="{ left: left + 'px', top: top + 'px' }"
    >
      <li @click="refreshSelectedTag(selectedTag)">
        <svg-icon icon-class="refresh" />
        刷新
      </li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">
        <svg-icon icon-class="close" />
        关闭
      </li>
      <li @click="closeOtherTags">
        <svg-icon icon-class="close_other" />
        关闭其它
      </li>
      <li v-if="!isFirstView()" @click="closeLeftTags">
        <svg-icon icon-class="close_left" />
        关���左侧
      </li>
      <li v-if="!isLastView()" @click="closeRightTags">
        <svg-icon icon-class="close_right" />
        关闭右侧
      </li>
      <li @click="closeAllTags(selectedTag)">
        <svg-icon icon-class="close_all" />
        关闭所有
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
/* 样式省略，主要用于定义标签容器、标签项、操作菜单的样式 */
</style>

<style lang="scss" scoped>
.tags-container {
  width: 100%;
  height: 34px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 1px 1px var(--el-box-shadow-light);

  .tags-item {
    display: inline-block;
    padding: 3px 8px;
    margin: 4px 0 0 5px;
    font-size: 12px;
    cursor: pointer;
    border: 1px solid var(--el-border-color-light);

    &:first-of-type {
      margin-left: 15px;
    }

    &:last-of-type {
      margin-right: 15px;
    }

    &:hover {
      color: var(--el-color-primary);
    }

    &.active {
      color: #fff;
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);

      &::before {
        display: inline-block;
        width: 8px;
        height: 8px;
        margin-right: 5px;
        content: "";
        background: #fff;
        border-radius: 50%;
      }
    }

    &-close {
      border-radius: 100%;

      &:hover {
        color: #fff;
        background: rgb(0 0 0 / 16%);
      }
    }
  }
}

.tag-menu {
  position: absolute;
  z-index: 99;
  font-size: 12px;
  background: var(--el-bg-color-overlay);
  border-radius: 4px;
  box-shadow: var(--el-box-shadow-light);

  li {
    padding: 8px 16px;
    cursor: pointer;

    &:hover {
      background: var(--el-fill-color-light);
    }
  }
}
</style>
