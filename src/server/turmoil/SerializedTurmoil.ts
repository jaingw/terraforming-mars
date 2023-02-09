import {SerializedPlayerId} from '../SerializedPlayer';
import {PartyName} from '../../common/turmoil/PartyName';
import {SerializedGlobalEventDealer} from './globalEvents/SerializedGlobalEventDealer';
import {SerializedPoliticalAgendasData} from './PoliticalAgendas';
import {NeutralPlayer} from './Turmoil';
import {IGlobalEvent} from './globalEvents/IGlobalEvent';
import {PlayerId} from '../../common/Types';
import {GlobalEventName} from '../../common/turmoil/globalEvents/GlobalEventName';

export type SerializedParty = {
    name: PartyName;
    delegates: Array<SerializedPlayerId | NeutralPlayer | PlayerId>;
    partyLeader: undefined | SerializedPlayerId | NeutralPlayer | PlayerId;
    // bonuses: Array<Bonus>;
    // policies: Array<Policy>;
}

export type SerializedTurmoil = {
    chairman: undefined | SerializedPlayerId | NeutralPlayer | PlayerId;
    rulingParty: SerializedParty | PartyName ;
    dominantParty: SerializedParty | PartyName;
    lobby?: Array<PlayerId>;
    delegate_reserve?: Array<SerializedPlayerId | NeutralPlayer>; // eslint-disable-line camelcase
    usedFreeDelegateAction?: Array<PlayerId>;
    delegateReserve: Array<SerializedPlayerId | NeutralPlayer |PlayerId>;
    parties: Array<SerializedParty >;
    playersInfluenceBonus: Array<[string, number]>;
    globalEventDealer: SerializedGlobalEventDealer;
    distantGlobalEvent: IGlobalEvent | undefined |GlobalEventName;
    comingGlobalEvent: IGlobalEvent | undefined |GlobalEventName;
    currentGlobalEvent?: IGlobalEvent |GlobalEventName;
    politicalAgendasData: SerializedPoliticalAgendasData ;
}
