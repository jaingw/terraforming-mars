import {Phase} from './Phase';
import {ClaimedMilestone} from './ClaimedMilestone';
import {FundedAward} from './FundedAward';
import {IMilestone} from './milestones/IMilestone';
import {IAward} from './awards/IAward';
import {ColonyDealer} from './colonies/ColonyDealer';
import {DeferredAction} from './deferredActions/DeferredAction';
import {SerializedColony} from './SerializedColony';
import {SerializedPlayer} from './SerializedPlayer';
import {SerializedDealer} from './SerializedDealer';
import {SerializedTurmoil} from './turmoil/SerializedTurmoil';
import {GameOptions} from './Game';
import {IAresData} from './ares/IAresData';
import {LogMessage} from './LogMessage';
import {SerializedBoard} from './boards/SerializedBoard';

export interface SerializedGame {
    exitedPlayers: Array<SerializedPlayer> ;
    activePlayer: SerializedPlayer;
    aresData?: IAresData;
    awards: Array<IAward>;
    board: SerializedBoard;
    claimedMilestones: Array<ClaimedMilestone>;
    clonedGamedId?: string;
    colonies: Array<SerializedColony>;
    colonyDealer: ColonyDealer | undefined;
    dealer: SerializedDealer;
    deferredActions: Array<DeferredAction>;
    donePlayers: Array<SerializedPlayer>;
    draftedPlayers: Array<SerializedPlayer>;
    draftRound: number;
    first: SerializedPlayer;
    fundedAwards: Array<FundedAward>;
    gameAge: number;
    gameLog: Array<LogMessage>;
    gameOptions: GameOptions;
    generation: number;
    id: string;
    initialDraftIteration: number;
    lastSaveId: number;
    milestones: Array<IMilestone>;
    monsInsuranceOwner: SerializedPlayer | undefined;
    oxygenLevel: number;
    passedPlayers: Array<SerializedPlayer>;
    phase: Phase;
    players: Array<SerializedPlayer>;
    researchedPlayers: Array<SerializedPlayer>;

    seed: number
    someoneHasRemovedOtherPlayersPlants: boolean;
    temperature: number;
    turmoil?: SerializedTurmoil;
    venusScaleLevel: number;
    venusNextExtension: boolean;

    createtime :string;
    updatetime :string;
}

