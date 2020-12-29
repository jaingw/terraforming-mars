import {IParty} from './parties/IParty';
import {GlobalEventDealer} from './globalEvents/GlobalEventDealer';
import {IGlobalEvent} from './globalEvents/IGlobalEvent';
import {SerializedPlayer} from '../SerializedPlayer';
import {PartyName} from './parties/PartyName';
import {SerializedGlobalEventDealer} from './globalEvents/SerializedGlobalEventDealer';
import {NeutralPlayer} from './Turmoil';

export interface SerializedParty {
    name: PartyName;
    delegates: Array<string | NeutralPlayer>;
    partyLeader: undefined | string | NeutralPlayer;
}

// TODO(kberg): By 2021-01-15, remove delegeate_reserve, commingGlobalEvent, and uses
// of IParty, GlobalEventDealer, and IGlobalEvent.
export interface SerializedTurmoil {
    chairman: undefined | SerializedPlayer | NeutralPlayer;
    rulingParty: IParty ;
    dominantParty: IParty ;
    lobby: Array<string>;
    delegate_reserve?: Array<SerializedPlayer | NeutralPlayer>; // eslint-disable-line camelcase
    delegateReserve: Array<SerializedPlayer | NeutralPlayer>;
    parties: Array<IParty >;
    playersInfluenceBonus: Array<[string, number]>;
    globalEventDealer: GlobalEventDealer | SerializedGlobalEventDealer;
    distantGlobalEvent: IGlobalEvent | undefined;
    comingGlobalEvent: IGlobalEvent | undefined;
    currentGlobalEvent?: IGlobalEvent ;
}
