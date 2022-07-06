
import {PlayerInputTypes} from '../input/PlayerInputTypes';
import {CardModel} from './CardModel';
import {ColonyModel} from './ColonyModel';
import {IPayProductionModel} from './IPayProductionUnitsModel';
import {IAresData} from '../ares/IAresData';
import {Message} from '../logs/Message';
import {PartyName} from '../turmoil/PartyName';
import {TurmoilModel} from './TurmoilModel';
import {StaticGlobalEventProperties} from '../../turmoil/globalEvents/IGlobalEvent';

export interface PlayerInputModel {
    id: string | undefined;
    amount: number | undefined;
    availableSpaces: Array<string> | undefined;
    canUseHeat: boolean | undefined;
    canUseSteel: boolean | undefined;
    canUseTitanium: boolean | undefined;
    canUseSeeds: boolean | undefined;
    canUseData: boolean | undefined;
    cards: Array<CardModel> | undefined;
    inputType: PlayerInputTypes;
    options: Array<PlayerInputModel> | undefined;
    min: number | undefined;
    max: number | undefined;
    maxByDefault?: boolean;
    maxCardsToSelect: number | undefined;
    microbes: number | undefined;
    floaters: number | undefined;
    science: number | undefined;
    seeds: number | undefined;
    data: number | undefined;
    minCardsToSelect: number | undefined;
    players: Array<string> | undefined;
    title: string | Message;
    buttonLabel: string;
    coloniesModel : Array<ColonyModel> | undefined;
    payProduction?: IPayProductionModel;
    aresData?: IAresData;
    selectBlueCardAction: boolean;
    showOnlyInLearnerMode?: boolean;
    showOwner?: boolean;
    availableParties: Array<PartyName> | undefined;
    turmoil?: TurmoilModel;
    globalEventCards?:Array<StaticGlobalEventProperties>;
}
