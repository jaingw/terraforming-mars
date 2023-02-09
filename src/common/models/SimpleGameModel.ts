
import {Color} from '../Color';
import {GameId, PlayerId, SpectatorId} from '../Types';
import {Phase} from '../Phase';
import {GameOptions} from '../../server/GameOptions';

export type SimpleGameModel = {
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

type SimplePlayerModel = {
    color: Color;
    id: PlayerId;
    name: string;
}
