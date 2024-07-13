import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import defaultSettings from "@/settings";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import en from "element-plus/es/locale/lang/en";

/**
 * 应用状态管理，提供界面语言、设备类型、侧边栏状态等的管理。
 */
export const useAppStore = defineStore("app", () => {
  // 使用localStorage持久化设备类型，默认为桌面
  const device = useStorage("device", "desktop");
  // 使用localStorage持久化界面大小设置，默认值来自defaultSettings
  const size = useStorage<any>("size", defaultSettings.size);
  // 使用localStorage持久化界面语言设置，默认值来自defaultSettings
  const language = useStorage("language", defaultSettings.language);

  // 使用localStorage持久化侧边栏状态，默认为关闭
  const sidebarStatus = useStorage("sidebarStatus", "closed");

  // 侧边栏状态，包括是否打开和是否无动画
  const sidebar = reactive({
    opened: sidebarStatus.value !== "closed",
    withoutAnimation: false,
  });

  // 使用localStorage持久化顶部菜单激活项
  const activeTopMenu = useStorage("activeTop", "");

  /**
   * 根据当前语言设置返回对应的Element Plus语言包。
   */
  const locale = computed(() => {
    return language.value == "en" ? en : zhCn;
  });

  /**
   * 切换侧边栏的打开状态。
   */
  function toggleSidebar() {
    sidebar.opened = !sidebar.opened;
    sidebar.withoutAnimation = false;
    sidebarStatus.value = sidebar.opened ? "opened" : "closed";
  }

  /**
   * 关闭侧边栏。
   * @param {boolean} withoutAnimation 是否无动画关闭
   */
  function closeSideBar(withoutAnimation: boolean) {
    sidebar.opened = false;
    sidebar.withoutAnimation = withoutAnimation;
    sidebarStatus.value = "closed";
  }

  /**
   * 打开侧边栏。
   * @param {boolean} withoutAnimation 是否无动画打开
   */
  function openSideBar(withoutAnimation: boolean) {
    sidebar.opened = true;
    sidebar.withoutAnimation = withoutAnimation;
    sidebarStatus.value = "opened";
  }

  /**
   * 切换设备类型。
   * @param {string} val 设备类型
   */
  function toggleDevice(val: string) {
    device.value = val;
  }

  /**
   * 更改界面大小设置。
   * @param {string} val 界面大小
   */
  function changeSize(val: string) {
    size.value = val;
  }

  /**
   * 更改界面语言设置。
   * @param {string} val 语言代码
   */
  function changeLanguage(val: string) {
    language.value = val;
  }

  /**
   * 更改混合模式下顶部菜单激活项。
   * @param {string} val 激活项值
   */
  function changeTopActive(val: string) {
    activeTopMenu.value = val;
  }

  return {
    device,
    sidebar,
    language,
    locale,
    size,
    activeTopMenu,
    toggleDevice,
    changeSize,
    changeLanguage,
    toggleSidebar,
    closeSideBar,
    openSideBar,
    changeTopActive,
  };
});
