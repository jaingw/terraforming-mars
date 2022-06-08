
import {Color} from '../Color';
import {GameOptions} from '../../Game';
import {GameId, SpectatorId} from '../Types';
import {Phase} from '../Phase';

export interface SimpleGameModel {
    activePlayer: Color;
    id: GameId;
    phase: Phase;
    players: Array<SimplePlayerModel>;

    createtime: string;
    updatetime: string;
    gameAge: number;
    saveId: number;
    rollback: boolean | undefined;
    rollbackNum: number | undefined;
    delete: boolean | undefined;
    spectatorId: SpectatorId | undefined;
    gameOptions: GameOptions;
    lastSoloGeneration: number;
    heatFor: boolean ;
    breakthrough: boolean ;
}

interface SimplePlayerModel {
    color: Color;
    id: string;
    name: string;
}
