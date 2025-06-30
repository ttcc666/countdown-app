# 🕐 倒计时应用 - 带用户认证功能

一个功能丰富的倒计时应用，支持多种倒计时类型、用户认证、数据同步等功能。使用 Vue 3 + TypeScript + Supabase 构建，可作为 Web 应用或桌面应用运行。

![Vue](https://img.shields.io/badge/Vue-3.5.17-4FC08D?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?style=flat-square&logo=supabase)
![Element Plus](https://img.shields.io/badge/Element%20Plus-2.10.2-409EFF?style=flat-square)

## ✨ 功能特性

### 🔐 用户认证
- ✅ 用户注册（邮箱验证）
- ✅ 用户登录（邮箱+密码）
- ✅ 密码重置功能
- ✅ 自动登录状态保持
- ✅ 安全登出功能
- ✅ 用户数据完全隔离

### ⏰ 倒计时功能
- ✅ 多种倒计时类型（一次性、每年、每月、每日、每时、每周、每N天）
- ✅ 自定义显示单位
- ✅ 倒计时分类和标签
- ✅ 拖拽排序
- ✅ 搜索和筛选
- ✅ 数据导入/导出

### 🎨 用户界面
- ✅ 美观的现代化界面
- ✅ 响应式设计（支持移动端）
- ✅ 深色/浅色主题切换
- ✅ 流畅的动画效果
- ✅ Element Plus 组件库

### 🔔 提醒功能
- ✅ 桌面通知
- ✅ 声音提醒
- ✅ 自定义提醒时间

## 🚀 快速开始

### 环境要求

- Node.js 18.x 或更高版本
- pnpm（推荐）或 npm
- Supabase 账号

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/countdown-app.git
   cd countdown-app
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env
   ```

   在 `.env` 文件中填入您的 Supabase 配置：
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **设置数据库**
   - 在 Supabase Dashboard 中执行 `database/migrations/add_user_auth.sql` 脚本
   - 配置认证设置（详见 `docs/authentication-setup.md`）

5. **启动开发服务器**
   ```bash
   pnpm dev
   ```

6. **构建桌面应用（可选）**
   ```bash
   pnpm electron:build
   ```

## 🛠️ 技术栈

- **前端框架**: Vue 3 + TypeScript + Vite
- **UI 组件库**: Element Plus
- **路由管理**: Vue Router 4
- **状态管理**: Composition API
- **后端服务**: Supabase (认证 + 数据库)
- **桌面应用**: Electron
- **包管理器**: pnpm

## 打包部署

要将应用打包为桌面程序，请运行以下命令：

```bash
# 确保以管理员身份运行终端，尤其是在 Windows 上
pnpm electron:build
```

打包完成后，可执行文件将生成在项目根目录下的 `dist` 文件夹中。

## 功能说明

- **倒计时显示：** 页面顶部会显示距离下班时间的倒计时，精确到天、时、分、秒。
- **设置下班时间：** 点击页面下方的“设置下班时间”区域，可以使用日期时间选择器来选择你希望的下班时间。选择后点击“保存设置”，倒计时将立即更新，并且你的设置会被保存到本地存储中，下次打开应用时会自动加载。

## 注意事项

- **Node.js 版本：** 本项目在 Node.js 18.18.1 环境下测试通过。如果遇到兼容性问题，请尝试使用此版本或更高版本。
- **Electron 打包权限：** 在 Windows 上打包时，如果遇到“无法创建符号链接”等权限问题，请务必以管理员身份运行终端。
- **白屏问题：** 如果打包后桌面应用出现白屏，请检查 `vite.config.ts` 中的 `base` 配置是否为 `./`。