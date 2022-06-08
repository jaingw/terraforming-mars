import {SerializedPlayerId} from '../SerializedPlayer';
import {PartyName} from '../common/turmoil/PartyName';
import {SerializedGlobalEventDealer} from './globalEvents/SerializedGlobalEventDealer';
import {SerializedPoliticalAgendasData} from './PoliticalAgendas';
import {NeutralPlayer} from './Turmoil';
import {IGlobalEvent} from './globalEvents/IGlobalEvent';

export interface SerializedParty {
    name: PartyName;
    delegates: Array<SerializedPlayerId | NeutralPlayer>;
    partyLeader: undefined | SerializedPlayerId | NeutralPlayer;
    // bonuses: Array<Bonus>;
    // policies: Array<Policy>;
}

export interface SerializedTurmoil {
    chairman: undefined | SerializedPlayerId | NeutralPlayer;
    rulingParty: SerializedParty ;
    dominantParty: SerializedParty ;
    lobby: Array<string>;
    delegate_reserve?: Array<SerializedPlayerId | NeutralPlayer>; // eslint-disable-line camelcase
    delegateReserve: Array<SerializedPlayerId | NeutralPlayer>;
    parties: Array<SerializedParty >;
    playersInfluenceBonus: Array<[string, number]>;
    globalEventDealer: SerializedGlobalEventDealer;
    distantGlobalEvent: IGlobalEvent | undefined;
    comingGlobalEvent: IGlobalEvent | undefined;
    currentGlobalEvent: IGlobalEvent | undefined;
    politicalAgendasData: SerializedPoliticalAgendasData ;
}
