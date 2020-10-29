
import { getDate,getDay,myId} from  "./UserUtil";

export class User  {
    public createdTime: string = getDate();
    public rollbackNum: number = 5;
    public rollbackDate: string = getDay();
    public vip : boolean = false;
    public vipDate : string = getDay();
    
    constructor(
        public name: string,
        public password: string,
        public id: string
        ) {
    }

    public getProp(){
        return JSON.stringify({
            rollbackNum: this.rollbackNum, 
            rollbackDate: this.rollbackDate,
            vip: this.vip,
            vipDate: this.vipDate
        })
    }

    public getRollbackNum(){
        if(getDay() !== this.rollbackDate){
            this.rollbackNum =  5;
        }
        return this.rollbackNum;
    }

    public canRollback(){
        return this.isvip() && this.getRollbackNum() > 0 ||  this.id === myId ;
    }
    
    public canDelete(){
        return this.id === myId ;
    }

    public reduceRollbackNum(){
        this.rollbackNum = Math.max( 0, this.rollbackNum -1 ) ;
    }

    public isvip() : boolean{
        return this.vip && this.vipDate >= getDay() || this.vipDate > getDay() ;
    }

}

