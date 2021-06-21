import {CardModel} from './CardModel';
import {Color} from '../Color';
import {VictoryPointsBreakdown} from '../VictoryPointsBreakdown';
import {ITagCount} from '../ITagCount';
import {PlayerInputModel} from './PlayerInputModel';
import {SerializedTimer} from '../SerializedTimer';
import {GameModel} from './GameModel';

export interface PublicPlayerModel {
  actionsTakenThisRound: number;
  actionsThisGeneration: Array<string /* CardName */>;
  availableBlueCardActionCount: number;
  cardCost: number;
  cardsInHandNbr: number;
  citiesCount: number;
  coloniesCount: number;
  color: Color;
  corporationCard: CardModel | undefined;
  corporationCard2: CardModel | undefined;
  energy: number;
  energyProduction: number;
  fleetSize: number;
  heat: number;
  heatProduction: number;
  id: string; // PlayerId
  influence: number;
  isActive: boolean;
  megaCredits: number;
  megaCreditProduction: number;
  name: string;
  noTagsCount: number;
  plants: number;
  plantProduction: number;
  plantsAreProtected: boolean;
  playedCards: Array<CardModel>;
  preludeCardsInHand: Array<CardModel>;
  selfReplicatingRobotsCards: Array<CardModel>;
  steel: number;
  steelProduction: number;
  steelValue: number;
  tags: Array<ITagCount>;
  terraformRating: number;
  timer: SerializedTimer;
  titanium: number;
  titaniumProduction: number;
  titaniumValue: number;
  tradesThisGeneration: number;
  victoryPointsBreakdown: VictoryPointsBreakdown;

  exited?: boolean;
  waitingFor: PlayerInputModel | undefined;
}

export interface PlayerModel extends PublicPlayerModel {
  availableBlueCardActionCount: number;
  cardCost: number;
  cardsInHand: Array<CardModel>;
  dealtCorporationCards: Array<CardModel>;
  dealtPreludeCards: Array<CardModel>;
  dealtProjectCards: Array<CardModel>;
  draftedCards: Array<CardModel>;
  game: GameModel;
  influence: number;
  pickedCorporationCard: Array<CardModel>; // Why Array?
  pickedCorporationCard2: Array<CardModel>; // Why Array?
  players: Array<PublicPlayerModel>;
  preludeCardsInHand: Array<CardModel>;
  timer: SerializedTimer;
  gameId: string;
  undoing :boolean;
  canExit?: boolean;
  block: boolean;
  userName: string;
  isme: boolean;
  showhandcards: boolean;
  isvip:number ;
}

export interface PlayerBlockModel {
    block: boolean;
    isme: boolean;
    showhandcards: boolean;
}
