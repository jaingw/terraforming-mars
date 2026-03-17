import {expect} from 'chai';
import {app} from '../../src/server/hono/app';
import {Database} from '../../src/server/database/Database';
import {GameLoader} from '../../src/server/database/GameLoader';
import {getSeasonId, getSeasonInfo} from '../../src/common/rank/SeasonManager';
import {User} from '../../src/server/User';
import {UserRank} from '../../src/common/rank/RankManager';
import {serverId} from '../../src/server/utils/server-ids';

describe('Hono Season Routes', () => {
  describe('GET /api/v2/season/info', () => {
    it('should return current season info', async () => {
      const res = await app.request('/api/v2/season/info');
      expect(res.status).to.eq(200);

      const data = await res.json();
      const now = new Date();
      const expectedId = getSeasonId(now);
      const expectedInfo = getSeasonInfo(now);

      expect(data.seasonId).to.eq(expectedId);
      expect(data.seasonName).to.eq(expectedInfo.seasonName);
      expect(data.startDate).to.be.a('string');
      expect(data.endDate).to.be.a('string');
    });

    it('should return season with correct ID format', async () => {
      const res = await app.request('/api/v2/season/info');
      const data = await res.json();

      // 格式: "2026-S1"
      expect(data.seasonId).to.match(/^\d{4}-S[1-6]$/);
    });
  });

  describe('GET /api/v2/season/history', () => {
    it('should return 400 without seasonId', async () => {
      const res = await app.request('/api/v2/season/history');
      expect(res.status).to.eq(400);

      const data = await res.json();
      expect(data.error).to.include('Missing seasonId');
    });

    it('should return empty snapshots for non-existent season', async () => {
      // FAKE_DATABASE.getSeasonSnapshots returns []
      const res = await app.request('/api/v2/season/history?seasonId=2099-S1');
      expect(res.status).to.eq(200);

      const data = await res.json();
      expect(data.seasonId).to.eq('2099-S1');
      expect(data.snapshots).to.deep.eq([]);
    });

    it('should return snapshot data with user names', async () => {
      // 准备测试数据
      const testUser = new User('TestPlayer', '', 'test-user-1');
      GameLoader.getInstance().userIdMap.set('test-user-1', testUser);

      const originalGetSnapshots = Database.getInstance().getSeasonSnapshots;
      Database.getInstance().getSeasonSnapshots = () => Promise.resolve([
        {userId: 'test-user-1', rankValue: 5000, mu: 30, sigma: 6, trueskill: 12, pointsEarned: 100, finalPosition: 1},
      ]);

      try {
        const res = await app.request('/api/v2/season/history?seasonId=2026-S1');
        expect(res.status).to.eq(200);

        const data = await res.json();
        expect(data.snapshots).to.have.length(1);
        expect(data.snapshots[0].userName).to.eq('TestPlayer');
        expect(data.snapshots[0].pointsEarned).to.eq(100);
        expect(data.snapshots[0].finalPosition).to.eq(1);
      } finally {
        Database.getInstance().getSeasonSnapshots = originalGetSnapshots;
        GameLoader.getInstance().userIdMap.delete('test-user-1');
      }
    });
  });

  describe('GET /api/v2/season/list', () => {
    it('should return current and previous season ids', async () => {
      const res = await app.request('/api/v2/season/list');
      expect(res.status).to.eq(200);
      const data = await res.json();
      expect(data.currentSeasonId).to.match(/^\d{4}-S[1-6]$/);
      expect(data.previousSeasonId).to.match(/^\d{4}-S[1-6]$/);
    });
  });

  describe('GET /api/v2/season/leaderboard', () => {
    it('should return 400 without seasonId', async () => {
      const res = await app.request('/api/v2/season/leaderboard');
      expect(res.status).to.eq(400);
    });

    it('should return current season leaderboard', async () => {
      const currentSeasonId = getSeasonId(new Date());
      const userId = 'ldr-user-001';
      GameLoader.getInstance().userIdMap.set(userId, new User('LeaderboardUser', '', userId));
      const originalGetUserRanks = Database.getInstance().getUserRanks;
      Database.getInstance().getUserRanks = () => Promise.resolve([
        new UserRank(userId, 6, 25, 8.333, 0, 0, currentSeasonId),
      ]);
      try {
        const res = await app.request('/api/v2/season/leaderboard?seasonId=' + currentSeasonId);
        expect(res.status).to.eq(200);
        const data = await res.json();
        expect(data.isCurrentSeason).to.eq(true);
        expect(data.allUserRanks).to.have.length(1);
        expect(data.allUserRanks[0].userName).to.eq('LeaderboardUser');
      } finally {
        Database.getInstance().getUserRanks = originalGetUserRanks;
        GameLoader.getInstance().userIdMap.delete(userId);
      }
    });
  });

  describe('POST /api/v2/season/admin/reset', () => {
    it('should pass through when not in production (serverId check only in production)', async () => {
      // requireAdmin middleware only enforces serverId in production mode
      const res = await app.request('/api/v2/season/admin/reset', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({dryRun: true, expectedFromSeasonId: '2026-S1'}),
      });
      // In test environment, the middleware passes through
      expect(res.status).to.eq(200);
    });

    it('should return skipped when no players in season', async () => {
      const res = await app.request('/api/v2/season/admin/reset?serverId=' + serverId, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({dryRun: true, expectedFromSeasonId: '2026-S1'}),
      });
      expect(res.status).to.eq(200);
      const data = await res.json();
      // Returns 'skipped' because there are no players in the GameLoader.userRankMap
      expect(data.status).to.eq('skipped');
    });
  });
});
