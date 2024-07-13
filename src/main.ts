// 导入Vue创建应用的函数
import { createApp } from "vue";
// 导入App组件
import App from "./App.vue";
// 导入路由配置
import router from "@/router";
// 导入状态管理店配置
import { setupStore } from "@/store";
// 导入自定义指令配置
import { setupDirective } from "@/directive";
// 初始化权限管理
import "@/permission";
// 注册虚拟SVG图标
import "virtual:svg-icons-register";
// 引入国际化配置
import i18n from "@/lang/index";
// 引入Element Plus的黑暗主题样式
import "element-plus/theme-chalk/dark/css-vars.css";
// 引入全局scss样式
import "@/styles/index.scss";
// 引入Uno CSS框架
import "uno.css";

// 创建Vue应用实例
const app = createApp(App);
// 注册自定义指令
// 全局注册 自定义指令(directive)
setupDirective(app);
// 注册状态管理
// 全局注册 状态管理(store)
setupStore(app);

// 使用路由和国际化插件，并将应用挂载到HTML的#app元素上
app.use(router).use(i18n).mount("#app");
