import {Phase} from '../common/Phase';
import {SerializedClaimedMilestone} from './milestones/ClaimedMilestone';
import {DeferredAction} from './deferredActions/DeferredAction';
import {SerializedColony} from './SerializedColony';
import {SerializedPlayer, SerializedPlayerId} from './SerializedPlayer';
import {SerializedTurmoil} from './turmoil/SerializedTurmoil';
import {PlayerId, GameId, SpectatorId, SpaceId} from '../common/Types';
import {GameOptions} from './game/GameOptions';
import {AresData} from '../common/ares/AresData';
import {LogMessage} from '../common/logs/LogMessage';
import {SerializedBoard} from './boards/SerializedBoard';
import {SerializedMoonData} from './moon/SerializedMoonData';
import {SerializedFundedAward} from './awards/FundedAward';
import {SerializedPathfindersData} from './pathfinders/SerializedPathfindersData';
import {IAward} from './awards/IAward';
import {IMilestone} from './milestones/IMilestone';
import {SerializedDeck} from './cards/SerializedDeck';
import {SerializedDealer} from './SerializedDealer';
import {UnderworldData} from './underworld/UnderworldData';
import {GlobalParameter} from '../common/GlobalParameter';

export type SerializedGame = {
    exitedPlayers: Array<SerializedPlayer> ;
    activePlayer: SerializedPlayerId;
    aresData?: AresData;
    awards: Array<IAward>;
    beholdTheEmperor?: boolean;
    board: SerializedBoard;
    ceoDeck: SerializedDeck;
    currentSeed: number;
    claimedMilestones: Array<SerializedClaimedMilestone>;
    clonedGamedId?: string;
    colonies: Array<SerializedColony>;
    corporationDeck: SerializedDeck,
    dealer?: SerializedDealer;
    createdTimeMs: number;
    deferredActions: Array<DeferredAction>;
    donePlayers: Array<SerializedPlayerId>;
    draftedPlayers: Array<SerializedPlayerId>;
    draftRound: number;
    first: SerializedPlayerId;
    fundedAwards: Array<SerializedFundedAward>;
    gagarinBase: Array<SpaceId>;
    gameAge: number;
    gameLog: Array<LogMessage>;
    gameOptions: GameOptions;
    generation: number;
    globalsPerGeneration: Array<Partial<Record<GlobalParameter, number>>>;
    id: GameId;
    initialDraftIteration: number;
    lastSaveId: number;
    milestones: Array<IMilestone>;
    monsInsuranceOwner: SerializedPlayerId | undefined;
    energyStationOwner: SerializedPlayerId | undefined;
    moonData: SerializedMoonData | undefined;
    nomadSpace: SpaceId | undefined;
    pathfindersData: SerializedPathfindersData | undefined;
    oxygenLevel: number;
    phase: Phase;
    passedPlayers: Array<SerializedPlayerId>;
    players: Array<SerializedPlayer>;
    preludeDeck: SerializedDeck,
    projectDeck: SerializedDeck,
    researchedPlayers: Array<SerializedPlayerId>;

    seed: number;
    someoneHasRemovedOtherPlayersPlants: boolean;
    spectatorId: SpectatorId | undefined;
    stJosephCathedrals: Array<SpaceId>;
    syndicatePirateRaider: string | undefined;
    temperature: number;
    tradeEmbargo?: boolean;
    turmoil?: SerializedTurmoil;
    undoCount: number;
    underworldData?: UnderworldData;
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
    // unDraftedCards: Map<Object, Object>,
    unitedNationsMissionOneOwner: PlayerId | undefined ;
    quitPlayers: Array<SerializedPlayerId>;
}

