// 导入Vue插件，用于支持Vue组件和模板的解析
import vue from "@vitejs/plugin-vue";

// 导入Vite的相关配置工具
import { UserConfig, ConfigEnv, loadEnv, defineConfig } from "vite";

// 导入自动导入插件，用于自动导入Vue组件等
import AutoImport from "unplugin-auto-import/vite";
// 导入Vue组件插件，用于自动注册Vue组件
import Components from "unplugin-vue-components/vite";
// 导入ElementPlus解析器，用于支持ElementPlus组件的自动注册
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

// 导入图标插件，用于自动解析和引入图标
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";

// 导入SVG图标插件，用于处理SVG图标
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

// 导入模拟服务插件，用于开发环境中的API模拟
import { viteMockServe } from "vite-plugin-mock";
// 导入可视化分析插件，用于展示打包结果的依赖关系图
import visualizer from "rollup-plugin-visualizer";

// 导入 UnoCSS，用于基于规则自动生成CSS
import UnoCSS from "unocss/vite";
// 导入path模块，用于路径操作
import path from "path";

// 导入压缩插件，用于对打包结果进行压缩
import viteCompression from "vite-plugin-compression";

// 定义源代码目录的路径
const pathSrc = path.resolve(__dirname, "src");

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  /**
   * 根据当前运行环境加载配置变量。
   *
   * 本行代码通过调用loadEnv函数，根据指定的运行模式和当前工作目录，加载相应的环境变量。
   * 这些环境变量可能是应用程序运行所必需的，例如数据库连接字符串、API密钥等。
   * 使用环境变量的好处是，它可以让我们在不同的环境中部署应用程序时，轻松地切换配置，而无需修改代码本身。
   *
   * @param mode 运行模式，决定了加载哪个环境的变量。例如，可以是'dev'（开发环境）或'prod'（生产环境）。
   * @param process.cwd() 当前工作目录。loadEnv函数将根据这个目录来查找环境变量文件。
   * @returns 返回一个对象，包含了加载的环境变量。这个对象的结构和具体的环境变量名称取决于环境文件的定义。
   */
  const env = loadEnv(mode, process.cwd());

  return {
    define: {
      // 定义全局变量，用于在代码中通过process.env.__VUE_I18N_FULL_INSTALL__访问 __VUE_I18N_FULL_INSTALL__ 变量
      __VUE_I18N_FULL_INSTALL__: true,
      // 启用 Vue I18n 的旧 API
      __VUE_I18N_LEGACY_API__: false,
      // 禁用 Vue I18n 的开发工具
      __INTLIFY_PROD_DEVTOOLS__: false,
    },
    resolve: {
      // 定义模块解析的别名
      alias: {
        // 使用 "@" 符��代替 "src" 目录的绝对路径
        // 这样在导入模块时可以更简洁地引用位于源代码目录下的文件
        "@": pathSrc,
      },
    },
    css: {
      // CSS 预处理器
      preprocessorOptions: {
        // CSS 预处理器选项
        scss: {
          // 允许在 SCSS 中使用 JavaScript 表达式
          javascriptEnabled: true,
          // 全局 SCSS 变量
          // 使用 `@use` 规则导入全局样式文件 `variables.scss`
          // `as *` 表示导入文件中的所有变量，使它们在全局范围内可用
          // 这样做可以避免在每个样式文件中重复导入相同的变量文件
          additionalData: `
            @use "@/styles/variables.scss" as *;
          `,
        },
      },
    },
    server: {
      // 设置服务器监听的主机地址，"0.0.0.0" 表示监听所有网络接口
      host: "0.0.0.0",
      // 从环境变量中读取端口号，并将其转换为数字类型
      port: Number(env.VITE_APP_PORT),
      // 设为 true 时，服务器启动后会自动打开浏览器
      open: true,
      proxy: {
        // 配置代理，用于解决开发环境下的跨域请求问题
        [env.VITE_APP_BASE_API]: {
          // 目标服务器地址，所有匹配 VITE_APP_BASE_API 的请求都会被代理到这个地址
          target: env.VITE_APP_TARGET_URL,
          // 是否更改代理请求中的原始主机头为目标URL
          changeOrigin: true,
          // 重写请求路径，将环境变量 VITE_APP_BASE_API 替换为 VITE_APP_TARGET_BASE_API
          rewrite: (path) =>
            path.replace(
              new RegExp("^" + env.VITE_APP_BASE_API),
              env.VITE_APP_TARGET_BASE_API
            ),
        },
      },
    },
    plugins: [
      vue(),
      UnoCSS({}),
      AutoImport({
        // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
        imports: ["vue", "@vueuse/core"],
        eslintrc: {
          enabled: false,
          filepath: "./.eslintrc-auto-import.json",
          globalsPropValue: true,
        },
        resolvers: [
          // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
          ElementPlusResolver(),
          IconsResolver({}),
        ],
        vueTemplate: true,
        // 配置文件生成位置(false:关闭自动生成)
        dts: false,
        // dts: "src/types/auto-imports.d.ts",
      }),

      Components({
        resolvers: [
          // 自动导入 Element Plus 组件
          ElementPlusResolver(),
          // 自动导入图标组件
          IconsResolver({
            // @iconify-json/ep 是 Element Plus 的图标库
            enabledCollections: ["ep"],
          }),
        ],
        // 指定自定义组件位置(默认:src/components)
        dirs: ["src/**/components"],
        // 配置文件位置(false:关闭自动生成)
        dts: false,
        // dts: "src/types/components.d.ts",
      }),

      Icons({
        // 自动安装图标库
        autoInstall: true,
      }),

      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [path.resolve(pathSrc, "assets/icons")],
        // 指定symbolId格式
        symbolId: "icon-[dir]-[name]",
      }),
      // 代码压缩
      viteCompression({
        verbose: true, // 默认即可
        disable: true, // 是否禁用压缩，默认禁用，true为禁用,false为开启，打开压缩需配置nginx支持
        deleteOriginFile: true, // 删除源文件
        threshold: 10240, // 压缩前最小文件大小
        algorithm: "gzip", // 压缩算法
        ext: ".gz", // 文件类型
      }),

      viteMockServe({
        ignore: /^\_/, // 忽略以 "_" 开头的文件，不将它��作为mock文件处理
        mockPath: "mock", // 指定存放mock文件的目录
        enable: mode === "development", // 仅在开发模式下启用mock服务
        // https://github.com/anncwb/vite-plugin-mock/issues/9
      }),

      visualizer({
        filename: "./stats.html", // 指定可视化报告的文件名
        open: false, // 生成报告后不自动打开
        gzipSize: true, // 显示gzip后的大小
        brotliSize: true, // 显示Brotli压缩后的大小
      }),
    ],
    // 预加载项目必需的组件
    optimizeDeps: {
      include: [
        "vue",
        "vue-router",
        "pinia",
        "axios",
        "element-plus/es/components/form/style/css",
        "element-plus/es/components/form-item/style/css",
        "element-plus/es/components/button/style/css",
        "element-plus/es/components/input/style/css",
        "element-plus/es/components/input-number/style/css",
        "element-plus/es/components/switch/style/css",
        "element-plus/es/components/upload/style/css",
        "element-plus/es/components/menu/style/css",
        "element-plus/es/components/col/style/css",
        "element-plus/es/components/icon/style/css",
        "element-plus/es/components/row/style/css",
        "element-plus/es/components/tag/style/css",
        "element-plus/es/components/dialog/style/css",
        "element-plus/es/components/loading/style/css",
        "element-plus/es/components/radio/style/css",
        "element-plus/es/components/radio-group/style/css",
        "element-plus/es/components/popover/style/css",
        "element-plus/es/components/scrollbar/style/css",
        "element-plus/es/components/tooltip/style/css",
        "element-plus/es/components/dropdown/style/css",
        "element-plus/es/components/dropdown-menu/style/css",
        "element-plus/es/components/dropdown-item/style/css",
        "element-plus/es/components/sub-menu/style/css",
        "element-plus/es/components/menu-item/style/css",
        "element-plus/es/components/divider/style/css",
        "element-plus/es/components/card/style/css",
        "element-plus/es/components/link/style/css",
        "element-plus/es/components/breadcrumb/style/css",
        "element-plus/es/components/breadcrumb-item/style/css",
        "element-plus/es/components/table/style/css",
        "element-plus/es/components/tree-select/style/css",
        "element-plus/es/components/table-column/style/css",
        "element-plus/es/components/select/style/css",
        "element-plus/es/components/option/style/css",
        "element-plus/es/components/pagination/style/css",
        "element-plus/es/components/tree/style/css",
        "element-plus/es/components/alert/style/css",
        "element-plus/es/components/radio-button/style/css",
        "element-plus/es/components/checkbox-group/style/css",
        "element-plus/es/components/checkbox/style/css",
        "element-plus/es/components/tabs/style/css",
        "element-plus/es/components/tab-pane/style/css",
        "element-plus/es/components/rate/style/css",
        "element-plus/es/components/date-picker/style/css",
        "element-plus/es/components/notification/style/css",
        "@vueuse/core",
        "sortablejs",

        "path-to-regexp",
        "echarts",
        "@wangeditor/editor",
        "@wangeditor/editor-for-vue",
        "vue-i18n",
        "codemirror",
      ],
    },
  };
});
