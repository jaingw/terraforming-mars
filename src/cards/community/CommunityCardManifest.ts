import {CardName} from '../../common/cards/CardName';
import {GameModule} from '../../common/cards/GameModule';
import {CardManifest} from '../CardManifest';
import {AgricolaInc} from './AgricolaInc';
import {Incite} from './Incite';
import {Playwrights} from './Playwrights';
import {ProjectWorkshop} from './ProjectWorkshop';
import {AerospaceMission} from './AerospaceMission';
import {TradeAdvance} from './TradeAdvance';
import {PoliticalUprising} from './PoliticalUprising';
import {ByElection} from './ByElection';
import {Midas} from './Midas';
import {ColonialOne} from './ColonialOne';
import {Hotsprings} from './Hotsprings';
import {JunkVentures} from './JunkVentures';
import {Aristarchus} from './Aristarchus';
import {LabourUnion} from './LabourUnion';
import {UnitedNationsMissionOne} from './UnitedNationsMissionOne';
import {AccumulatedKnowledge} from './AccumulatedKnowledge';
import {NitrateReducers} from './NitrateReducers';
// import {VitalColony} from './VitalColony';
import {CuriosityII} from './CuriosityII';
import {ExecutiveOrder} from './ExecutiveOrder';
import {ResearchGrant} from './ResearchGrant';
import {VenusFirst} from './VenusFirst';
import {ValuableGases} from './ValuableGases';
import {WeylandYutani} from './WeylandYutani';
import {ShinraTech} from './ShinraTech';
import {Tyrell} from './Tyrell';
import {MiningCorp} from './MiningCorp';
import {ScolexIndustries} from './ScolexIndustries';
import {Protogen} from './Protogen';
import {IntegratedMicroorganisms} from './IntegratedMicroorganisms';
import {BuyNLarge} from './BuyNLarge';
import {Rda} from './Rda';
import {CityGreenhouse} from './CityGreenhouse';

export const COMMUNITY_CARD_MANIFEST = new CardManifest({
  module: GameModule.Community,
  projectCards: [],
  corporationCards: [
    {cardName: CardName.AGRICOLA_INC, Factory: AgricolaInc},
    {cardName: CardName.PROJECT_WORKSHOP, Factory: ProjectWorkshop},
    {cardName: CardName.INCITE, Factory: Incite, compatibility: GameModule.Turmoil},
    {cardName: CardName.PLAYWRIGHTS, Factory: Playwrights},
    {cardName: CardName.CURIOSITY_II, Factory: CuriosityII},
    {cardName: CardName.MIDAS, Factory: Midas},
    {cardName: CardName.COLONIAL_ONE, Factory: ColonialOne, compatibility: GameModule.Colonies},
    {cardName: CardName.HOTSPRINGS, Factory: Hotsprings},
    {cardName: CardName.JUNK_VENTURES, Factory: JunkVentures},
    {cardName: CardName.ARISTARCHUS, Factory: Aristarchus},
    {cardName: CardName.LABOUR_UNION, Factory: LabourUnion},
    {cardName: CardName.UNITED_NATIONS_MISSION_ONE, Factory: UnitedNationsMissionOne},
    {cardName: CardName.WEYLAND_YUTANI, Factory: WeylandYutani},
    {cardName: CardName.SHINRA_TECH, Factory: ShinraTech},
    {cardName: CardName.TYRELL, Factory: Tyrell},
    {cardName: CardName.MINING_CORP, Factory: MiningCorp},
    {cardName: CardName.SCOLEX_INDUSTRIES, Factory: ScolexIndustries},
    {cardName: CardName.PROTOGEN, Factory: Protogen},
    {cardName: CardName.INTEGRATED_MICROORGANISMS, Factory: IntegratedMicroorganisms},
    {cardName: CardName.BUY_N_LARGE, Factory: BuyNLarge},
    {cardName: CardName.RDA, Factory: Rda},
    {cardName: CardName.CITY_GREENHOUSE, Factory: CityGreenhouse},


  ],
  preludeCards: [
    // 粉丝扩的部分前序跟pf扩重合 先注释
    {cardName: CardName.RESEARCH_GRANT, Factory: ResearchGrant},
    {
      cardName: CardName.VALUABLE_GASES,
      Factory: ValuableGases,
      compatibility: GameModule.Venus,
    },
    {
      cardName: CardName.VENUS_FIRST,
      Factory: VenusFirst,
      compatibility: GameModule.Venus,
    },
    // {
    //   cardName: CardName.VITAL_COLONY,
    //   Factory: VitalColony,
    //   compatibility: GameModule.Colonies,
    // },
    {
      cardName: CardName.AEROSPACE_MISSION,
      Factory: AerospaceMission,
      compatibility: GameModule.Colonies,
    },
    {
      cardName: CardName.TRADE_ADVANCE,
      Factory: TradeAdvance,
      compatibility: GameModule.Colonies,
    },
    {
      cardName: CardName.POLITICAL_UPRISING,
      Factory: PoliticalUprising,
      compatibility: GameModule.Turmoil,
    },
    {
      cardName: CardName.BY_ELECTION,
      Factory: ByElection,
      compatibility: GameModule.Turmoil,
    },
    {cardName: CardName.EXECUTIVE_ORDER, Factory: ExecutiveOrder, compatibility: GameModule.Turmoil},
    {
      cardName: CardName.ACCUMULATED_KNOWLEDGE,
      Factory: AccumulatedKnowledge,
    },
    {
      cardName: CardName.NITRATE_REDUCERS,
      Factory: NitrateReducers,
      compatibility: GameModule.Venus,
    },
  ],
});
