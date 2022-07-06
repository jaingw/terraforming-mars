import {CardName} from './common/cards/CardName';
import {Color} from './common/Color';
import {SerializedCard} from './SerializedCard';
import {SerializedTimer} from './common/SerializedTimer';

export interface SerializedPlayerId {
    id: string;
}
export interface SerializedGameId {
    id: string;
}
export interface SerializedPlayer {
    actionsTakenThisGame: number;
    actionsTakenThisRound: number;
    actionsThisGeneration: Array<CardName>;
    beginner: boolean;
    canUseHeatAsMegaCredits: boolean;
    cardCost: number;
    cardDiscount: number;
    cardsInHand: Array<SerializedCard>;
    colonyTradeDiscount: number;
    colonyTradeOffset: number;
    colonyVictoryPoints: number;
    color: Color;
    // corporationCard:ICorporationCard | undefined;
    corpCard: SerializedCard | undefined;
    corpCard2: SerializedCard | undefined;
    // corporationInitialActionDone: boolean;
    corpInitialActionDone: boolean,
    corp2InitialActionDone: boolean,
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
    id: string;
    lastCardPlayed?: CardName;
    megaCreditProduction: number;
    megaCredits: number;
    name: string;
    oceanBonus: number;
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
