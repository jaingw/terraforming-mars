import {CardName} from '../common/cards/CardName';
import {Color} from '../common/Color';
import {SerializedCard} from './SerializedCard';
import {SerializedTimer} from '../common/SerializedTimer';
import {PlayerId} from '../common/Types';

export interface SerializedPlayerId {
    id: string;
}
export interface SerializedGameId {
    id: string;
}
interface DeprecatedFields {
    // corporationCard?: SerializedCard | undefined; // TODO(kberg): remove after 2022-09-01
    // corporationInitialActionDone?: boolean; // TODO(kberg): remove field after 2022-09-01
}
export interface SerializedPlayer extends DeprecatedFields{
    actionsTakenThisGame: number;
    actionsTakenThisRound: number;
    actionsThisGeneration: Array<CardName>;
    beginner: boolean;
    canUseHeatAsMegaCredits: boolean;
    canUseTitaniumAsMegacredits: boolean;
    cardCost: number;
    cardDiscount: number;
    cardsInHand: Array<SerializedCard>;
    colonyTradeDiscount: number;
    colonyTradeOffset: number;
    colonyVictoryPoints: number;
    color: Color;
    // corporationCard:ICorporationCard | undefined;
    corporations: Array<SerializedCard>;
    corpCard?: SerializedCard | undefined; // 已换成corporations
    corpCard2?: SerializedCard | undefined; // 已换成corporations
    corpInitialActionDone?: boolean, // 已换成pendingInitialActions
    corp2InitialActionDone?: boolean, // 已换成pendingInitialActions
    dealtCorporationCards: Array<SerializedCard>;
    dealtPreludeCards: Array<SerializedCard>;
    dealtProjectCards: Array<SerializedCard>;
    draftedCards: Array<SerializedCard>;
    energy: number;
    energyProduction: number;
    fleetSize: number;
    handicap: number;
    hasIncreasedTerraformRatingThisGeneration: boolean;
    hasTurmoilScienceTagBonus: boolean;
    heat: number;
    heatProduction: number;
    heatProductionStepsIncreasedThisGeneration: number;
    id: PlayerId;
    lastCardPlayed?: CardName;
    megaCreditProduction: number;
    megaCredits: number;
    name: string;
    oceanBonus: number;
    pendingInitialActions: Array<CardName> | undefined;
    pickedCorporationCard: SerializedCard | undefined;
    pickedCorporationCard2?: SerializedCard | undefined;
    plantProduction: number;
    plants: number;
    plantsNeededForGreenery: number;
    playedCards: Array<SerializedCard>;
    politicalAgendasActionUsedCount: number;
    preludeCardsInHand: Array<SerializedCard>;
    removedFromPlayCards: Array<SerializedCard>;
    removingPlayers: Array<string>;
    scienceTagCount: number;
    steel: number;
    steelProduction: number;
    steelValue: number;
    terraformRating: number;
    terraformRatingAtGenerationStart: number;
    timer: SerializedTimer;
    titanium: number;
    titaniumProduction: number;
    titaniumValue: number;
    totalDelegatesPlaced: number;
    // TODO(kberg): change tradesThisTurn to tradeThisGeneration later
    tradesThisGeneration: number;
    turmoilPolicyActionUsed: boolean;
    victoryPointsByGeneration: Array<number>;
    heatForTemperature: number;
    undoing : boolean ;
    exited : boolean ;// 是否体退
    canExit : boolean ;// 能否体退： 行动阶段、当前行动玩家、没有未执行的拦截器

    _game:SerializedGameId;
    userId?:string;
}
