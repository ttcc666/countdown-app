-- 为倒计时应用添加用户认证支持的数据库迁移脚本
-- 执行此脚本前，请确保已在Supabase项目中启用了认证功能

-- 1. 为countdowns表添加user_id字段
ALTER TABLE countdowns 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. 为现有数据设置默认user_id（如果有现有数据的话）
-- 注意：这只是一个示例，实际使用时可能需要根据具体情况调整
-- UPDATE countdowns SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- 3. 启用行级安全性（RLS）
ALTER TABLE countdowns ENABLE ROW LEVEL SECURITY;

-- 4. 创建RLS策略：用户只能查看自己的倒计时
CREATE POLICY "Users can view their own countdowns" ON countdowns
    FOR SELECT USING (auth.uid() = user_id);

-- 5. 创建RLS策略：用户只能插入自己的倒计时
CREATE POLICY "Users can insert their own countdowns" ON countdowns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. 创建RLS策略：用户只能更新自己的倒计时
CREATE POLICY "Users can update their own countdowns" ON countdowns
    FOR UPDATE USING (auth.uid() = user_id);

-- 7. 创建RLS策略：用户只能删除自己的倒计时
CREATE POLICY "Users can delete their own countdowns" ON countdowns
    FOR DELETE USING (auth.uid() = user_id);

-- 8. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_countdowns_user_id ON countdowns(user_id);

-- 9. 可选：创建一个函数来自动设置user_id
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 创建触发器，在插入时自动设置user_id
CREATE TRIGGER set_user_id_trigger
    BEFORE INSERT ON countdowns
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();

-- 完成迁移
-- 注意：执行此脚本后，所有现有的倒计时数据将需要关联到特定用户
-- 如果有现有数据，请在执行前备份数据库