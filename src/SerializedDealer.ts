import {CorporationCard} from './cards/corporation/CorporationCard';
import {IProjectCard} from './cards/IProjectCard';

export interface SerializedDealer {
    corporationCards: Array<CorporationCard >;
    deck: Array<IProjectCard >;
    discarded: Array<IProjectCard >;
    preludeDeck: Array<IProjectCard >;
}
