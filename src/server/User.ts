
import {getDay, myId} from './UserUtil';
import {generateRandomId} from './utils/server-ids';

export class User {
  public createtime: string = '';
  public rollbackNum: number = 5;
  public rollbackDate: string = getDay();
  public vip : boolean = false;
  public vipDate : string = '2021-01-01';
  public accessDate : string = '2021-01-01';
  public showhandcards : boolean = false;
  public donateNum : number = 0;
  public tokenList : Array<string> = [];

  constructor(
        public name: string,
        public password: string,
        public id: string,
  ) {
  }

  public getProp() {
    if (this.donateNum === 0 && this.isvip() > 0) {
      this.donateNum = 1;
    }
    return JSON.stringify({
      rollbackNum: this.rollbackNum,
      rollbackDate: this.rollbackDate,
      vip: this.vip,
      vipDate: this.vipDate,
      accessDate: this.accessDate,
      showhandcards: this.showhandcards,
      donateNum: this.donateNum,
      tokenList: this.tokenList,
    });
  }

  public getRollbackNum() {
    if (!this.isvip()) {
      return 0;
    }
    if (getDay() !== this.rollbackDate) {
      if (this.vipDate > '3000-01-01') {
        this.rollbackNum = 30;
      } else {
        this.rollbackNum = 5;
      }
    }
    return this.rollbackNum;
  }

  public canRollback() {
    return this.isvip() && this.getRollbackNum() > 0 || this.id === myId;
  }

  public canDelete() {
    return this.id === myId;
  }

  public reduceRollbackNum() {
    this.rollbackNum = Math.max( 0, this.rollbackNum -1 );
    this.rollbackDate = getDay();
  }

  public addToken() : string {
    const token = this.id +generateRandomId('t');
    if (!this.tokenList) {
      this.tokenList = [];
    }
    this.tokenList.push(token);
    this.tokenList = this.tokenList.slice(-3, this.tokenList.length); // 截取最后3个
    return token;
  }

  public checkToken(token: string | null): boolean {
    if (token === null) {
      return false;
    }
    // 将userId刷新成 token, 直接用userId获取的会失败
    if (token === this.id) {
      return false;
    }
    if (!this.tokenList) {
      this.tokenList = [];
    }
    if (this.tokenList.indexOf(token) < 0) {
      return false;
    }
    return true;
  }

  // 1和2都是vip 数字用来区分不同的vip图标显示
  public isvip() : number {
    if (this.vipDate > '3000-01-01') {
      return 2;
    } else if (this.vipDate >= getDay()) {
      return 1;
    }
    return 0;
  }
}

