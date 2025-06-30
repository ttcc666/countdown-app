# 倒计时应用部署指南

## 部署前准备

### 1. Supabase项目配置

1. **创建Supabase项目**
   - 访问 [supabase.com](https://supabase.com)
   - 创建新项目
   - 记录项目URL和anon key

2. **执行数据库迁移**
   ```sql
   -- 在Supabase SQL Editor中执行
   -- 复制 database/migrations/add_user_auth.sql 的内容
   ```

3. **配置认证设置**
   - 进入 Authentication > Settings
   - 启用Email认证
   - 设置Site URL和Redirect URLs

### 2. 环境变量设置

创建生产环境的环境变量：
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

## Web部署

### Vercel部署

1. **连接GitHub仓库**
   ```bash
   # 推送代码到GitHub
   git add .
   git commit -m "Add authentication features"
   git push origin main
   ```

2. **在Vercel中导入项目**
   - 访问 [vercel.com](https://vercel.com)
   - 导入GitHub仓库
   - 配置环境变量
   - 部署

3. **更新Supabase重定向URL**
   ```
   Site URL: https://your-app.vercel.app
   Redirect URLs: https://your-app.vercel.app/auth/callback
   ```

### Netlify部署

1. **构建设置**
   ```toml
   # netlify.toml
   [build]
     command = "pnpm build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **环境变量配置**
   - 在Netlify Dashboard中设置环境变量
   - 添加VITE_SUPABASE_URL和VITE_SUPABASE_ANON_KEY

## 桌面应用部署

### Windows

1. **构建应用**
   ```bash
   pnpm electron:build
   ```

2. **生成安装包**
   - 安装包位于 `dist/` 目录
   - 分发 `.exe` 文件

### macOS

1. **代码签名（可选）**
   ```bash
   # 需要Apple Developer账号
   export CSC_LINK="path/to/certificate.p12"
   export CSC_KEY_PASSWORD="certificate_password"
   ```

2. **构建应用**
   ```bash
   pnpm electron:build
   ```

### Linux

1. **构建AppImage**
   ```bash
   pnpm electron:build
   ```

2. **分发**
   - 生成的AppImage可直接运行
   - 无需安装过程

## 生产环境优化

### 1. 性能优化

```typescript
// vite.config.ts 优化配置
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          ui: ['element-plus'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

### 2. 安全配置

```typescript
// 生产环境安全检查
if (import.meta.env.PROD) {
  // 禁用开发工具
  console.log = () => {}
  console.warn = () => {}
  console.error = () => {}
}
```

### 3. 错误监控

建议集成错误监控服务：
- Sentry
- LogRocket
- Bugsnag

## 监控和维护

### 1. 性能监控

- 使用Lighthouse检查性能
- 监控Core Web Vitals
- 设置性能预算

### 2. 用户反馈

- 集成用户反馈系统
- 监控错误日志
- 定期更新依赖

### 3. 备份策略

- 定期备份Supabase数据
- 版本控制代码
- 文档化部署流程

## 故障排除

### 常见部署问题

1. **环境变量未生效**
   - 检查变量名前缀（VITE_）
   - 确认部署平台已设置变量

2. **路由404错误**
   - 配置SPA重定向规则
   - 检查服务器配置

3. **认证回调失败**
   - 验证重定向URL配置
   - 检查CORS设置

4. **桌面应用白屏**
   - 检查base路径配置
   - 验证资源路径

## 更新部署

### 自动化部署

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: pnpm install
      - run: pnpm build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 版本管理

```bash
# 发布新版本
npm version patch
git push origin main --tags
```