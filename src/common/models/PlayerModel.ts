import {CardModel} from './CardModel';
import {Color} from '../Color';
import {IVictoryPointsBreakdown} from '../game/IVictoryPointsBreakdown';
import {ITagCount} from '../cards/ITagCount';
import {PlayerInputModel} from './PlayerInputModel';
import {TimerModel} from './TimerModel';
import {GameModel} from './GameModel';
import {PlayerId, SpectatorId} from '../Types';
import {CardName} from '../cards/CardName';

export interface ViewModel {
  game: GameModel;
  players: Array<PublicPlayerModel>;
  id: PlayerId | SpectatorId;
  thisPlayer: PublicPlayerModel | undefined;
  block?: boolean;
}

/** The public information about a player */
export interface PublicPlayerModel {
  actionsTakenThisRound: number;
  actionsThisGeneration: Array<string /* CardName */>;
  actionsTakenThisGame: number;
  availableBlueCardActionCount: number;
  cardCost: number;
  cardDiscount: number;
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
  // TODO(kberg): this is removeable now.
  id: string; // color
  influence: number;
  isActive: boolean;
  lastCardPlayed?: CardName;
  megaCredits: number;
  megaCreditProduction: number;
  name: string;
  noTagsCount: number;
  plants: number;
  plantProduction: number;
  plantsAreProtected: boolean;
  playedCards: Array<CardModel>;
  selfReplicatingRobotsCards: Array<CardModel>;
  steel: number;
  steelProduction: number;
  steelValue: number;
  tags: Array<ITagCount>;
  terraformRating: number;
  timer: TimerModel;
  titanium: number;
  titaniumProduction: number;
  titaniumValue: number;
  tradesThisGeneration: number;
  victoryPointsBreakdown: IVictoryPointsBreakdown;
  victoryPointsByGeneration: Array<number>
  exited?: boolean;
  waitingFor: {} | undefined;
}

/** A player's view of the game, including their secret information. */
export interface PlayerViewModel extends ViewModel {
  cardsInHand: Array<CardModel>;
  dealtCorporationCards: Array<CardModel>;
  dealtPreludeCards: Array<CardModel>;
  dealtProjectCards: Array<CardModel>;
  draftedCards: Array<CardModel>;
  id: PlayerId;
  pickedCorporationCard: Array<CardModel>; // Why Array?
  pickedCorporationCard2: Array<CardModel>; // Why Array?
  preludeCardsInHand: Array<CardModel>;
  gameId: string;
  undoing :boolean;
  canExit?: boolean;
  userName: string;
  isme: boolean;
  showhandcards: boolean;
  isvip:number ;
  waitingFor: PlayerInputModel | undefined;
  exited?: boolean;
  block: boolean;
  thisPlayer: PublicPlayerModel;
}

export interface PlayerBlockModel {
    block: boolean;
    isme: boolean;
    showhandcards: boolean;
}
