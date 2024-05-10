import * as responses from './responses';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {BoardName} from '../../common/boards/BoardName';
import {RandomBoardOption} from '../../common/boards/RandomBoardOption';
import {GameLoader} from '../database/GameLoader';
import {Game, LoadState} from '../Game';
import {GameOptions} from '../game/GameOptions';
import {Player} from '../Player';
import {Server} from '../models/ServerModel';
import {ServeAsset} from './ServeAsset';
import {RandomMAOptionType} from '../../common/ma/RandomMAOptionType';
import {AgendaStyle} from '../../common/turmoil/Types';
import {NewGameConfig} from '../../common/game/NewGameConfig';
import {safeCast, isGameId, isSpectatorId, isPlayerId} from '../../common/Types';
import {generateRandomId} from '../utils/server-ids';
import {Request} from '../Request';
import {Response} from '../Response';
import {QuotaConfig, QuotaHandler} from '../server/QuotaHandler';
import {durationToMilliseconds} from '../utils/durations';

function get(): QuotaConfig {
  const defaultQuota = {limit: 1, perMs: 1}; // Effectively, no limit.
  const val = process.env.GAME_QUOTA;
  try {
    if (val !== undefined) {
      const struct = JSON.parse(val);
      let {limit, per} = struct;
      if (limit === undefined) {
        throw new Error('limit is absent');
      }
      limit = Number.parseInt(limit);
      if (isNaN(limit)) {
        throw new Error('limit is invalid');
      }
      if (per === undefined) {
        throw new Error('per is absent');
      }
      const perMs = durationToMilliseconds(per);
      if (isNaN(perMs)) {
        throw new Error('perMillis is invalid');
      }
      return {limit, perMs};
    }
    return defaultQuota;
  } catch (e) {
    console.warn('While initialzing quota:', (e instanceof Error ? e.message : e));
    return defaultQuota;
  }
}

// Oh, this could be called Game, but that would introduce all kinds of issues.
// Calling get() feeds the game to the player (I think, and calling put creates a game.)
// So, that should be fixed, you know.
export class GameHandler extends Handler {
  public static readonly INSTANCE = new GameHandler();
  private quotaHandler;

  private constructor(quotaConfig: QuotaConfig = get()) {
    super();
    this.quotaHandler = new QuotaHandler(quotaConfig);
  }

  public static boardOptions(board: RandomBoardOption | BoardName): Array<BoardName> {
    const allBoards = Object.values(BoardName);

    if (board === RandomBoardOption.ALL) return allBoards;
    if (board === RandomBoardOption.OFFICIAL) {
      return allBoards.filter((name) => {
        return name === BoardName.THARSIS ||
          name === BoardName.HELLAS ||
          name === BoardName.ELYSIUM;
      });
    }
    return [board];
  }
  public override get(req: Request, res: Response, ctx: Context): Promise<void> {
    req.url = '/build/assets/index_ca.html';
    return ServeAsset.INSTANCE.get(req, res, ctx);
  }

