import {SerializedCard} from './SerializedCard';

export interface SerializedDealer {
    corporationCards: Array<SerializedCard >;
    deck: Array<SerializedCard >;
    discarded: Array<SerializedCard >;
    preludeDeck: Array<SerializedCard >;
}
