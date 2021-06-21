
import {getDay, myId} from './UserUtil';

export class User {
    public createtime: string = '';
    public rollbackNum: number = 5;
    public rollbackDate: string = getDay();
    public vip : boolean = false;
    public vipDate : string = '2021-01-01';
    public accessDate : string = '2021-01-01';
    public showhandcards : boolean = false;

    constructor(
        public name: string,
        public password: string,
        public id: string,
    ) {
    }

    public getProp() {
      return JSON.stringify({
        rollbackNum: this.rollbackNum,
        rollbackDate: this.rollbackDate,
        vip: this.vip,
        vipDate: this.vipDate,
        accessDate: this.accessDate,
        showhandcards: this.showhandcards,
      });
    }

    public getRollbackNum() {
      if (!this.isvip()) {
        return 0;
      }
      if (getDay() !== this.rollbackDate) {
        if (this.vipDate > '3000-01-01') {
          this.rollbackNum = 5;
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

