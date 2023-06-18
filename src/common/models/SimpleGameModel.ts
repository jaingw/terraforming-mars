
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
    heatFor: boolean ;
    breakthrough: boolean ;

    spectatorId: SpectatorId | undefined;
    gameOptions: GameOptions;
    lastSoloGeneration: number;
    expectedPurgeTimeMs: number;
}

type SimplePlayerModel = {
    color: Color;
    id: PlayerId;
    name: string;
}
