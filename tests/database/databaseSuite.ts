import {expect, use} from 'chai';
import chaiAsPromised from 'chai-as-promised';
use(chaiAsPromised);

import {ITestDatabase} from './ITestDatabase';
import {Game} from '../../src/server/Game';
import {TestPlayer} from '../TestPlayer';
import {restoreTestDatabase, setTestDatabase} from '../testing/setup';
import {testGame} from '../TestGame';
import {GameId} from '../../src/common/Types';
import {statusCode} from '../../src/common/http/statusCode';
import {cast} from '@/common/utils/utils';
import {SelectInitialCards} from '../../src/server/inputs/SelectInitialCards';
import {DiscordUser} from '../../src/server/server/auth/discord';
import {normalizeUserId} from '../../src/common/utils/normalizeUserId';

// Removes any fields that have undefined values, and filters undefined from arrays.
function stripUndefined(obj: unknown): unknown {
  if (obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.filter((v) => v !== undefined).map(stripUndefined);
  }
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) {
        result[k] = stripUndefined(v);
      }
    }
    return result;
  }
  return obj;
}

/**
 * Describes a database test
 */
export type DatabaseTestDescriptor<T extends ITestDatabase> = {
  name: string,
  constructor: () => T,
  stats: any,
  omit?: Partial<{
    purgeUnfinishedGames: boolean,
    markFinished: boolean,
    sessions: boolean,
  }>,
  otherTests?(dbFactory: () => T): void,
};

