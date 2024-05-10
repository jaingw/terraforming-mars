import * as responses from './responses';
import {Handler} from './Handler';
import {Context} from './IHandler';
import {Request} from '../Request';
import {Response} from '../Response';
import * as UserManager from '../UserManager';

type IUserGetHandler = ( req: Request, res: Response, ctx: Context) => void;
type IUserPostHandler = (body: string, req: Request, res: Response, ctx: Context) => void;

export const userGetHandler :Map<string, IUserGetHandler> = new Map(
  [
    ['api/mygames', UserManager.apiGetMyGames],
    ['api/isvip', UserManager.isvip],
    ['api/userrank', UserManager.getUserRank],
    ['api/userranks', UserManager.getUserRanks],
  ],
);

export const userPostHandler :Map<string, IUserPostHandler> = new Map(
  [
    ['api/login', UserManager.login],
    ['player/resign', UserManager.resign],
    ['api/showHand', UserManager.showHand],
    ['api/sitDown', UserManager.sitDown],
    ['api/gameback', UserManager.apiGameBack],
    ['api/activateRank', UserManager.activateRank],
    ['player/endgame', UserManager.endGameByEvent],
    ['api/register', UserManager.register],

  ],
);


export class ApiUserManager extends Handler {
  public static readonly INSTANCE = new ApiUserManager();

  private constructor() {
    super();
  }

  public override get(req: Request, res: Response, ctx: Context): Promise<void> {
    const pathname = ctx.url.pathname.substring(1); // Remove leading '/'
    const uhandler: IUserGetHandler | undefined = userGetHandler.get(pathname);
    if (uhandler === undefined) {
      responses.notFound(req, res);
      return Promise.resolve();
    }
    try {
      uhandler(req, res, ctx);
    } catch (err) {
      if (err instanceof Error && err.name === 'UnexpectedInput') {
        console.warn('error ', pathname, err.message);
      } else {
        console.warn('error ', pathname, err);
      }
      res.writeHead(500);
      const message = err instanceof Error ? err.message : String(err);
      res.write('执行错误 : ' + message);
      res.end();
    }
    return Promise.resolve();
  }


  public override post(req: Request, res: Response, ctx: Context): Promise<void> {
    const pathname = ctx.url.pathname.substring(1); // Remove leading '/'
    const uhandler: IUserPostHandler | undefined = userPostHandler.get(pathname);
    if (uhandler === undefined) {
      responses.notFound(req, res);
      return Promise.resolve();
    }
    let body = '';
    req.on('data', function(data) {
      body += data.toString();
    });
    req.once('end', function() {
      try {
        const userReq:any = JSON.parse(body);
        uhandler(userReq, req, res, ctx);
      } catch (err) {
        if (err instanceof Error && err.name === 'UnexpectedInput') {
          console.warn('error '+pathname+ ',' + body + ',' + err.message);
        } else {
          console.warn('error '+pathname+ ',' + body + ',', err);
        }
        res.writeHead(500);
        const message = err instanceof Error ? err.message : String(err);
        res.write('执行错误 : ' + message);
        res.end();
      }
    });
    return Promise.resolve();
  }
}
