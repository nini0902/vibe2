'use strict';

const { expect } = require('chai');
const GoalManager = require('../src/js/core.js');

// 模擬 localStorage 為 Node.js 測試環境使用
function createMockStorage() {
  const store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

describe('GoalManager', () => {
  let manager;
  let mockStorage;

  beforeEach(() => {
    mockStorage = createMockStorage();
    manager = new GoalManager(mockStorage);
  });

  // ── getAllGoals ──────────────────────────────────────────────────────────────

  describe('getAllGoals()', () => {
    it('預設回傳空陣列', () => {
      expect(manager.getAllGoals()).to.deep.equal([]);
    });

    it('storage 損毀時回傳空陣列', () => {
      mockStorage.setItem('betterme:goals', 'invalid-json');
      expect(manager.getAllGoals()).to.deep.equal([]);
    });
  });

  // ── addGoal ──────────────────────────────────────────────────────────────────

  describe('addGoal()', () => {
    it('新增目標並回傳含 id 的物件', () => {
      const goal = manager.addGoal({
        title: '每天跑步',
        category: '健康',
        description: '提升體力',
        targetDate: '2026-12-31',
        quantValue: 5,
        quantUnit: '公里'
      });

      expect(goal).to.have.property('id').that.is.a('string');
      expect(goal.title).to.equal('每天跑步');
      expect(goal.category).to.equal('健康');
      expect(goal.quantValue).to.equal(5);
      expect(goal.quantUnit).to.equal('公里');
    });

    it('新增的目標可從 getAllGoals 讀取', () => {
      manager.addGoal({ title: '閱讀', category: '學習', targetDate: '2026-06-01' });
      const goals = manager.getAllGoals();
      expect(goals).to.have.lengthOf(1);
      expect(goals[0].title).to.equal('閱讀');
    });

    it('多次新增後 getAllGoals 回傳所有目標', () => {
      manager.addGoal({ title: '目標一', category: 'A', targetDate: '2026-01-01' });
      manager.addGoal({ title: '目標二', category: 'B', targetDate: '2026-02-01' });
      expect(manager.getAllGoals()).to.have.lengthOf(2);
    });

    it('quantValue 預設為 0，quantUnit 預設為空字串', () => {
      const goal = manager.addGoal({ title: '冥想', category: '心靈', targetDate: '2026-12-31' });
      expect(goal.quantValue).to.equal(0);
      expect(goal.quantUnit).to.equal('');
    });
  });

  // ── getGoal ──────────────────────────────────────────────────────────────────

  describe('getGoal()', () => {
    it('以 id 取得目標', () => {
      const added = manager.addGoal({ title: '測試目標', category: 'X', description: '描述', targetDate: '2026-12-31' });
      const fetched = manager.getGoal(added.id);
      expect(fetched.id).to.equal(added.id);
      expect(fetched.title).to.equal(added.title);
      expect(fetched.category).to.equal(added.category);
    });

    it('不存在的 id 回傳 undefined', () => {
      expect(manager.getGoal('non-existent-id')).to.be.undefined;
    });
  });

  // ── updateGoal ───────────────────────────────────────────────────────────────

  describe('updateGoal()', () => {
    it('更新目標欄位', () => {
      const goal = manager.addGoal({ title: '原標題', category: 'A', targetDate: '2026-12-31' });
      const updated = manager.updateGoal(goal.id, { title: '新標題' });
      expect(updated.title).to.equal('新標題');
    });

    it('更新後可從 getGoal 讀取最新值', () => {
      const goal = manager.addGoal({ title: '原標題', category: 'A', targetDate: '2026-12-31' });
      manager.updateGoal(goal.id, { category: 'B' });
      expect(manager.getGoal(goal.id).category).to.equal('B');
    });

    it('不存在的 id 回傳 null', () => {
      expect(manager.updateGoal('bad-id', { title: '新' })).to.be.null;
    });
  });

  // ── deleteGoal ───────────────────────────────────────────────────────────────

  describe('deleteGoal()', () => {
    it('刪除目標後 getAllGoals 不再包含該項目', () => {
      const goal = manager.addGoal({ title: '要刪除', category: 'A', targetDate: '2026-12-31' });
      manager.deleteGoal(goal.id);
      expect(manager.getAllGoals()).to.have.lengthOf(0);
    });

    it('刪除不存在的 id 不拋出錯誤', () => {
      expect(() => manager.deleteGoal('no-such-id')).to.not.throw();
    });
  });

  // ── generateHabitSchedule ────────────────────────────────────────────────────

  describe('generateHabitSchedule()', () => {
    it('生成的排程天數符合日期範圍', () => {
      const goal = {
        title: '跑步',
        startDate: '2026-01-01',
        targetDate: '2026-01-07',
        quantValue: 3,
        quantUnit: '公里'
      };
      const schedule = manager.generateHabitSchedule(goal);
      expect(schedule).to.have.lengthOf(7);
    });

    it('排程中每項 done 預設為 false', () => {
      const goal = {
        title: '喝水',
        startDate: '2026-03-01',
        targetDate: '2026-03-03',
        quantValue: 8,
        quantUnit: '杯'
      };
      const schedule = manager.generateHabitSchedule(goal);
      schedule.forEach(item => expect(item.done).to.be.false);
    });

    it('排程包含正確的日期序列', () => {
      const goal = {
        title: '散步',
        startDate: '2026-05-01',
        targetDate: '2026-05-03',
        quantValue: 1,
        quantUnit: '次'
      };
      const schedule = manager.generateHabitSchedule(goal);
      expect(schedule[0].date).to.equal('2026-05-01');
      expect(schedule[1].date).to.equal('2026-05-02');
      expect(schedule[2].date).to.equal('2026-05-03');
    });
  });

  // ── getGoalProgress ──────────────────────────────────────────────────────────

  describe('getGoalProgress()', () => {
    it('沒有排程時回傳全 0', () => {
      const progress = manager.getGoalProgress({ schedule: [] });
      expect(progress).to.deep.equal({ done: 0, total: 0, percentage: 0 });
    });

    it('計算完成比例', () => {
      const schedule = [
        { done: true },
        { done: true },
        { done: false },
        { done: false }
      ];
      const progress = manager.getGoalProgress({ schedule });
      expect(progress.done).to.equal(2);
      expect(progress.total).to.equal(4);
      expect(progress.percentage).to.equal(50);
    });

    it('全部完成時 percentage 為 100', () => {
      const schedule = [{ done: true }, { done: true }];
      expect(manager.getGoalProgress({ schedule }).percentage).to.equal(100);
    });
  });

  // ── getDaysRemaining ─────────────────────────────────────────────────────────

  describe('getDaysRemaining()', () => {
    it('過期目標回傳 0', () => {
      const days = manager.getDaysRemaining({ targetDate: '2000-01-01' });
      expect(days).to.equal(0);
    });

    it('未來目標回傳正數天數', () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      const targetDate = future.toISOString().slice(0, 10);
      const days = manager.getDaysRemaining({ targetDate });
      expect(days).to.be.greaterThan(0);
    });
  });

  // ── updateScheduleItem ───────────────────────────────────────────────────────

  describe('updateScheduleItem()', () => {
    it('將指定日期的排程項目標為完成', () => {
      const goal = manager.addGoal({
        title: '練習',
        category: '學習',
        startDate: '2026-06-01',
        targetDate: '2026-06-03',
        quantValue: 1,
        quantUnit: '次'
      });
      const schedule = manager.generateHabitSchedule(goal);
      manager.updateGoal(goal.id, { schedule });

      manager.updateScheduleItem(goal.id, '2026-06-02', true);

      const updated = manager.getGoal(goal.id);
      const item = updated.schedule.find(s => s.date === '2026-06-02');
      expect(item.done).to.be.true;
    });
  });
});
