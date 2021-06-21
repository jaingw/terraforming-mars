import * as http from 'http';
import {Handler} from './Handler';
import {IContext} from './IHandler';
import {BoardName} from '../boards/BoardName';
import {GameLoader} from '../database/GameLoader';
import {Game, LoadState} from '../Game';
import {Player} from '../Player';
import {Server} from '../models/ServerModel';
import {ServeAsset} from './ServeAsset';
import {generateRandomId} from '../UserUtil';
import {RandomMAOptionType} from '../RandomMAOptionType';
import {AgendaStyle} from '../turmoil/PoliticalAgendas';

// Oh, this could be called Game, but that would introduce all kinds of issues.

// Calling get() feeds the game to the player (I think, and calling put creates a game.)
// So, that should be fixed, you know.
export class GameHandler extends Handler {
  public static readonly INSTANCE = new GameHandler();
  private constructor() {
    super();
  }


  public get(req: http.IncomingMessage, res: http.ServerResponse, ctx: IContext): void {
    req.url = '/build/assets/index_ca.html';
    ServeAsset.INSTANCE.get(req, res, ctx);
  }

  // TODO(kberg): much of this code can be moved outside of handler, and that
  // would be better.
  public put(req: http.IncomingMessage, res: http.ServerResponse, ctx: IContext): void {
    let body = '';
    req.on('data', function(data) {
      body += data.toString();
    });
    req.once('end', () => {
      try {
        const gameReq = JSON.parse(body);
        const gameId = generateRandomId('g');
        const spectatorId = generateRandomId('s');
        const players = gameReq.players.map((obj: any) => {
          const player = new Player(
            obj.name,
            obj.color,
            obj.beginner,
            Number(obj.handicap), // For some reason handicap is coming up a string.
            generateRandomId('p'),
          );
          const user = GameLoader.getUserByPlayer(player);
          if (user !== undefined) {
            player.userId = user.id;
          }
          return player;
        });
        let firstPlayerIdx: number = 0;
        for (let i = 0; i < gameReq.players.length; i++) {
          if (gameReq.players[i].first === true) {
            firstPlayerIdx = i;
            break;
          }
        }

        if (gameReq.board === 'random') {
          const boards = Object.values(BoardName);
          gameReq.board = boards[Math.floor(Math.random() * boards.length)];
        }

        let gameOptions = {
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
          soloTR: gameReq.soloTR,
          customCorporationsList: gameReq.customCorporationsList,
          cardsBlackList: gameReq.cardsBlackList,
          customColoniesList: gameReq.customColoniesList,
          heatFor: gameReq.heatFor,
          breakthrough: gameReq.breakthrough,
          doubleCorp: gameReq.doubleCorp,
          requiresVenusTrackCompletion: gameReq.requiresVenusTrackCompletion,
          requiresMoonTrackCompletion: gameReq.requiresMoonTrackCompletion,
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

            shuffleMapOption: false,
            removeNegativeGlobalEventsOption: false,
            randomMA: RandomMAOptionType.NONE,
            doubleCorp: false,
            // 这俩参数跟前端CreateGameForm页面不一样
            cardsBlackList: [],
            customColoniesList: [],
          };
          gameOptions = Object.assign(gameOptions, vipOptions);
        }

        const seed = Math.random();
        const game = Game.newInstance(gameId, players, players[firstPlayerIdx], gameOptions, seed, spectatorId, false);
        game.loadState = LoadState.LOADED;
        GameLoader.getInstance().add(game);
        ctx.route.writeJson(res, Server.getGameModel(game, gameReq.userId));
      } catch (error) {
        ctx.route.internalServerError(req, res, error);
      }
    });
  }
}
