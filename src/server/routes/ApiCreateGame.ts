import * as crypto from 'crypto';
import {BoardName} from '../../common/boards/BoardName';
import {RandomBoardOption} from '../../common/boards/RandomBoardOption';
import {NewGameConfig} from '../../common/game/NewGameConfig';
import {RandomMAOptionType} from '../../common/ma/RandomMAOptionType';
import {SimpleGameModel} from '../../common/models/SimpleGameModel';
import {isGameId, isPlayerId, isSpectatorId, safeCast} from '../../common/Types';
import {GameLoader} from '../database/GameLoader';
import {Game, LoadState} from '../Game';
import {GameOptions} from '../game/GameOptions';
import {Player} from '../Player';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {Request} from '../Request';
import {Response} from '../Response';
import {Server} from '../models/ServerModel';
import {QuotaConfig, QuotaHandler} from '../server/QuotaHandler';
import * as responses from '../server/responses';
import {durationToMilliseconds} from '../utils/durations';
import {generateRandomId} from '../utils/server-ids';
import { IGameLoader } from '../database/IGameLoader';

function getQuotaConfig(): QuotaConfig {
  const defaultQuota = {limit: 1, perMs: 1};
  const val = process.env.GAME_QUOTA;
  try {
    if (val !== undefined) {
      const struct = JSON.parse(val);
      let {limit} = struct;
      const {per} = struct;
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

export class ApiCreateGame extends Handler {
  public static readonly INSTANCE = new ApiCreateGame();
  private quotaHandler;

  public constructor(quotaConfig: QuotaConfig = getQuotaConfig()) {
    super();
    this.quotaHandler = new QuotaHandler(quotaConfig);
  }

  public static boardOptions(board: RandomBoardOption | BoardName): Array<BoardName> {
    const allBoards = [
      BoardName.THARSIS,
      BoardName.HELLAS,
      BoardName.ELYSIUM,
      BoardName.UTOPIA_PLANITIA,
      BoardName.VASTITAS_BOREALIS_NOVA,
      BoardName.TERRA_CIMMERIA_NOVA,
      BoardName.ARABIA_TERRA,
      BoardName.VASTITAS_BOREALIS,
      BoardName.AMAZONIS,
      BoardName.TERRA_CIMMERIA,
      BoardName.HOLLANDIA,
    ];

    if (board === RandomBoardOption.ALL) {
      return allBoards;
    }
    if (board === RandomBoardOption.OFFICIAL) {
      return allBoards.filter((name) => {
        return name === BoardName.THARSIS ||
          name === BoardName.HELLAS ||
          name === BoardName.ELYSIUM ||
          name === BoardName.UTOPIA_PLANITIA ||
          name === BoardName.VASTITAS_BOREALIS_NOVUS ||
          name === BoardName.TERRA_CIMMERIA_NOVUS;
      });
    }
    return [board];
  }

  public static async createGame(gameReq: NewGameConfig, gameLoader: IGameLoader): Promise<SimpleGameModel> {
    const expansions = gameReq.expansions ?? {
      corpera: true,
      promo: false,
      venus: false,
      colonies: false,
      prelude: false,
      prelude2: false,
      turmoil: false,
      community: false,
      ares: false,
      moon: false,
      pathfinders: false,
      ceo: false,
      starwars: false,
      underworld: false,
      breakthrough: false,
      eros: false,
      commission: false,
      deltaProject: false,
    };
    const gameId = safeCast(generateRandomId('g'), isGameId);
    const spectatorId = safeCast(generateRandomId('s'), isSpectatorId);
    const names = gameReq.players.map((obj) => obj.name);

    if (names.length !== new Set(names).size) {
      throw new Error('名称不能相同');
    }

    const players = await Promise.all(gameReq.players.map(async (obj) => {
      const player = new Player(
        obj.name,
        obj.color,
        obj.beginner,
        Number(obj.handicap), // For some reason handicap is coming up a string.
        safeCast(generateRandomId('p'), isPlayerId),
      );
      const user = await GameLoader.getInstance().getUserByName(player.name);
      if (user !== undefined) {
        player.userId = user.id;
      }
      return player;
    }));

    let firstPlayerIdx = 0;
    for (let i = 0; i < gameReq.players.length; i++) {
      if (gameReq.players[i].first === true) {
        firstPlayerIdx = i;
        break;
      }
    }

    const boards = ApiCreateGame.boardOptions(gameReq.board);
    gameReq.board = boards[Math.floor(Math.random() * boards.length)];

    let gameOptions: GameOptions = {
      altVenusBoard: gameReq.altVenusBoard,
      aresExtension: expansions.ares,
      aresHazards: true, // Not a runtime option.
      aresExtremeVariant: gameReq.aresExtremeVariant,
      bannedCards: gameReq.bannedCards || [],
      boardName: gameReq.board,
      ceoExtension: expansions.ceo,
      clonedGamedId: gameReq.clonedGamedId,
      coloniesExtension: expansions.colonies,
      communityCardsOption: expansions.community,
      commissionCardsOption: expansions.commission,
      expansions,
      ceosDraftVariant: false,
      corporateEra: expansions.corpera,
      customCeos: gameReq.customCeos,
      customColoniesList: gameReq.customColoniesList,
      customCorporationsList: gameReq.customCorporationsList,
      customPreludes: gameReq.customPreludes,
      deltaProjectExpansion: expansions.deltaProject,
      draftVariant: gameReq.draftVariant,
      escapeVelocity: gameReq.escapeVelocity,
      fastModeOption: gameReq.fastModeOption,
      includedCards: gameReq.includedCards,
      includeFanMA: gameReq.includeFanMA,
      initialDraftVariant: gameReq.initialDraft,
      modularMA: gameReq.modularMA,
      moonExpansion: expansions.moon,
      moonStandardProjectVariant: gameReq.moonStandardProjectVariant,
      moonStandardProjectVariant1: gameReq.moonStandardProjectVariant1,
      pathfindersExpansion: expansions.pathfinders,
      politicalAgendasExtension: gameReq.politicalAgendasExtension,
      prelude2Expansion: expansions.prelude2,
      preludeDraftVariant: gameReq.initialDraft, // 初始轮抽肯定带着prelude
      preludeExtension: expansions.prelude,
      promoCardsOption: expansions.promo,
      erosCardsOption: expansions.eros,
      randomMA: gameReq.randomMA,
      removeNegativeGlobalEventsOption: gameReq.removeNegativeGlobalEventsOption,
      requiresMoonTrackCompletion: gameReq.requiresMoonTrackCompletion,
      requiresVenusTrackCompletion: gameReq.requiresVenusTrackCompletion,
      showOtherPlayersVP: gameReq.showOtherPlayersVP,
      showTimers: gameReq.showTimers,
      shuffleMapOption: gameReq.shuffleMapOption,
      solarPhaseOption: gameReq.solarPhaseOption,
      soloTR: gameReq.soloTR,
      heatFor: gameReq.heatFor,
      breakthrough: expansions.breakthrough,
      doubleCorp: gameReq.doubleCorp,
      initialCorpDraftVariant: gameReq.initialCorpDraftVariant && gameReq.doubleCorp,
      startingCeos: gameReq.startingCeos,
      rankOption: gameReq.rankOption, // 天梯
      rankTimeLimit: gameReq.rankTimeLimit, // 天梯
      rankTimePerGeneration: gameReq.rankTimePerGeneration,
      startingCorporations: gameReq.startingCorporations,
      startingPreludes: gameReq.startingPreludes,
      starWarsExpansion: expansions.starwars,
      turmoilExtension: expansions.turmoil,
      underworldExpansion: expansions.underworld,
      undoOption: gameReq.undoOption,
      venusNextExtension: expansions.venus,
      seed: gameReq.seed,
    };

    const userId = gameReq.userId;
    let isvip = false;
    if (userId !== undefined && userId !== '') {
      const user = await GameLoader.getInstance().getUserById(userId);
      if (user !== undefined && user.isvip()) {
        isvip = true;
      }
    }
    if (!isvip) {
      const vipOptions = {
        heatFor: false,
        breakthrough: false,
        erosCardsOption: false,
        aresExtension: false,
        communityCardsOption: false,
        commissionCardsOption: false,
        moonExpansion: false,
        politicalAgendasExtension: 'Standard',
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

    let seed = Math.random();
    if (players.length === 1 && gameOptions.seed !== undefined && gameOptions.seed.length > 0) {
      const md5str = crypto.createHash('md5').update(gameOptions.seed).digest('hex').substring(0, 8);
      seed = (parseInt(md5str, 16) & 0X1FFFFFFFF) * 1.0 / 0X100000000;
    }

    const game = Game.newInstance(gameId, players, players[firstPlayerIdx], gameOptions, seed, spectatorId);
    game.loadState = LoadState.LOADED;
    gameLoader.add(game);
    return Server.getSimpleGameModel(game);
  }

  public override post(req: Request, res: Response, ctx: Context): Promise<void> {
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
      req.once('end', async () => {
        try {
          const gameReq = JSON.parse(body) as NewGameConfig;
          const model = await ApiCreateGame.createGame(gameReq, ctx.gameLoader);
          responses.writeJson(res, ctx, model);
        } catch (error) {
          console.warn(error);
          responses.internalServerError(req, res, error);
        }
        resolve();
      });
    });
  }
}
