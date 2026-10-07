import {expect} from 'chai';
import {UserRank} from '../../src/common/rank/RankManager';
import {getSeasonInfo, nowFromSeasonId} from '../../src/common/rank/SeasonManager';
import {GameLoader} from '../../src/server/database/GameLoader';
import {Database} from '../../src/server/database/Database';
import {checkAndResetSeason, runSeasonReset} from '../../src/server/rank/SeasonResetHandler';
import {State} from '../../src/server/database/IGameLoader';
import {restoreTestGameLoader, setTestGameLoader} from '../testing/setup';

describe('SeasonResetHandler', () => {
  let gameLoader: GameLoader;

  beforeEach(() => {
    gameLoader = Reflect.construct(GameLoader, []) as GameLoader;
    gameLoader.state = State.READY;
    setTestGameLoader(gameLoader);
  });

  afterEach(() => {
    restoreTestGameLoader();
  });

  it('should prefer current_season over wall clock when deriving the reset source season', async () => {
    const db = Database.getInstance() as any;
    const originalGetCurrentSeason = db.getCurrentSeason;

    db.getCurrentSeason = async () => ({
      seasonId: '2026-S2',
      seasonName: 'Season 2 (Mar-Apr 2026)',
      startDate: new Date(2026, 2, 1).toISOString(),
      endDate: new Date(2026, 4, 1).toISOString(),
    });

    try {
      const result = await runSeasonReset({
        dryRun: true,
        triggeredBy: 'admin',
      });

      expect(result.status).to.eq('skipped');
      expect(result.fromSeasonId).to.eq('2026-S1');
      expect(result.toSeasonId).to.eq('2026-S2');
    } finally {
      db.getCurrentSeason = originalGetCurrentSeason;
    }
  });

  it('should use canonical two-month season boundaries when admin resets early', async () => {
    const previousSeasonId = '2026-S1';
    const newSeasonId = '2026-S2';
    const expectedSeason = getSeasonInfo(nowFromSeasonId(newSeasonId));

    const userRankFixture = new UserRank('season-reset-user', 8, 30, 6, 12, 0, previousSeasonId);

    const db = Database.getInstance() as any;
    const originalGetCurrentSeason = db.getCurrentSeason;
    const originalGetUserRanks = db.getUserRanks;
    const originalGetSeason = db.getSeason;
    const originalSaveSeasonSnapshot = db.saveUserRankSeasonSnapshot;
    const originalUpdateUserRank = db.updateUserRank;
    const originalSetCurrentSeason = db.setCurrentSeason;
    const originalSaveSeason = db.saveSeason;

    let capturedCurrentSeason: {seasonId: string; seasonName: string; startDate: Date; endDate: Date} | undefined;

    db.getCurrentSeason = async () => undefined;
    db.getSeason = async () => undefined;
    db.getUserRanks = async () => [userRankFixture];
    db.saveUserRankSeasonSnapshot = async () => undefined;
    db.updateUserRank = async () => undefined;
    db.setCurrentSeason = async (seasonId: string, seasonName: string, startDate: Date, endDate: Date) => {
      capturedCurrentSeason = {seasonId, seasonName, startDate, endDate};
    };
    db.saveSeason = async () => undefined;

    try {
      const result = await runSeasonReset({
        expectedFromSeasonId: previousSeasonId,
        dryRun: false,
        triggeredBy: 'admin',
      });

      expect(result.status).to.eq('completed');
      expect(result.fromSeasonId).to.eq(previousSeasonId);
      expect(result.toSeasonId).to.eq(newSeasonId);
      expect(capturedCurrentSeason).to.deep.include({
        seasonId: newSeasonId,
        seasonName: expectedSeason.seasonName,
      });
      expect(capturedCurrentSeason?.startDate.toISOString()).to.eq(expectedSeason.startDate.toISOString());
      expect(capturedCurrentSeason?.endDate.toISOString()).to.eq(expectedSeason.endDate.toISOString());
    } finally {
      db.getCurrentSeason = originalGetCurrentSeason;
      db.getSeason = originalGetSeason;
      db.getUserRanks = originalGetUserRanks;
      db.saveUserRankSeasonSnapshot = originalSaveSeasonSnapshot;
      db.updateUserRank = originalUpdateUserRank;
      db.setCurrentSeason = originalSetCurrentSeason;
      db.saveSeason = originalSaveSeason;
    }
  });

  it('should persist current season metadata during first-time season setup', async () => {
    const userId = 'fstseason01';
    const userRankFixture = new UserRank(userId, 6, 25, 8.333, 0, 0, '');
    // 该用户已在缓存中：首次启用赛季应刷新其缓存的 seasonId。
    gameLoader.addOrUpdateUserRank(userRankFixture);

    const db = Database.getInstance() as any;
    const originalGetCurrentSeason = db.getCurrentSeason;
    const originalGetUserRanks = db.getUserRanks;
    const originalUpdateUserRank = db.updateUserRank;
    const originalSetCurrentSeason = db.setCurrentSeason;
    const originalSaveSeason = db.saveSeason;

    let capturedCurrentSeason: {seasonId: string; seasonName: string; startDate: Date; endDate: Date} | undefined;
    let capturedSavedSeason: {seasonId: string; seasonName: string; startDate: Date; endDate: Date} | undefined;

    db.getCurrentSeason = async () => undefined;
    db.getUserRanks = async () => [userRankFixture];
    db.updateUserRank = async () => undefined;
    db.setCurrentSeason = async (seasonId: string, seasonName: string, startDate: Date, endDate: Date) => {
      capturedCurrentSeason = {seasonId, seasonName, startDate, endDate};
    };
    db.saveSeason = async (seasonId: string, seasonName: string, startDate: Date, endDate: Date) => {
      capturedSavedSeason = {seasonId, seasonName, startDate, endDate};
    };

    try {
      await checkAndResetSeason();

      const expectedSeason = getSeasonInfo(new Date());
      const userRank = gameLoader.getCachedUserRanks().find((rank) => rank.userId === userId);

      expect(userRank?.seasonId).to.eq(expectedSeason.seasonId);
      expect(capturedCurrentSeason).to.deep.include({
        seasonId: expectedSeason.seasonId,
        seasonName: expectedSeason.seasonName,
      });
      expect(capturedSavedSeason).to.deep.include({
        seasonId: expectedSeason.seasonId,
        seasonName: expectedSeason.seasonName,
      });
    } finally {
      db.getCurrentSeason = originalGetCurrentSeason;
      db.getUserRanks = originalGetUserRanks;
      db.updateUserRank = originalUpdateUserRank;
      db.setCurrentSeason = originalSetCurrentSeason;
      db.saveSeason = originalSaveSeason;
    }
  });
});
