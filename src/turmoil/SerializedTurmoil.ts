import {SerializedPlayer} from '../SerializedPlayer';
import {PartyName} from './parties/PartyName';
import {SerializedGlobalEventDealer} from './globalEvents/SerializedGlobalEventDealer';
import {SerializedPoliticalAgendasData} from './PoliticalAgendas';
import {NeutralPlayer} from './Turmoil';
import {IParty} from './parties/IParty';
import {GlobalEventDealer} from './globalEvents/GlobalEventDealer';
import {IGlobalEvent} from './globalEvents/IGlobalEvent';

export interface SerializedParty {
    name: PartyName;
    delegates: Array<string | NeutralPlayer>;
    partyLeader: undefined | string | NeutralPlayer;
}

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
    // TODO(kberg): By 2021-03-01, IGlobalEvent.
    currentGlobalEvent?: IGlobalEvent ;
    politicalAgendasData: SerializedPoliticalAgendasData ;
}
