import {SerializedCard} from './SerializedCard';

export type SerializedDealer = {
    corporationCards: Array<SerializedCard >;
    deck: Array<SerializedCard >;
    discarded: Array<SerializedCard >;
    preludeDeck: Array<SerializedCard >;
}