  // TODO(kberg): much of this code can be moved outside of handler, and that
  // would be better.
  public override put(req: Request, res: Response, ctx: Context): Promise<void> {
    return new Promise((resolve) => {
      if (this.quotaHandler.measure(ctx) === false) {
        responses.quotaExceeded(req, res);
        resolve();
        return;
      }

      let body = '';
      req.on('data', function(data) {
        body += data.toString();
      });
      req.once('end', () => {
        try {
          const gameReq = JSON.parse(body) as NewGameConfig;
          const gameId = safeCast(generateRandomId('g'), isGameId);
          const spectatorId = safeCast(generateRandomId('s'), isSpectatorId);
          const names = gameReq.players.map((obj: any) => {
            return obj.name;
          });
          if (names.length !== new Set(names).size) {
            responses.internalServerError(req, res, '名称不能相同');
            return;
          }
          const players = gameReq.players.map((obj: any) => {
            const player = new Player(
              obj.name,
              obj.color,
              obj.beginner,
              Number(obj.handicap), // For some reason handicap is coming up a string.
              safeCast(generateRandomId('p'), isPlayerId),
            );
            const user = GameLoader.getUserByPlayer(player);
            if (user !== undefined) {
              player.userId = user.id;
            }
            return player;
          });
          let firstPlayerIdx = 0;
          for (let i = 0; i < gameReq.players.length; i++) {
            if (gameReq.players[i].first === true) {
              firstPlayerIdx = i;
              break;
            }
          }

          const boards = GameHandler.boardOptions(gameReq.board);
          gameReq.board = boards[Math.floor(Math.random() * boards.length)];

          let gameOptions : GameOptions = {
            boardName: gameReq.board,
            clonedGamedId: gameReq.clonedGamedId,

            undoOption: gameReq.undoOption,
            showTimers: gameReq.showTimers,
            fastModeOption: gameReq.fastModeOption,
            showOtherPlayersVP: gameReq.showOtherPlayersVP,

            corporateEra: gameReq.corporateEra,
            venusNextExtension: gameReq.venusNext,
            coloniesExtension: gameReq.colonies,
            preludeExtension: gameReq.prelude,
            prelude2Expansion: gameReq.prelude2Expansion,
            turmoilExtension: gameReq.turmoil,
            aresExtension: gameReq.aresExtension,
            aresHazards: true, // Not a runtime option.
            politicalAgendasExtension: gameReq.politicalAgendasExtension,
            moonExpansion: gameReq.moonExpansion,
            pathfindersExpansion: gameReq.pathfindersExpansion,
            promoCardsOption: gameReq.promoCardsOption,
            erosCardsOption: gameReq.erosCardsOption,
            communityCardsOption: gameReq.communityCardsOption,
            solarPhaseOption: gameReq.solarPhaseOption,
            removeNegativeGlobalEventsOption: gameReq.removeNegativeGlobalEventsOption,
            includeVenusMA: gameReq.includeVenusMA,

            draftVariant: gameReq.draftVariant,
            initialDraftVariant: gameReq.initialDraft,
            startingCorporations: gameReq.startingCorporations,
            shuffleMapOption: gameReq.shuffleMapOption,
            randomMA: gameReq.randomMA,
            includeFanMA: gameReq.includeFanMA,
            soloTR: gameReq.soloTR,
            customCorporationsList: gameReq.customCorporationsList,
            bannedCards: gameReq.bannedCards || [],
            includedCards: gameReq.includedCards,
            customColoniesList: gameReq.customColoniesList,
            heatFor: gameReq.heatFor,
            breakthrough: gameReq.breakthrough,
            doubleCorp: gameReq.doubleCorp,
            customPreludes: gameReq.customPreludes,
            requiresVenusTrackCompletion: gameReq.requiresVenusTrackCompletion,
            requiresMoonTrackCompletion: gameReq.requiresMoonTrackCompletion,
            moonStandardProjectVariant: gameReq.moonStandardProjectVariant,
            initialCorpDraftVariant: gameReq.initialCorpDraftVariant,
            altVenusBoard: gameReq.altVenusBoard,
            escapeVelocityMode: gameReq.escapeVelocityMode,
            escapeVelocityThreshold: gameReq.escapeVelocityThreshold,
            escapeVelocityBonusSeconds: gameReq.escapeVelocityBonusSeconds,
            escapeVelocityPeriod: gameReq.escapeVelocityPeriod,
            escapeVelocityPenalty: gameReq.escapeVelocityPenalty,
            twoCorpsVariant: gameReq.twoCorpsVariant,
            ceoExtension: gameReq.ceoExtension,
            customCeos: gameReq.customCeos,
            startingCeos: gameReq.startingCeos,
            rankOption: gameReq.rankOption, // 天梯
            rankTimeLimit: gameReq.rankTimeLimit, // 天梯
            rankTimePerGeneration: gameReq.rankTimePerGeneration,
            starWarsExpansion: gameReq.starWarsExpansion,
            underworldExpansion: gameReq.underworldExpansion,
          };
          const userId = gameReq.userId;
          let isvip = false;
          if (userId !== undefined && userId !== '') {
            const user = GameLoader.getInstance().userIdMap.get(userId);
            if (user !== undefined && user.isvip()) {
              isvip = true;
            }
          }
          if (!isvip ) {
            const vipOptions = {
              heatFor: false,
              breakthrough: false,
              erosCardsOption: false,
              aresExtension: false,
              communityCardsOption: false,
              moonExpansion: false,
              politicalAgendasExtension: AgendaStyle.STANDARD,
              pathfindersExpansion: false,

              shuffleMapOption: false,
              removeNegativeGlobalEventsOption: false,
              randomMA: RandomMAOptionType.NONE,
              doubleCorp: false,
              // 这俩参数跟前端CreateGameForm页面不一样
              bannedCards: [],
              customColoniesList: [],
              customPreludes: [],
            };
            gameOptions = Object.assign(gameOptions, vipOptions);
          }

          const seed = Math.random();
          const game = Game.newInstance(gameId, players, players[firstPlayerIdx], gameOptions, seed, spectatorId);
          game.loadState = LoadState.LOADED;
          GameLoader.getInstance().add(game);
          responses.writeJson(res, Server.getSimpleGameModel(game));
        } catch (error) {
          console.warn(error);
          responses.internalServerError(req, res, error);
        }
        resolve();
      });
    });
  }
}

