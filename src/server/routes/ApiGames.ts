import * as responses from '../server/responses';
import {Handler} from './Handler';
import {Context} from './IHandler';
import * as UserUtil from '../UserUtil';
import {Request} from '../Request';
import {Response} from '../Response';
import {normalizeUserId} from '../../common/utils/normalizeUserId';
import {Database} from '../database/Database';
import {IGameMetadata, IShortData} from '../database/IDatabase';

// 将数据库轻量 metadata 转成列表接口的返回结构；没有 shortData 的旧记录会被过滤掉。
export function metadataToGameListItem(metadata: IGameMetadata) {
  const game = metadata.shortData;
  if (game === undefined) {
    return undefined;
  }
  return shortDataToGameListItem(game);
}

// 只暴露列表页需要的字段，避免把 userId 等敏感字段透给客户端。
function shortDataToGameListItem(game: IShortData) {
  return {
    id: game.id,
    phase: game.phase,
    players: game.players.map((player) => {
      return {
        id: player.id,
        name: player.name,
        color: player.exited ? 'gray' : player.color,
      };
    }),
    createtime: game.createtime?.slice(0, 16),
    updatetime: game.updatetime?.slice(0, 16),
    gameAge: game.gameAge,
    saveId: game.lastSaveId,
  };
}

export class ApiGames extends Handler {
  public static readonly INSTANCE = new ApiGames();
  private constructor() {
    super({validateServerId: true});
  }

  public override async get(req: Request, res: Response, ctx: Context): Promise<void> {
    const userId = ctx.url.searchParams.get('userId');
    if (userId === undefined || userId === null || normalizeUserId(userId) !== UserUtil.myId) {
      console.warn('Not me');
      responses.notFound(req, res, 'Not me');
      return;
    }

    // 列表接口直接查 game 表元数据，不触发完整游戏加载。
    const answer = (await Database.getInstance().getGames())
      .map(metadataToGameListItem)
      .filter((game) => game !== undefined);
    responses.writeJson(res, ctx, answer);
  }
}
