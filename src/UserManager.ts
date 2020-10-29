
import * as http from "http";
import * as querystring from "querystring";
import * as server from "../server";
import {gameLoader} from "../server";
import { User } from "./User";
import { Database } from "./database/Database";

const colorNames = ["Blue", "Red", "Yellow", "Green", "Black", "Purple", "You"];

function notFound(req: http.IncomingMessage, res: http.ServerResponse): void {
    if ( ! process.argv.includes("hide-not-found-warnings")) {
        console.warn("Not found", req.method, req.url);
    }
    res.writeHead(404);
    res.write("Not found");
    res.end();
}

export function apiGameBack(req: http.IncomingMessage, res: http.ServerResponse): void {
    if (req.url === undefined) {
      console.warn("url not defined");
      notFound(req, res);
      return;
    }
  
    const qs: string = req.url!.substring("/api/gameback?".length);
    const queryParams = querystring.parse(qs);
    const gameId = (queryParams as any)["id"];
    const userId = (queryParams as any)["userId"];
  
    if (gameId === undefined || gameId === "") {
      console.warn("didn't find game id");
      notFound(req, res);
      return;
    }
  
    if (userId === undefined || userId === "") {
      console.warn("didn't find user id");
      notFound(req, res);
      return;
    }
  
    const user = gameLoader.userIdMap.get(userId);
    if (user === undefined || !user.canRollback()) {
      console.warn("didn't find user ");
      notFound(req, res);
      return;
    }
    const game = gameLoader.games.get(gameId);
  
    if (game === undefined) {
      console.warn("game is undefined");
      notFound(req, res);
      return;
    }
    console.log("user:"+ user.name +" rollback game " + game.id);
    game.rollback();
    user.reduceRollbackNum();
    res.setHeader("Content-Type", "application/json");
    res.write("success");
    res.end();
}
  
export  function apiGetMyGames(req: http.IncomingMessage, res: http.ServerResponse): void {

    const routeRegExp: RegExp = /^\/api\/mygames\?id\=([0-9abcdef]+).*?$/i;
  
    if (req.url === undefined) {
      console.warn("url not defined");
      notFound(req, res);
      return;
    }
  
    if (!routeRegExp.test(req.url)) {
      console.warn("no match with regexp");
      notFound(req, res);
      return;
    }
  
    const matches = req.url.match(routeRegExp);
  
    if (matches === null || matches[1] === undefined) {
      console.warn("didn't find user id");
      notFound(req, res);
      return;
    }
  
    const userId: string = matches[1];
  
    const user = gameLoader.userIdMap.get(userId);
  
    if (user === undefined) {
      console.warn("user is undefined");
      notFound(req, res);
      return;
    }
    const gameids = gameLoader.usersToGames.get(user.id);
    const mygames: Array<any> = [];
    if (gameids !== undefined && gameids.length > 0) {
      gameids.forEach((id) => {
        const game = gameLoader.games.get(id);
        if (game !== undefined) {
          mygames.push({
            activePlayer: game.activePlayer.color,
            id: game.id,
            phase: game.phase,
            players: game.getPlayers().map(player => {
              return {
                id: player.id,
                name: player.name,
                color: player.color
              }
            }),
            createtime: game.createtime?.slice(5, 16),
            updatetime: game.updatetime?.slice(5, 16),
            gameAge: game.gameAge,
            saveId: game.lastSaveId
          });
        }
      })
    }
    mygames.sort((a: any, b: any) => {
      return a.updatetime > b.updatetime ? -1 : (a.updatetime === b.updatetime ? 0 : 1)
    })
    const data = {mygames:mygames, vipDate: ""};
    if(user.isvip()){
      data.vipDate = user.vipDate;
    }
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(data));
    res.end();
}
 

