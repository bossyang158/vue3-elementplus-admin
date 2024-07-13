import { defineStore } from "pinia";
import { RouteLocationNormalized } from "vue-router";
import { ref } from "vue";

export interface TagView extends Partial<RouteLocationNormalized> {
  title?: string;
}

// 设置
export const useTagsViewStore = defineStore("tagsView", () => {
  // 状态
  const visitedViews = ref<TagView[]>([]); // 已访问视图
  const cachedViews = ref<string[]>([]); // 缓存视图

  // 动作
  // 添加已访问视图
  function addVisitedView(view: TagView) {
    if (visitedViews.value.some((v) => v.path === view.path)) return;
    if (view.meta && view.meta.affix) {
      visitedViews.value.unshift(
        Object.assign({}, view, {
          title: view.meta?.title || "no-name",
        })
      );
    } else {
      visitedViews.value.push(
        Object.assign({}, view, {
          title: view.meta?.title || "no-name",
        })
      );
    }
  }

  // 添加缓存视图
  function addCachedView(view: TagView) {
    const viewName = view.name as string;
    if (cachedViews.value.includes(viewName)) return;
    if (view.meta?.keepAlive) {
      cachedViews.value.push(viewName);
    }
  }

  // 删除已访问视图
  function delVisitedView(view: TagView) {
    return new Promise((resolve) => {
      for (const [i, v] of visitedViews.value.entries()) {
        if (v.path === view.path) {
          visitedViews.value.splice(i, 1);
          break;
        }
      }
      resolve([...visitedViews.value]);
    });
  }

  // 删除缓存视图
  function delCachedView(view: TagView) {
    const viewName = view.name as string;
    return new Promise((resolve) => {
      const index = cachedViews.value.indexOf(viewName);
      index > -1 && cachedViews.value.splice(index, 1);
      resolve([...cachedViews.value]);
    });
  }

  // 删除其他已访问视图
  function delOtherVisitedViews(view: TagView) {
    return new Promise((resolve) => {
      visitedViews.value = visitedViews.value.filter((v) => {
        return v.meta?.affix || v.path === view.path;
      });
      resolve([...visitedViews.value]);
    });
  }

  // 删除其他缓存视图
  function delOtherCachedViews(view: TagView) {
    const viewName = view.name as string;
    return new Promise((resolve) => {
      const index = cachedViews.value.indexOf(viewName);
      if (index > -1) {
        cachedViews.value = cachedViews.value.slice(index, index + 1);
      } else {
        // 如果 index = -1，表示没有缓存的标签
        cachedViews.value = [];
      }
      resolve([...cachedViews.value]);
    });
  }

  // 更新已访问视图
  function updateVisitedView(view: TagView) {
    for (let v of visitedViews.value) {
      if (v.path === view.path) {
        v = Object.assign(v, view);
        break;
      }
    }
  }

  // 添加视图
  function addView(view: TagView) {
    addVisitedView(view);
    addCachedView(view);
  }

  // 删除视图
  function delView(view: TagView) {
    return new Promise((resolve) => {
      delVisitedView(view);
      delCachedView(view);
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      });
    });
  }

  // 删除其他视图
  function delOtherViews(view: TagView) {
    return new Promise((resolve) => {
      delOtherVisitedViews(view);
      delOtherCachedViews(view);
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      });
    });
  }

  // 删除左侧视图
  function delLeftViews(view: TagView) {
    return new Promise((resolve) => {
      const currIndex = visitedViews.value.findIndex(
        (v) => v.path === view.path
      );
      if (currIndex === -1) {
        return;
      }
      visitedViews.value = visitedViews.value.filter((item, index) => {
        // affix:true 固定标签，例如“首页”
        if (index >= currIndex || (item.meta && item.meta.affix)) {
          return true;
        }

        const cacheIndex = cachedViews.value.indexOf(item.name as string);
        if (cacheIndex > -1) {
          cachedViews.value.splice(cacheIndex, 1);
        }
        return false;
      });
      resolve({
        visitedViews: [...visitedViews.value],
      });
    });
  }

  // 删除右侧视图
  function delRightViews(view: TagView) {
    return new Promise((resolve) => {
      const currIndex = visitedViews.value.findIndex(
        (v) => v.path === view.path
      );
      if (currIndex === -1) {
        return;
      }
      visitedViews.value = visitedViews.value.filter((item, index) => {
        // affix:true 固定标签，例如“首页”
        if (index <= currIndex || (item.meta && item.meta.affix)) {
          return true;
        }

        const cacheIndex = cachedViews.value.indexOf(item.name as string);
        if (cacheIndex > -1) {
          cachedViews.value.splice(cacheIndex, 1);
        }
        return false;
      });
      resolve({
        visitedViews: [...visitedViews.value],
      });
    });
  }

  // 删除所有视图
  function delAllViews() {
    return new Promise((resolve) => {
      const affixTags = visitedViews.value.filter((tag) => tag.meta?.affix);
      visitedViews.value = affixTags;
      cachedViews.value = [];
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      });
    });
  }

  // 删除所有已访问视图
  function delAllVisitedViews() {
    return new Promise((resolve) => {
      const affixTags = visitedViews.value.filter((tag) => tag.meta?.affix);
      visitedViews.value = affixTags;
      resolve([...visitedViews.value]);
    });
  }

  // 删除所有缓存视图
  function delAllCachedViews() {
    return new Promise((resolve) => {
      cachedViews.value = [];
      resolve([...cachedViews.value]);
    });
  }

  return {
    visitedViews,
    cachedViews,
    addVisitedView,
    addCachedView,
    delVisitedView,
    delCachedView,
    delOtherVisitedViews,
    delOtherCachedViews,
    updateVisitedView,
    addView,
    delView,
    delOtherViews,
    delLeftViews,
    delRightViews,
    delAllViews,
    delAllVisitedViews,
    delAllCachedViews,
  };
});
