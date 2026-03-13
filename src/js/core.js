/**
 * Better Me - 核心資料管理模組
 * 統一處理所有數據的 CRUD 操作和持久化
 */

class GoalManager {
  constructor(storage) {
    this.storageKey = 'betterme:goals';
    // 支援注入 storage（測試環境），預設使用瀏覽器 localStorage
    this.storage = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
  }

  // 讀取所有目標
  getAllGoals() {
    try {
      return JSON.parse(this.storage.getItem(this.storageKey) || '[]');
    } catch (e) {
      console.error('讀取目標失敗:', e);
      return [];
    }
  }

  // 保存所有目標
  saveGoals(goals) {
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(goals));
    } catch (e) {
      console.error('保存目標失敗:', e);
    }
  }

  // 新增目標
  addGoal(goalData) {
    const goals = this.getAllGoals();
    const newGoal = {
      id: 'g_' + Math.random().toString(36).slice(2, 10),
      title: goalData.title,
      category: goalData.category,
      description: goalData.description,
      startDate: goalData.startDate || new Date().toISOString().slice(0, 10),
      targetDate: goalData.targetDate,
      quantValue: goalData.quantValue || 0,
      quantUnit: goalData.quantUnit || '',
      schedule: goalData.schedule || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    goals.push(newGoal);
    this.saveGoals(goals);
    return newGoal;
  }

  // 取得單一目標
  getGoal(id) {
    const goals = this.getAllGoals();
    return goals.find(g => g.id === id);
  }

  // 更新目標
  updateGoal(id, updates) {
    const goals = this.getAllGoals();
    const index = goals.findIndex(g => g.id === id);
    if (index !== -1) {
      goals[index] = { ...goals[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveGoals(goals);
      return goals[index];
    }
    return null;
  }

  // 刪除目標
  deleteGoal(id) {
    const goals = this.getAllGoals();
    const filtered = goals.filter(g => g.id !== id);
    this.saveGoals(filtered);
  }

  // 生成習慣排程
  generateHabitSchedule(goal) {
    const startDate = new Date(goal.startDate);
    const targetDate = new Date(goal.targetDate);
    const days = Math.ceil((targetDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const schedule = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().slice(0, 10);

      schedule.push({
        date: dateStr,
        text: `${goal.title}`,
        amount: goal.quantValue,
        unit: goal.quantUnit,
        done: false
      });
    }

    return schedule;
  }

  // 更新排程項目狀態
  updateScheduleItem(goalId, date, done) {
    const goal = this.getGoal(goalId);
    if (goal && goal.schedule) {
      const item = goal.schedule.find(s => s.date === date);
      if (item) {
        item.done = done;
        this.updateGoal(goalId, { schedule: goal.schedule });
      }
    }
  }

  // 計算進度
  getGoalProgress(goal) {
    if (!goal.schedule || goal.schedule.length === 0) {
      return { done: 0, total: 0, percentage: 0 };
    }

    const done = goal.schedule.filter(s => s.done).length;
    const total = goal.schedule.length;
    const percentage = Math.round((done / total) * 100);

    return { done, total, percentage };
  }

  // 計算剩餘天數
  getDaysRemaining(goal) {
    const today = new Date();
    const target = new Date(goal.targetDate);
    const days = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return Math.max(days, 0);
  }
}

// 全局實例（瀏覽器環境）或模組匯出（Node.js 測試環境）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GoalManager;
} else {
  window.goalManager = new GoalManager();
}