export function login(req: http.IncomingMessage, res: http.ServerResponse): void {
    let body = "";
    req.on("data", function (data) {
      body += data.toString();
    });
    req.once("end", function () {
      try {
        const userReq = JSON.parse(body);
        const userName: string = userReq.userName;
        const password: string = userReq.password;
        if (userName === undefined || userName.length <= 1) {
          throw new Error("UserName must not be empty and  be longer than 1")
        }
        const user = gameLoader.userNameMap.get(userName);
        if (user === undefined) {
          throw new Error("User not exists ");
        }
        if (password === undefined || password.length <= 2) {
          throw new Error("Password must not be empty and  be longer than 2");
        }
        if (password !== user.password) {
          throw new Error("Password error");
        }
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify({ id: user.id, name: user.name }));
      } catch (err) {
        console.warn("error login", err);
        res.writeHead(500);
        res.write("Unable to login: " + err.message);
      }
      res.end();
    });
}
  
export function register(req: http.IncomingMessage, res: http.ServerResponse): void {
    let body = "";
    req.on("data", function (data) {
      body += data.toString();
    });
    req.once("end", function () {
      try {
        const userReq = JSON.parse(body);
        const userId = server.generateRandomGameId();
        const userName: string = userReq.userName;
        const password: string = userReq.password;
        if (userName === undefined || userName.length <= 1) {
          throw new Error("UserName must not be empty and  be longer than 1")
        }
        if (gameLoader.userNameMap.get(userName) !== undefined || colorNames.indexOf(userName) > -1) {
          throw new Error("User name already exists, please use another name ");
        }
        if (password === undefined || password.length <= 2) {
          throw new Error("Password must not be empty and  be longer than 2");
        }
        Database.getInstance().saveUser(userId, userName, password, "{}");
        const user: User = new User(userName, password, userId);
        gameLoader.userNameMap.set(userName, user);
        gameLoader.userIdMap.set(userId, user);
        res.setHeader("Content-Type", "application/json");
        res.write("success");
      } catch (err) {
        console.warn("error register user", err);
        res.writeHead(500);
        res.write("Unable to register user: " + err.message);
      }
      res.end();
    });
}

export  function isvip(req: http.IncomingMessage, res: http.ServerResponse): void {
    const qs: string = req.url!.substring("/api/isvip?".length);
    const queryParams = querystring.parse(qs);
    const userId = (queryParams as any)["userId"];
    
    if (userId === undefined || userId === "") {
        console.warn("didn't find user id");
        notFound(req, res);
        return;
    }
    
    const user = gameLoader.userIdMap.get(userId);
    if (user === undefined  ) {
        console.warn("didn't find user ");
        notFound(req, res);
        return;
    }

    try{
        res.setHeader("Content-Type", "application/json");
        if( user.isvip()){
            res.write("success");
        }else{
            res.write("error");
        }
        res.end();
    }catch(err) {
        console.warn("error execute", err);
        res.writeHead(500);
        res.write("Unable to execute");
        res.end();
    }
}

export function resign(req: http.IncomingMessage, res: http.ServerResponse): void {
  let body = "";
  req.on("data", function (data) {
    body += data.toString();
  });
  req.once("end", function () {
    try {
      const userReq = JSON.parse(body);
      const userId: string = userReq.userId;
      const playerId: string = userReq.playerId;

      const game = gameLoader.playerToGame.get(playerId);
      if (game === undefined || gameLoader.games.get(game.id) === undefined) {
        notFound(req, res);
        return;
      }
      const player = game.getAllPlayers().find((p) => p.id === playerId);
      if (player === undefined) {
        notFound(req, res);
        return;
      }
      const userPlayer = gameLoader.userNameMap.get(player.name);
      const user = gameLoader.userIdMap.get(userId);
      if(user === undefined || !user.isvip()){
        notFound(req, res);
        return;
      }
      if (userPlayer !== undefined && userPlayer.id !== userId) {//已注册并且不等于登录用户  不能体退
        notFound(req, res);
        return;
      }
      game.exitPlayer(player);
      res.setHeader("Content-Type", "application/json");
      res.write(server.getPlayer(player, game, false));
      res.end();
    } catch (err) {
      console.warn("error resign", err);
      console.warn("error resign:", body);
      res.writeHead(500);
      res.write("Unable to resign: " + err.message);
      res.end();
    }
  });
}
