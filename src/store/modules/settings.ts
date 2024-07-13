import { defineStore } from "pinia";
import defaultSettings from "@/settings";
import { useStorage } from "@vueuse/core";
import { ref } from "vue";

// 定义一个名为“setting”的store
export const useSettingsStore = defineStore("setting", () => {
  // state 状态
  // 使用localStorage存储tagsView的状态，默认值来自defaultSettings
  const tagsView = useStorage<boolean>("tagsView", defaultSettings.tagsView);

  // 使用ref创建响应式变量，初始值来自defaultSettings
  const showSettings = ref<boolean>(defaultSettings.showSettings);
  const fixedHeader = ref<boolean>(defaultSettings.fixedHeader);
  const sidebarLogo = ref<boolean>(defaultSettings.sidebarLogo);

  // 使用localStorage存储layout的状态，默认值来自defaultSettings
  const layout = useStorage<string>("layout", defaultSettings.layout);

  // actions 行为
  // 更改设置的函数，接受一个对象参数，包含要更改的设置项的key和新的value
  function changeSetting(param: { key: string; value: any }) {
    const { key, value } = param;
    switch (key) {
      case "showSettings":
        showSettings.value = value;
        break;
      case "fixedHeader":
        fixedHeader.value = value;
        break;
      case "tagsView":
        tagsView.value = value;
        break;
      case "sidevarLogo":
        sidebarLogo.value = value;
        break;
      case "layout":
        layout.value = value;
        break;
      default:
        break;
    }
  }

  // 返回store的公开属性和方法
  return {
    showSettings,
    tagsView,
    fixedHeader,
    sidebarLogo,
    layout,
    changeSetting,
  };
});
