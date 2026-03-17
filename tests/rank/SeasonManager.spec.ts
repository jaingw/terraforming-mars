import {expect} from 'chai';
import {
  getSeasonId,
  getSeasonNumber,
  getSeasonInfo,
  getPreviousSeasonId,
  shouldResetSeason,
  softResetMu,
  softResetSigma,
  getSeasonPointsReward,
  SEASON_POINTS_TOP_HUNDRED,
  SEASON_POINTS_DEFAULT,
} from '../../src/common/rank/SeasonManager';
import {DEFAULT_MU, DEFAULT_SIGMA} from '../../src/common/rank/constants';

describe('SeasonManager', () => {
  describe('getSeasonNumber', () => {
    it('should return 1 for Jan-Feb', () => {
      expect(getSeasonNumber(new Date(2026, 0, 15))).to.eq(1); // Jan
      expect(getSeasonNumber(new Date(2026, 1, 28))).to.eq(1); // Feb
    });

    it('should return 2 for Mar-Apr', () => {
      expect(getSeasonNumber(new Date(2026, 2, 1))).to.eq(2); // Mar
      expect(getSeasonNumber(new Date(2026, 3, 30))).to.eq(2); // Apr
    });

    it('should return 6 for Nov-Dec', () => {
      expect(getSeasonNumber(new Date(2026, 10, 1))).to.eq(6); // Nov
      expect(getSeasonNumber(new Date(2026, 11, 31))).to.eq(6); // Dec
    });
  });

  describe('getSeasonId', () => {
    it('should return correct format', () => {
      expect(getSeasonId(new Date(2026, 0, 1))).to.eq('2026-S1');
      expect(getSeasonId(new Date(2026, 2, 15))).to.eq('2026-S2');
      expect(getSeasonId(new Date(2026, 11, 31))).to.eq('2026-S6');
    });

    it('should handle year boundaries', () => {
      expect(getSeasonId(new Date(2025, 11, 31))).to.eq('2025-S6');
      expect(getSeasonId(new Date(2026, 0, 1))).to.eq('2026-S1');
    });
  });

  describe('getSeasonInfo', () => {
    it('should return correct season info for S1', () => {
      const info = getSeasonInfo(new Date(2026, 0, 15));
      expect(info.seasonId).to.eq('2026-S1');
      expect(info.seasonName).to.eq('Season 1 (Jan-Feb 2026)');
      expect(info.startDate.getMonth()).to.eq(0); // Jan
      expect(info.endDate.getMonth()).to.eq(2); // Mar 1st (end of S1)
    });

    it('should return correct season info for S6', () => {
      const info = getSeasonInfo(new Date(2026, 10, 15));
      expect(info.seasonId).to.eq('2026-S6');
      expect(info.seasonName).to.eq('Season 6 (Nov-Dec 2026)');
    });
  });

  describe('shouldResetSeason', () => {
    it('should return false for undefined lastSeasonId', () => {
      expect(shouldResetSeason(undefined, new Date(2026, 0, 1))).to.eq(false);
    });

    it('should return false when season has not changed', () => {
      expect(shouldResetSeason('2026-S1', new Date(2026, 1, 15))).to.eq(false);
    });

    it('should return true when season has changed', () => {
      expect(shouldResetSeason('2026-S1', new Date(2026, 2, 1))).to.eq(true); // S1 -> S2
    });

    it('should return true across year boundary', () => {
      expect(shouldResetSeason('2025-S6', new Date(2026, 0, 1))).to.eq(true); // 2025-S6 -> 2026-S1
    });
  });

  describe('softResetMu', () => {
    it('should preserve mu', () => {
      const oldMu = 30;
      expect(softResetMu(oldMu)).to.eq(oldMu);
    });

    it('should return DEFAULT_MU when oldMu equals DEFAULT_MU', () => {
      expect(softResetMu(DEFAULT_MU)).to.eq(DEFAULT_MU);
    });

    it('should move a high mu downward', () => {
      const highMu = 40;
      const result = softResetMu(highMu);
      expect(result).to.eq(highMu);
    });

    it('should move a low mu upward', () => {
      const lowMu = 10;
      const result = softResetMu(lowMu);
      expect(result).to.eq(lowMu);
    });
  });

  describe('softResetSigma', () => {
    it('should reset sigma to default', () => {
      expect(softResetSigma(4)).to.eq(DEFAULT_SIGMA);
      expect(softResetSigma(20)).to.eq(DEFAULT_SIGMA);
    });
  });

  describe('getSeasonPointsReward', () => {
    it('should return 100 for 1st place', () => {
      expect(getSeasonPointsReward(1)).to.eq(100);
    });

    it('should return 75 for 2nd place', () => {
      expect(getSeasonPointsReward(2)).to.eq(75);
    });

    it('should return 60 for 3rd place', () => {
      expect(getSeasonPointsReward(3)).to.eq(60);
    });

    it('should return 45 for 4th place', () => {
      expect(getSeasonPointsReward(4)).to.eq(45);
    });

    it('should return 20 for 9th-10th place', () => {
      expect(getSeasonPointsReward(9)).to.eq(20);
      expect(getSeasonPointsReward(10)).to.eq(20);
    });

    it('should return 10 for top hundred except top ten', () => {
      expect(getSeasonPointsReward(11)).to.eq(SEASON_POINTS_TOP_HUNDRED);
      expect(getSeasonPointsReward(100)).to.eq(SEASON_POINTS_TOP_HUNDRED);
    });

    it('should return default for other positions', () => {
      expect(getSeasonPointsReward(101)).to.eq(SEASON_POINTS_DEFAULT);
      expect(getSeasonPointsReward(-1)).to.eq(SEASON_POINTS_DEFAULT);
    });
  });

  describe('getPreviousSeasonId', () => {
    it('should return previous season in same year', () => {
      expect(getPreviousSeasonId('2026-S3')).to.eq('2026-S2');
    });

    it('should roll back to previous year from S1', () => {
      expect(getPreviousSeasonId('2026-S1')).to.eq('2025-S6');
    });

    it('should return input for invalid season format', () => {
      expect(getPreviousSeasonId('invalid')).to.eq('invalid');
    });
  });
});
