import { IProjectCard } from "./cards/IProjectCard";
import { Phase } from "./Phase";
import { ClaimedMilestone } from "./ClaimedMilestone";
import { FundedAward } from "./FundedAward";
import { IMilestone } from "./milestones/IMilestone";
import { IAward } from "./awards/IAward";
import { ColonyDealer } from "./colonies/ColonyDealer";
import { DeferredAction } from "./deferredActions/DeferredAction";
import { Board } from "./Board";
import { CardName } from "./CardName";
import { BoardName } from "./BoardName";
import { SerializedColony } from "./SerializedColony";
import { SerializedPlayer } from "./SerializedPlayer";
import { SerializedDealer } from "./SerializedDealer";
import { SerializedTurmoil } from "./turmoil/SerializedTurmoil";
import { GameOptions } from "./Game";
import { IAresData } from "./ares/IAresData";

export interface SerializedGame {
    id: string;

    lastSaveId: number;
    seed: number
    deferredActions: Array<DeferredAction>;
    gameLog: Array<String>;
    gameAge: number;
    
    generation: number;
    phase: Phase;
    dealer: SerializedDealer;
    boardName: BoardName;
    board: Board;
    gameOptions: GameOptions;
    
    oxygenLevel: number;
    temperature: number;
    venusScaleLevel: number;

    first: SerializedPlayer;
    activePlayer: SerializedPlayer;
    players: Array<SerializedPlayer>;
    donePlayers: Set<SerializedPlayer>;
    passedPlayers: Set<SerializedPlayer>;
    researchedPlayers: Set<SerializedPlayer>;
    draftedPlayers: Set<SerializedPlayer>;

    exitedPlayers: Array<SerializedPlayer> ;
    draftVariant: boolean;
    draftRound: number;
    unDraftedCards: Map<SerializedPlayer, Array<IProjectCard>>;

    claimedMilestones: Array<ClaimedMilestone>;
    milestones: Array<IMilestone>;
    fundedAwards: Array<FundedAward>;
    awards: Array<IAward>;

    venusNextExtension: boolean;
    coloniesExtension: boolean;
    colonies: Array<SerializedColony>;
    colonyDealer: ColonyDealer | undefined;
    preludeExtension: boolean;
    turmoil: SerializedTurmoil;
    aresData: IAresData;

    monsInsuranceOwner: SerializedPlayer | undefined;
    someoneHasRemovedOtherPlayersPlants: boolean;

    showOtherPlayersVP: boolean;
    customCorporationsList: boolean;
    corporationList: Array<CardName>;
}

