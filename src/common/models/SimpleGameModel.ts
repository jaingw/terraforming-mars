
import {Color} from '../Color';
import {GameId, PlayerId, SpectatorId} from '../Types';
import {Phase} from '../Phase';
import {GameOptionsModel} from './GameOptionsModel';

export type SimpleGameModel = {
    activePlayer: Color;
    id: GameId;
    name: string;
    phase: Phase;
    players: Array<SimplePlayerModel>;

    createtime: string;
    updatetime: string;
    gameAge: number;
    saveId: number;
    rollback: boolean | undefined;
    rollbackNum: number | undefined;
    delete: boolean | undefined;
    heatFor: boolean ;
    breakthrough: boolean ;

    spectatorId: SpectatorId | undefined;
    gameOptions: GameOptionsModel;
    lastSoloGeneration: number;
}

type SimplePlayerModel = {
    color: Color;
    id: PlayerId;
    name: string;
}
