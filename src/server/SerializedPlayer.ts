import {CardName} from '../common/cards/CardName';
import {Color} from '../common/Color';
import {SerializedCard} from './SerializedCard';
import {SerializedTimer} from '../common/SerializedTimer';
import {PlayerId} from '../common/Types';
import {AlliedParty} from '../common/turmoil/Types';
import {GlobalParameter} from '../common/GlobalParameter';
import {DiscordId} from './server/auth/discord';
import {UnderworldPlayerData} from '../common/underworld/UnderworldPlayerData';
import {DeltaProjectPlayerModel} from '../common/models/DeltaProjectPlayerModel';

export interface SerializedPlayerId {
    id: PlayerId;
}
interface DeprecatedFields {
    tradesThisTurn?: number; // TODO(kberg): Remove tradesThisTurn after 2023-06-01
}

export interface SerializedPlayer extends DeprecatedFields{
  actionsTakenThisGame: number;
  actionsTakenThisRound: number;
  actionsThisGeneration: Array<CardName>;
  alliedParty: AlliedParty | undefined;
  autoPass: boolean;
  beginner: boolean;
  canUseHeatAsMegaCredits: boolean;
  canUseTitaniumAsMegacredits: boolean;
  canUsePlantsAsMegacredits: boolean;
  cardCost: number;
  cardDiscount: number;
  cardsInHand: Array<SerializedCard | CardName>;
  ceoCardsInHand: Array<CardName>;
  colonyTradeDiscount: number;
  colonyTradeOffset: number;
  colonyVictoryPoints: number;
  color: Color;
  corporations?: Array<SerializedCard>;
  dealtCorporationCards: Array<SerializedCard | CardName>;
  dealtCeoCards: Array<CardName>;
  dealtPreludeCards: Array<SerializedCard | CardName>;
  dealtProjectCards: Array<SerializedCard | CardName>;
  deltaProject?: DeltaProjectPlayerModel;
  draftedCards: Array<SerializedCard | CardName>;
  draftHand: Array<CardName>,
  energy: number;
  energyProduction: number;
  fleetSize: number;
  globalParameterSteps: Record<GlobalParameter, number>;
  handicap: number;
  hasIncreasedTerraformRatingThisGeneration: boolean;
  hasTurmoilScienceTagBonus: boolean;
  heat: number;
  heatProduction: number;
  heatProductionStepsIncreasedThisGeneration: number;
  id: PlayerId;
  jovianTagCount: number;
  lastCardPlayed?: CardName;
  megaCreditProduction: number;
  megaCredits: number;
  name: string;
  oceanBonus: number;
  pendingInitialActions: Array<CardName> | undefined;
  pickedCorporationCard: CardName | SerializedCard | undefined;
  pickedCorporationCard2?: CardName | SerializedCard | undefined;
  plantProduction: number;
  plants: number;
  plantsNeededForGreenery: number;
  plantTagCount: number;
  playedCards: Array<SerializedCard>;
  politicalAgendasActionUsedCount: number;
  preludeCardsInHand: Array<SerializedCard>;
  preservationProgram: boolean;
  removedFromPlayCards: Array<SerializedCard>;
  removingPlayers: Array<string>;
  scienceTagCount: number;
  standardProjectsThisGeneration: Array<CardName>;
  steel: number;
  steelProduction: number;
  steelValue: number;
  terraformRating: number;
  timer: SerializedTimer;
  titanium: number;
  titaniumProduction: number;
  titaniumValue: number;
  totalDelegatesPlaced: number;
  tradesThisGeneration: number;
  turmoilPolicyActionUsed: boolean;
  underworldData: UnderworldPlayerData;
  victoryPointsByGeneration: Array<number>;
  heatForTemperature: number;
  undoing : boolean ;
  exited : boolean ;// 是否体退
  canExit : boolean ;// 能否体退： 行动阶段、当前行动玩家、没有未执行的拦截器
  userId?:string;
  user?: DiscordId;
  warmongerCards: number;
  withinDeflectionZone: boolean;
}
