
import {Color} from '../Color';
import {GameId, GameOptions} from '../Game';
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
    gameOptions: GameOptions;
    lastSoloGeneration: number;
    heatFor: boolean ;
    breakthrough: boolean ;
}

interface GameHomePlayerModel {
    color: Color;
    id: string;
    name: string;
}
