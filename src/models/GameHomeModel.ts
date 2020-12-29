
import {Color} from '../Color';
import {GameId} from '../Game';
import {Phase} from '../Phase';

export interface GameHomeModel {
    activePlayer: Color;
    id: GameId;
    phase: Phase;
    players: Array<GameHomePlayerModel>;

    createtime: string;
    updatetime: string;
    gameAge: number;
    saveId: number;
    rollback: boolean | undefined;
    rollbackNum: number | undefined;
    delete: boolean | undefined;
}

interface GameHomePlayerModel {
    color: Color;
    id: string;
    name: string;
}
