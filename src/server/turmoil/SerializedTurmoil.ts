import {SerializedPlayerId} from '../SerializedPlayer';
import {PartyName} from '../../common/turmoil/PartyName';
import {SerializedGlobalEventDealer} from './globalEvents/SerializedGlobalEventDealer';
import {SerializedPoliticalAgendasData} from './PoliticalAgendas';
import {IGlobalEvent} from './globalEvents/IGlobalEvent';
import {PlayerId} from '../../common/Types';
import {GlobalEventName} from '../../common/turmoil/globalEvents/GlobalEventName';
import {Delegate} from './Turmoil';

export type SerializedParty = {
    name: PartyName;
    delegates: Array<SerializedPlayerId | SerializedDelegate>;
    partyLeader: undefined | SerializedPlayerId | SerializedDelegate;
}

export type SerializedDelegate = PlayerId | 'NEUTRAL';

export type SerializedTurmoil = {
    chairman: undefined | SerializedPlayerId | SerializedDelegate;
    rulingParty: SerializedParty | PartyName ;
    dominantParty: SerializedParty | PartyName;
    lobby?: Array<PlayerId>;
    delegate_reserve?: Array<SerializedPlayerId | Delegate>; // eslint-disable-line camelcase
    usedFreeDelegateAction: Array<PlayerId>;
    delegateReserve: Array<SerializedPlayerId | SerializedDelegate>;
    parties: Array<SerializedParty >;
    playersInfluenceBonus: Array<[string, number]>;
    globalEventDealer: SerializedGlobalEventDealer;
    distantGlobalEvent: IGlobalEvent | undefined |GlobalEventName;
    comingGlobalEvent: IGlobalEvent | undefined |GlobalEventName;
    currentGlobalEvent?: IGlobalEvent |GlobalEventName;
    politicalAgendasData: SerializedPoliticalAgendasData ;
}
