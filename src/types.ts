export interface CountdownItem {
  id: string;
  name: string;
  targetTime: string; // 对于一次性倒计时，存储完整时间；对于重复倒计时，存储基准时间
  type: 'once' | 'yearly' | 'monthly' | 'daily' | 'hourly' | 'weekly' | 'every_n_days';
  repeatValue?: string; // 存储重复的特定值，例如：'MM-DD HH:mm:ss' 或 'DD HH:mm:ss' 或 'HH:mm:ss' 或 'mm:ss' 或 '1,3,5' (周一,周三,周五) 或 '7' (每7天)
  tags?: string[]; // 新增标签字段，支持多标签
  displayUnits?: ('days' | 'hours' | 'minutes' | 'seconds')[]; // 新增显示单位字段
  remindBefore?: number; // 提前提醒的分钟数
  createdAt: string; // 倒计时创建时间，用于排序
  onFinishAction?: 'do_nothing' | 'delete' | 'archive' | 'reset_next_cycle'; // 倒计时结束后的操作
  position: number; // 用于排序
  user_id?: string; // 用户ID，用于数据隔离
}
