import {Phase} from './common/Phase';
import {SerializedClaimedMilestone} from './milestones/ClaimedMilestone';
import {DeferredAction} from './deferredActions/DeferredAction';
import {SerializedColony} from './SerializedColony';
import {SerializedPlayer, SerializedPlayerId} from './SerializedPlayer';
import {SerializedDealer} from './SerializedDealer';
import {SerializedTurmoil} from './turmoil/SerializedTurmoil';
import {SpectatorId} from './common/Types';
import {GameOptions} from './Game';
import {IAresData} from './common/ares/IAresData';
import {LogMessage} from './common/logs/LogMessage';
import {SerializedBoard} from './boards/SerializedBoard';
import {SerializedMoonData} from './moon/SerializedMoonData';
import {SerializedFundedAward} from './awards/FundedAward';
import {SerializedPathfindersData} from './pathfinders/SerializedPathfindersData';
import {IAward} from './awards/IAward';
import {IMilestone} from './milestones/IMilestone';

export interface SerializedGame {
    exitedPlayers: Array<SerializedPlayer> ;
    activePlayer: SerializedPlayerId;
    aresData?: IAresData;
    awards: Array<IAward>;
    board: SerializedBoard;
    // game.rng changes over the course of a game but isn't saved and serialized
    // for instance, in the face of a redeal.
    currentSeed: number | undefined; // TODO(kberg): Remove '|undefined' by 2022-06-01
    claimedMilestones: Array<SerializedClaimedMilestone>;
    clonedGamedId?: string;
    colonies: Array<SerializedColony>;
    dealer: SerializedDealer;
    deferredActions: Array<DeferredAction>;
    donePlayers: Array<SerializedPlayerId>;
    draftedPlayers: Array<SerializedPlayerId>;
    draftRound: number;
    first: SerializedPlayerId;
    fundedAwards: Array<SerializedFundedAward>;
    gameAge: number;
    gameLog: Array<LogMessage>;
    gameOptions: GameOptions;
    generation: number;
    id: string;
    initialDraftIteration: number;
    lastSaveId: number;
    milestones: Array<IMilestone>;
    monsInsuranceOwner: SerializedPlayerId | undefined;
    moonData: SerializedMoonData | undefined;
    pathfindersData: SerializedPathfindersData | undefined;
    oxygenLevel: number;
    phase: Phase;
    passedPlayers: Array<SerializedPlayerId>;
    players: Array<SerializedPlayer>;
    researchedPlayers: Array<SerializedPlayerId>;

    seed: number;
    someoneHasRemovedOtherPlayersPlants: boolean;
    spectatorId: SpectatorId | undefined;
    syndicatePirateRaider: string | undefined;
    temperature: number;
    turmoil?: SerializedTurmoil;
    undoCount: number;
    venusScaleLevel: number;
    venusNextExtension?: boolean;

    createtime :string;
    updatetime :string;
    breakthrough: boolean;
    cardDrew: boolean;
    heatFor: boolean,
    loadState: string,
    firstExited: boolean,
    finishFirstTrading: boolean,
    soloMode: boolean,
    // unDraftedCards: Map<Object, Object>,
    unitedNationsMissionOneOwner: string | undefined ;
}

