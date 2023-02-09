import * as http from 'http';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {BoardName} from '../../common/boards/BoardName';
import {RandomBoardOption} from '../../common/boards/RandomBoardOption';
import {GameLoader} from '../database/GameLoader';
import {Game, LoadState} from '../Game';
import {GameOptions} from '../GameOptions';
import {Player} from '../Player';
import {Server} from '../models/ServerModel';
import {ServeAsset} from './ServeAsset';
import {RandomMAOptionType} from '../../common/ma/RandomMAOptionType';
import {AgendaStyle} from '../../common/turmoil/Types';
import {NewGameConfig} from '../../common/game/NewGameConfig';
import {GameId, PlayerId, SpectatorId} from '../../common/Types';
import {generateRandomId} from '../server-ids';

// Oh, this could be called Game, but that would introduce all kinds of issues.

// Calling get() feeds the game to the player (I think, and calling put creates a game.)
// So, that should be fixed, you know.
export class GameHandler extends Handler {
  public static readonly INSTANCE = new GameHandler();
  private constructor() {
    super();
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
  public override get(req: http.IncomingMessage, res: http.ServerResponse, ctx: Context): Promise<void> {
    req.url = '/build/assets/index_ca.html';
    return ServeAsset.INSTANCE.get(req, res, ctx);
  }

  // TODO(kberg): much of this code can be moved outside of handler, and that
  // would be better.
  public override put(req: http.IncomingMessage, res: http.ServerResponse, ctx: Context): Promise<void> {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', function(data) {
        body += data.toString();
      });
      req.once('end', () => {
        try {
          const gameReq: NewGameConfig = JSON.parse(body);
          const gameId = generateRandomId('g') as GameId;
          const spectatorId = generateRandomId('s') as SpectatorId;
          const players = gameReq.players.map((obj: any) => {
            const player = new Player(
              obj.name,
              obj.color,
              obj.beginner,
              Number(obj.handicap), // For some reason handicap is coming up a string.
              generateRandomId('p') as PlayerId,
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
            _corporationsDraft: gameReq._corporationsDraft,
            startingCorporations: gameReq.startingCorporations,
            shuffleMapOption: gameReq.shuffleMapOption,
            randomMA: gameReq.randomMA,
            includeFanMA: gameReq.includeFanMA,
            soloTR: gameReq.soloTR,
            customCorporationsList: gameReq.customCorporationsList,
            bannedCards: gameReq.bannedCards || [],
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
            escapeVelocityPeriod: gameReq.escapeVelocityPeriod,
            escapeVelocityPenalty: gameReq.escapeVelocityPenalty,
            twoCorpsVariant: gameReq.twoCorpsVariant,
            leadersExtension: gameReq.leadersExtension,
            customLeaders: gameReq.customLeaders,
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
          const game = Game.newInstance(gameId, players, players[firstPlayerIdx], gameOptions, seed, spectatorId, false);
          game.loadState = LoadState.LOADED;
          GameLoader.getInstance().add(game);
          ctx.route.writeJson(res, Server.getSimpleGameModel(game));
        } catch (error) {
          console.warn(error);
          ctx.route.internalServerError(req, res, error);
        }
        resolve();
      });
    });
  }
}
