/// <reference types="vite/client" />

// 允许 TypeScript 识别 .vue 文件模块
declare module "*.vue" {
  import { DefineComponent } from "vue";
  // 定义组件类型，允��任意 props, emits, slots 等
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 定义环境变量的 TypeScript 类型，以便在项目中使用时提供智能提示
interface ImportMetaEnv {
  VITE_APP_TITLE: string; // 应用标题
  VITE_APP_PORT: string; // 应用运行端口
  VITE_APP_BASE_API: string; // API 基础路径
}

// 扩展 ImportMeta 接口，包含 env 属性
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 声明 lodash-es 模块，允许在 TypeScript 项目中导入和使用
declare module "lodash-es";
