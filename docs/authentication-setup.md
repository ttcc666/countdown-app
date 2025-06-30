# 倒计时应用认证功能设置指南

## 概述

本应用已集成完整的用户认证功能，使用Supabase作为后端服务。每个用户只能访问和管理自己的倒计时数据。

## 功能特性

- ✅ 用户注册（邮箱验证）
- ✅ 用户登录
- ✅ 密码重置
- ✅ 自动登录状态保持
- ✅ 安全登出
- ✅ 数据隔离（用户只能访问自己的数据）
- ✅ 响应式UI设计
- ✅ 深色/浅色主题支持

## 设置步骤

### 1. 环境变量配置

复制 `.env.example` 文件为 `.env`：
```bash
cp .env.example .env
```

在 `.env` 文件中填入您的Supabase项目信息：
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. 数据库设置

在Supabase项目中执行 `database/migrations/add_user_auth.sql` 脚本：

1. 登录Supabase Dashboard
2. 进入SQL Editor
3. 复制并执行迁移脚本
4. 确认所有策略和触发器创建成功

### 3. 认证设置

在Supabase Dashboard中配置认证：

1. 进入 Authentication > Settings
2. 启用Email认证
3. 配置邮件模板（可选）
4. 设置重定向URL：
   - Site URL: `http://localhost:5173` (开发环境)
   - Redirect URLs: `http://localhost:5173/auth/callback`

## 使用说明

### 用户注册
1. 访问 `/register` 页面
2. 输入邮箱和密码（至少6位，包含字母和数字）
3. 点击注册按钮
4. 检查邮箱并点击确认链接

### 用户登录
1. 访问 `/login` 页面
2. 输入注册时的邮箱和密码
3. 点击登录按钮

### 密码重置
1. 在登录页面点击"忘记密码？"
2. 输入邮箱地址
3. 检查邮箱并点击重置链接
4. 设置新密码

## 安全特性

- **行级安全性（RLS）**：数据库层面确保用户只能访问自己的数据
- **JWT认证**：使用Supabase的安全JWT令牌
- **密码强度验证**：要求密码包含字母和数字
- **邮箱验证**：新用户必须验证邮箱才能使用
- **自动登出**：会话过期时自动重定向到登录页

## 故障排除

### 常见问题

1. **登录后白屏**
   - 检查环境变量是否正确配置
   - 确认数据库迁移已执行

2. **无法注册**
   - 检查Supabase认证设置
   - 确认邮件服务配置正确

3. **数据不显示**
   - 确认RLS策略已正确设置
   - 检查用户是否已登录

### 开发调试

启用开发模式查看详细日志：
```bash
pnpm dev
```

检查浏览器控制台的错误信息，大多数认证问题会在控制台显示详细错误。

## 技术架构

- **前端路由**：Vue Router 4 with 路由守卫
- **状态管理**：Vue 3 Composition API
- **UI组件**：Element Plus
- **认证服务**：Supabase Auth
- **数据库**：PostgreSQL with RLS
- **类型安全**：TypeScript
