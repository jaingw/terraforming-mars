import { PartyName } from "./PartyName";
import { Player } from "../../Player";
import { Game } from "../../Game";
import { MarsFirst } from "./MarsFirst";
import { Scientists } from "./Scientists";
import { Unity } from "./Unity";
import { Kelvinists } from "./Kelvinists";
import { Reds } from "./Reds";
import { Greens } from "./Greens";

export interface IParty {
    name: PartyName;
    description: string;
    delegates: Array<Player | "NEUTRAL">;
    partyLeader: undefined | Player | "NEUTRAL";
    sendDelegate: (player: Player | "NEUTRAL", game: Game) => void;
    removeDelegate: (player: Player | "NEUTRAL", game: Game) => void;
    rulingBonus: (game: Game) => void;
    //rulingPolicy: (player: Player, game: Game) => void;
    getPresentPlayers(): Array<Player | "NEUTRAL">;
    getDelegates:(player: Player | "NEUTRAL") => number;
}

interface IPartyFactory<T> {
    partyName: PartyName;
    factory: new () => T
}

export const ALL_PARTIES: Array<IPartyFactory<IParty>> = [
    { partyName: PartyName.MARS, factory: MarsFirst },
    { partyName: PartyName.SCIENTISTS, factory: Scientists },
    { partyName: PartyName.UNITY, factory: Unity },
    { partyName: PartyName.GREENS, factory: Greens },
    { partyName: PartyName.REDS, factory: Reds },
    { partyName: PartyName.KELVINISTS, factory: Kelvinists }
];