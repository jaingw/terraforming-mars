import {expect} from 'chai';
import {Database} from '../../src/server/database/Database';
import {SeasonService} from '../../src/server/services/SeasonService';
import {getSeasonId as getSeasonIdFromDate} from '../../src/common/rank/SeasonManager';

describe('SeasonService', () => {
  describe('resolveCurrentSeasonId', () => {
    it('should prefer current_season from database over wall clock time', async () => {
      const db = Database.getInstance() as any;
      const originalGetCurrentSeason = db.getCurrentSeason;

      db.getCurrentSeason = async () => ({
        seasonId: '2026-S4',
        seasonName: 'Season 4 (Jul-Aug 2026)',
        startDate: new Date(2026, 6, 1).toISOString(),
        endDate: new Date(2026, 8, 1).toISOString(),
      });

      try {
        const seasonId = await SeasonService.resolveCurrentSeasonId(new Date(2026, 3, 15));
        expect(seasonId).to.eq('2026-S4');
      } finally {
        db.getCurrentSeason = originalGetCurrentSeason;
      }
    });

    it('should fall back to wall clock time when current_season is missing', async () => {
      const db = Database.getInstance() as any;
      const originalGetCurrentSeason = db.getCurrentSeason;
      const now = new Date(2026, 3, 15);

      db.getCurrentSeason = async () => undefined;

      try {
        const seasonId = await SeasonService.resolveCurrentSeasonId(now);
        expect(seasonId).to.eq(getSeasonIdFromDate(now));
      } finally {
        db.getCurrentSeason = originalGetCurrentSeason;
      }
    });
  });

  describe('shouldResetSeason', () => {
    it('should return false when lastSeasonId is undefined', async () => {
      expect(await SeasonService.shouldResetSeason(undefined, new Date(2026, 3, 15))).to.eq(false);
    });

    it('should return false when database season matches lastSeasonId', async () => {
      const db = Database.getInstance() as any;
      const originalGetCurrentSeason = db.getCurrentSeason;

      db.getCurrentSeason = async () => ({
        seasonId: '2026-S1',
        seasonName: 'Season 1 (Jan-Feb 2026)',
        startDate: new Date(2026, 0, 1).toISOString(),
        endDate: new Date(2026, 2, 1).toISOString(),
      });

      try {
        expect(await SeasonService.shouldResetSeason('2026-S1', new Date(2026, 1, 15))).to.eq(false);
      } finally {
        db.getCurrentSeason = originalGetCurrentSeason;
      }
    });

    it('should return true when database season differs from lastSeasonId', async () => {
      const db = Database.getInstance() as any;
      const originalGetCurrentSeason = db.getCurrentSeason;

      db.getCurrentSeason = async () => ({
        seasonId: '2026-S2',
        seasonName: 'Season 2 (Mar-Apr 2026)',
        startDate: new Date(2026, 2, 1).toISOString(),
        endDate: new Date(2026, 4, 1).toISOString(),
      });

      try {
        expect(await SeasonService.shouldResetSeason('2026-S1', new Date(2026, 2, 1))).to.eq(true);
      } finally {
        db.getCurrentSeason = originalGetCurrentSeason;
      }
    });

    it('should return true across year boundary when database season advanced', async () => {
      const db = Database.getInstance() as any;
      const originalGetCurrentSeason = db.getCurrentSeason;

      db.getCurrentSeason = async () => ({
        seasonId: '2026-S1',
        seasonName: 'Season 1 (Jan-Feb 2026)',
        startDate: new Date(2026, 0, 1).toISOString(),
        endDate: new Date(2026, 2, 1).toISOString(),
      });

      try {
        expect(await SeasonService.shouldResetSeason('2025-S6', new Date(2026, 0, 1))).to.eq(true);
      } finally {
        db.getCurrentSeason = originalGetCurrentSeason;
      }
    });

    it('should compare against database current season before wall clock time', async () => {
      const db = Database.getInstance() as any;
      const originalGetCurrentSeason = db.getCurrentSeason;

      db.getCurrentSeason = async () => ({
        seasonId: '2026-S4',
        seasonName: 'Season 4 (Jul-Aug 2026)',
        startDate: new Date(2026, 6, 1).toISOString(),
        endDate: new Date(2026, 8, 1).toISOString(),
      });

      try {
        expect(await SeasonService.shouldResetSeason('2026-S4', new Date(2026, 3, 15))).to.eq(false);
        expect(await SeasonService.shouldResetSeason('2026-S3', new Date(2026, 3, 15))).to.eq(true);
      } finally {
        db.getCurrentSeason = originalGetCurrentSeason;
      }
    });
  });
});