export function describeDatabaseSuite<T extends ITestDatabase>(dtor: DatabaseTestDescriptor<T>) {
  describe(dtor.name, () => {
    let db: T;
    beforeEach(() => {
      db = dtor.constructor();
      setTestDatabase(db);
      return db.initialize();
    });

    afterEach(async () => {
      restoreTestDatabase();
      await db.afterEach?.();
    });

    it('game is saved', async () => {
      const player = TestPlayer.BLACK.newPlayer();
      Game.newInstance('game-id-1212', [player], player, 'spectatorid');
      await db.lastSaveGamePromise;
      const allGames = await db.getGameIds();
      expect(allGames).deep.eq(['game-id-1212']);
    });

    it('stores game metadata, participants, and user ids', async () => {
      const userId = 'u123456789abctokenvalue';
      const player = TestPlayer.BLACK.newPlayer();
      player.userId = userId;
      const game = Game.newInstance('game-id-metadata', [player], player, 'spectatorid');
      await db.lastSaveGamePromise;

      const metadata = (await db.getGames()).find((metadata) => metadata.gameId === game.id);
      expect(metadata).is.not.undefined;
      expect(metadata?.gameId).eq(game.id);
      expect(metadata?.shortData?.id).eq(game.id);
      expect(metadata?.shortData?.players.map((p) => p.id)).deep.eq([player.id]);
      expect(metadata?.participants).includes(player.id);
      expect(metadata?.participants).includes('spectatorid');
      expect(metadata?.participants).not.includes(normalizeUserId(userId));
      expect(metadata?.userids).deep.eq([normalizeUserId(userId)]);

      expect(await db.getGameIdByParticipant(player.id)).eq(game.id);
      expect(await db.getGameIdByParticipant('spectatorid')).eq(game.id);
      expect(await db.getGameIdByParticipant(normalizeUserId(userId))).is.undefined;
      expect((await db.getGamesByUserId(userId)).map((metadata) => metadata.gameId)).deep.eq([game.id]);
    });

    it('updates game metadata prop on save', async () => {
      const player = TestPlayer.BLACK.newPlayer();
      const game = Game.newInstance('game-id-metadata-update', [player], player, 'spectatorid');
      await db.lastSaveGamePromise;

      player.name = 'updated player name';
      await db.saveGame(game);

      const metadata = (await db.getGames()).find((metadata) => metadata.gameId === game.id);
      expect(metadata?.shortData?.players[0].name).eq('updated player name');
      expect(metadata?.shortData?.lastSaveId).eq(1);

      const cachedListEntry = (await db.getGames()).find((entry) => entry.gameId === game.id);
      expect(cachedListEntry?.shortData?.players[0].name).eq('updated player name');
    });

    it('gets recent games by user id with a limit', async () => {
      const userId = 'u123456789abctokenvalue';
      for (let idx = 0; idx < 31; idx++) {
        const player = TestPlayer.BLACK.newPlayer();
        player.userId = userId;
        Game.newInstance(`game-id-user-${idx}`, [player], player, 'spectatorid');
        await db.lastSaveGamePromise;
      }

      expect(await db.getGamesByUserId(userId)).has.length(30);
      expect(await db.getGamesByUserId(userId, 3)).has.length(3);
    });

    it('getGameIds - removes duplicates', async () => {
      const player = TestPlayer.BLACK.newPlayer();
      const game = Game.newInstance('game-id-1212', [player], player, 'spectatorid');
      cast(player.popWaitingFor(), SelectInitialCards);
      await db.lastSaveGamePromise;
      await db.saveGame(game);

      const allGames = await db.getGameIds();
      expect(allGames).deep.eq(['game-id-1212']);
    });

    it('getGameIds - includes finished games', async () => {
      const player = TestPlayer.BLACK.newPlayer();
      const game = Game.newInstance('game-id-1212', [player], player, 'spectatorid');
      cast(player.popWaitingFor(), SelectInitialCards);
      await db.lastSaveGamePromise;
      Game.newInstance('game-id-2323', [player], player, 'spectatorid');
      await db.lastSaveGamePromise;

      await db.markFinished(game.id);

      const allGameIds = await db.getGameIds();
      expect(allGameIds).has.members(['game-id-1212', 'game-id-2323']);
    });

    it('saveIds', async () => {
      const player = TestPlayer.BLACK.newPlayer();
      const game = Game.newInstance('game-id-1212', [player], player, 'spectatorid');
      await db.lastSaveGamePromise;
      expect(game.lastSaveId).eq(1);

      await db.saveGame(game);
      await db.saveGame(game);
      await db.saveGame(game);

      const allSaveIds = await db.getSaveIds(game.id);
      expect(allSaveIds).has.members([0, 1, 2, 3]);
    });

    if (dtor.omit?.markFinished !== true) {
      it('markFinished', async () => {
        const player = TestPlayer.BLACK.newPlayer();
        const game = Game.newInstance('game-id-1212', [player], player, 'spectatorid');
        await db.lastSaveGamePromise;
        await db.saveGame(game);
        await db.saveGame(game);
        await db.saveGame(game);

        expect(await db.getSaveIds(game.id)).has.members([0, 1, 2, 3]);
        expect(await db.status(game.id)).eq('running');

        await db.markFinished(game.id);

        expect(await db.status(game.id)).eq('finished');
        const saveIds = await db.getSaveIds(game.id);
        expect(saveIds).has.members([0, 1, 2, 3]);
      });
    }

    it('gets player count', async () => {
      const player = TestPlayer.BLACK.newPlayer();
      const game = Game.newInstance('game-id-1212', [player], player, 'spectatorid');
      await db.lastSaveGamePromise;
      expect(game.lastSaveId).eq(1);

      expect(db.getPlayerCount(game.id)).become(1);
    });

    it('does not find player count by id', async () => {
      const player = TestPlayer.BLACK.newPlayer();
      const game = Game.newInstance('game-id-1212', [player], player, 'spectatorid');
      await db.lastSaveGamePromise;
      expect(game.lastSaveId).eq(1);

      expect(db.getPlayerCount('g-notfound')).is.rejected;
    });

    if (dtor.omit?.purgeUnfinishedGames !== true) {
      it('purgeUnfinishedGames', async () => {
        const player = TestPlayer.BLACK.newPlayer();
        const game = Game.newInstance('game-id-1212', [player], player, 'spectatorid');
        await db.lastSaveGamePromise;
        expect(game.lastSaveId).eq(1);

        await db.saveGame(game);
        await db.saveGame(game);
        await db.saveGame(game);

        expect(await db.getSaveIds(game.id)).has.members([0, 1, 2, 3]);

        await db.purgeUnfinishedGames('1900-01-01');
        expect(await db.getSaveIds(game.id)).has.members([0, 1, 2, 3]);

        const player1 = TestPlayer.BLUE.newPlayer();
        const player2 = TestPlayer.RED.newPlayer();
        const multiplayerGame = Game.newInstance('game-id-multiplayer-purge', [player1, player2], player1, 'spectatorid2');
        await db.lastSaveGamePromise;

        // 单人局和多人局都使用 dayAgo 阈值。
        await db.purgeUnfinishedGames('2999-01-01');
        expect(await db.getSaveIds(game.id)).is.empty;
        expect((await db.getGames()).find((metadata) => metadata.gameId === game.id)).is.undefined;
        expect(await db.getSaveIds(multiplayerGame.id)).is.empty;
        expect((await db.getGames()).find((metadata) => metadata.gameId === multiplayerGame.id)).is.undefined;
      });

      it('does not purge games after they are marked finished', async () => {
        const player = TestPlayer.BLACK.newPlayer();
        const game = Game.newInstance('game-id-finished-status', [player], player, 'spectatorid');
        await db.lastSaveGamePromise;

        await db.markFinished(game.id);

        await db.purgeUnfinishedGames('2999-01-01');
        expect(await db.getSaveIds(game.id)).has.members([0]);
        expect((await db.getGames()).find((metadata) => metadata.gameId === game.id)).is.not.undefined;
      });
    }

    it('getGame', async () => {
      const player = TestPlayer.BLACK.newPlayer();
      const game = Game.newInstance('game-id-1212', [player], player, 'spectatorid', {underworldExpansion: true});
      await db.lastSaveGamePromise;
      expect(game.lastSaveId).eq(1);

      player.megaCredits = 200;
      game.log('databaseSuite.getGame test');

      const expected = game.serialize();
      await db.saveGame(game);

      const actual = await db.getGame(game.id);
      expect(actual.gameLog[actual.gameLog.length -1].message).eq('databaseSuite.getGame test');
      expect(actual.gameOptions.underworldExpansion).eq(true);
      expect(stripUndefined(actual)).deep.eq(stripUndefined(expected));
    });

    it('getGameVersion', async () => {
      const player = TestPlayer.BLACK.newPlayer();
      const game = Game.newInstance('game-id-1212', [player], player, 'spectatorid');
      await db.lastSaveGamePromise;
      expect(game.lastSaveId).eq(1);

      player.megaCredits = 200;
      await db.saveGame(game);

      player.megaCredits = 300;
      await db.saveGame(game);

      player.megaCredits = 400;
      await db.saveGame(game);

      const allSaveIds = await db.getSaveIds(game.id);
      expect(allSaveIds).has.members([0, 1, 2, 3]);

      const serialized0 = await db.getGameVersion(game.id, 0);
      expect(serialized0.players[0].megaCredits).eq(0);

      const serialized1 = await db.getGameVersion(game.id, 1);
      expect(serialized1.players[0].megaCredits).eq(statusCode.ok);

      const serialized2 = await db.getGameVersion(game.id, 2);
      expect(serialized2.players[0].megaCredits).eq(300);

      const serialized3 = await db.getGameVersion(game.id, 3);
      expect(serialized3.players[0].megaCredits).eq(statusCode.badRequest);

      await expect(db.getGameVersion('game-id-123', 0)).to.be.rejectedWith(/Game game-id-123 not found/);
    });

    it('deleteGameNbrSaves', async () => {
      const player = TestPlayer.BLACK.newPlayer();
      const game = Game.newInstance('game-id-1212', [player], player, 'spectatorid');
      await db.lastSaveGamePromise;
      expect(game.lastSaveId).eq(1);

      await db.saveGame(game);
      await db.saveGame(game);
      await db.saveGame(game);
      await db.saveGame(game);
      await db.saveGame(game);

      expect(await db.getSaveIds(game.id)).has.members([0, 1, 2, 3, 4, 5]);

      await db.deleteGameNbrSaves(game.id, 2);

      const saveIds = await db.getSaveIds(game.id);
      expect(saveIds).has.members([0, 1, 2, 3]);
    });

    if (dtor.omit?.sessions !== true) {
      const discordUser = {id: 'xyz'} as DiscordUser;
      it('createSession', async () => {
        const expirationTimeMillis = Date.now() + 100000;
        await db.createSession({id: '123', expirationTimeMillis, data: {discordUser}});
        const sessions = await db.getSessions();
        expect(sessions).deep.eq([{id: '123', expirationTimeMillis, data: {discordUser}}]);
      });

      it('deleteSession', async () => {
        // TODO(kberg): Make databases rely on Clock. /shrug
        const expirationTimeMillis = Date.now() + 100000;
        await db.createSession({id: '123', expirationTimeMillis, data: {discordUser}});
        let sessions = await db.getSessions();
        expect(sessions).deep.eq([{id: '123', expirationTimeMillis, data: {discordUser}}]);
        await db.deleteSession('123');
        sessions = await db.getSessions();
        expect(sessions).to.be.empty;
      });

      it('expiredSession', async () => {
        const expirationTimeMillis = Date.now() - 1;
        await db.createSession({id: '123', expirationTimeMillis, data: {discordUser}});
        const sessions = await db.getSessions();
        expect(sessions).to.be.empty;
      });
    }

    it('stats', async () => {
      const result = await db.stats();
      expect(result).deep.eq(dtor.stats);
    });

    dtor.otherTests?.(() => db);
  });
}
