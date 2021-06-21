import {CardName} from '../../CardName';
import {GameModule} from '../../GameModule';
import {CardManifest} from '../CardManifest';
import {IdoFront} from './corp/IdoFront';
import {SisterPlanetSponsors} from './SisterPlanetSponsors';
import {SolarCosmicRays} from './SolarCosmicRays';
import {UrgentTerraformingCommand} from './UrgentTerraformingCommand';
import {InterplanetaryAlliance} from './InterplanetaryAlliance';
// import { CosmosLibrary } from "./CosmosLibrary";
// import { EarthCivilCourt } from "./EarthCivilCourt";
// import { MolecularDetachmentDevice } from "./MolecularDetachmentDevice";
// import { NanoBots } from "./Nanobot";
// import { UnmannedAerialVehicle } from "./UnmannedAerialVehicle";
// import { CuttingEdgeLab } from "./CuttingEdgeLab";
import {WasteIncinerator} from './WasteIncinerator';
import {RespirationEnhance} from './RespirationEnhance';
import {HydrothermalVentArchaea} from './HydrothermalVentArchaea';
import {ElectricSheep} from './ElectricSheep';
import {Ansible} from './Ansible';
import {MarsHotSpring} from './MarsHotSpring';
import {CloneTechnology} from './CloneTechnology';
import {LargeEcologicalReserve} from './LargeEcologicalReserve';
import {EnergySupply} from './EnergySupply';
import {Chaos} from './corp/Chaos';
import {Cow} from './Cow';
// import {StarcorePlunder} from './StarcorePlunder';
import {JovianExpedition} from './JovianExpedition';
// import {WGParternship} from './corp/WGParternship';
import {CommunityWorker} from './CommunityWorker';
import {InciteEnder} from './corp/InciteEnder';
import {TradeNavigator} from './corp/TradeNavigator';
import {BrotherhoodOfMutants} from './corp/BrotherhoodOfMutants';
import {StarCoreMining} from './StarCoreMining';
import {EMDrive} from './EMDrive';
import {FallOfSunrise} from './FallOfSunrise';


export const EROS_CARD_MANIFEST = new CardManifest({
  module: GameModule.Eros,
  projectCards: [
    // { cardName: CardName.COSMOS_LIBRARY, Factory: CosmosLibrary },
    // { cardName: CardName.EARTH_CIVIL_COURT, Factory: EarthCivilCourt },
    // { cardName: CardName.NANO_BOTS, Factory: NanoBots },
    // { cardName: CardName.MOLECULAR_DETATACHMENT_DEVICE, Factory: MolecularDetachmentDevice },
    // { cardName: CardName.CUTTING_EDGE_LAB, Factory: CuttingEdgeLab },
    {cardName: CardName.SOLAR_COSMIC_RAYS, Factory: SolarCosmicRays}, // Q01
    {cardName: CardName.LARGE_ECOLOGICAL_RESERVE, Factory: LargeEcologicalReserve}, // Q02
    {cardName: CardName.INTERPLANETARY_ALLIANCE, Factory: InterplanetaryAlliance, compatibility: GameModule.Venus}, // Q03
    {cardName: CardName.CLONE_TECHNOLOGY, Factory: CloneTechnology}, // Q04
    {cardName: CardName.SISTER_PLANET_SPONSORS, Factory: SisterPlanetSponsors, compatibility: GameModule.Venus}, // Q05
    {cardName: CardName.MARS_HOT_SPRING, Factory: MarsHotSpring}, // Q06
    {cardName: CardName.STARCORE_MINING, Factory: StarCoreMining}, // Q07
    {cardName: CardName.JOVIAN_EXPEDITION, Factory: JovianExpedition, compatibility: GameModule.Colonies}, // Q08
    {cardName: CardName.RESPIRATION_ENHANCE, Factory: RespirationEnhance}, // Q10
    {cardName: CardName.WASTE_INCINERATOR, Factory: WasteIncinerator}, // Q11
    {cardName: CardName.HYDROTHERMAL_VENT_ARCHAEA, Factory: HydrothermalVentArchaea}, // Q12
    {cardName: CardName.ELECTRIC_SHEEP, Factory: ElectricSheep}, // Q13
    {cardName: CardName.ANSIBLE, Factory: Ansible}, // Q14
    {cardName: CardName.COW, Factory: Cow}, // Q15
    {cardName: CardName.URGENT_TERRAFORMING_COMMAND, Factory: UrgentTerraformingCommand}, // Q16
    {cardName: CardName.FALL_OF_SUNRISE, Factory: FallOfSunrise}, // Q17
    {cardName: CardName.ENERGY_SUPPLY, Factory: EnergySupply}, // Q18
    // {cardName: CardName.STARCORE_PLUNDER, Factory: StarcorePlunder},
    {cardName: CardName.EM_DRIVE, Factory: EMDrive, compatibility: [GameModule.Colonies, GameModule.Turmoil]}, // Q19
    {cardName: CardName.COMMUNITY_WORKER, Factory: CommunityWorker}, // Q20

  ],
  corporationCards: [
    {cardName: CardName.CHAOS, Factory: Chaos}, // Q21
    // {cardName: CardName.WG_PARTERNSHIP, Factory: WGParternship}, // Q22
    {cardName: CardName.IDO_FRONT, Factory: IdoFront}, // Q23
    {cardName: CardName.INCITE_ENDER, Factory: InciteEnder, compatibility: GameModule.Turmoil}, // Q24
    {cardName: CardName.TRADE_NAVIGATOR, Factory: TradeNavigator, compatibility: GameModule.Colonies}, // Q25
    {cardName: CardName.BROTHERHOOD_OF_MUTANTS, Factory: BrotherhoodOfMutants, compatibility: GameModule.Turmoil}, // Q26
  ],
  preludeCards: [
  ],

});
