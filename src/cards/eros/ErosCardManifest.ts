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
import {Void} from './corp/Void';
import {TeiaiGroup} from './corp/TeiaiGroup';
import {VenusUniversity} from './VenusUniversity';
import {FleetRecycling} from './FleetRecycling';
// import {SquidGame} from './SquidGame';
import {PlantSmuggling} from './PlantSmuggling';
import {AntiGravityExperiment} from './AntiGravityExperiment';
import {BorderCheckpoint} from './BorderCheckpoint';
import {CardName} from '../../common/cards/CardName';
// import {GameModule} from '../../common/cards/GameModule';
import {Prism} from '../../cards/eros/corp/Prism';
import {HayMaker} from '../../cards/eros/HayMaker';
import {MartianFencing} from '../../cards/eros/MartianFencing';
import {MillenniumFalcon} from '../../cards/eros/corp/MillenniumFalcon';
import {ImperialStarDestroyer} from '../../cards/eros/corp/ImperialStarDestroyer';
import {SithOrganizations} from '../../cards/eros/corp/SithOrganizations';
import {RunciterAssociates} from '../../cards/eros/corp/RunciterAssociates';
import {JovianDefenseDepartment} from '../../cards/eros/JovianDefenseDepartment';
import {Trantor} from '../../cards/eros/Trantor';


export const EROS_CARD_MANIFEST = new CardManifest({
  module: 'eros',
  projectCards: [
    // { cardName: CardName.COSMOS_LIBRARY, Factory: CosmosLibrary },
    // { cardName: CardName.EARTH_CIVIL_COURT, Factory: EarthCivilCourt },
    // { cardName: CardName.NANO_BOTS, Factory: NanoBots },
    // { cardName: CardName.MOLECULAR_DETATACHMENT_DEVICE, Factory: MolecularDetachmentDevice },
    // { cardName: CardName.CUTTING_EDGE_LAB, Factory: CuttingEdgeLab },
    {cardName: CardName.SOLAR_COSMIC_RAYS, Factory: SolarCosmicRays}, // Q01
    {cardName: CardName.LARGE_ECOLOGICAL_RESERVE, Factory: LargeEcologicalReserve}, // Q02
    {cardName: CardName.INTERPLANETARY_ALLIANCE, Factory: InterplanetaryAlliance, compatibility: 'venus'}, // Q03
    {cardName: CardName.CLONE_TECHNOLOGY, Factory: CloneTechnology}, // Q04
    {cardName: CardName.SISTER_PLANET_SPONSORS, Factory: SisterPlanetSponsors, compatibility: 'venus'}, // Q05
    {cardName: CardName.MARS_HOT_SPRING, Factory: MarsHotSpring}, // Q06
    {cardName: CardName.STARCORE_MINING, Factory: StarCoreMining}, // Q07
    {cardName: CardName.JOVIAN_EXPEDITION, Factory: JovianExpedition, compatibility: 'colonies'}, // Q08
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
    {cardName: CardName.EM_DRIVE, Factory: EMDrive, compatibility: ['colonies', 'turmoil']}, // Q19
    {cardName: CardName.COMMUNITY_WORKER, Factory: CommunityWorker}, // Q20
    {cardName: CardName.VENUS_UNIVERSITY, Factory: VenusUniversity, compatibility: ['venus']},
    {cardName: CardName.FLEET_RECYCLING, Factory: FleetRecycling, compatibility: ['colonies']},
    // {cardName: CardName.SQUID_GAME, Factory: SquidGame},
    {cardName: CardName.PLANT_SMUGGLING, Factory: PlantSmuggling, compatibility: ['colonies']},
    {cardName: CardName.ANTI_GRAVITY_EXPERIMENT, Factory: AntiGravityExperiment},
    {cardName: CardName.BORDER_CHECKPOINT, Factory: BorderCheckpoint},
    {cardName: CardName.HAY_MAKER, Factory: HayMaker},
    {cardName: CardName.MARTIAN_FENCING, Factory: MartianFencing},
    {cardName: CardName.JOVIAN_DEFENSE_DEPARTMENT, Factory: JovianDefenseDepartment},
    {cardName: CardName.TRANTOR, Factory: Trantor},


  ],
  corporationCards: [
    {cardName: CardName.CHAOS, Factory: Chaos}, // Q21
    // {cardName: CardName.WG_PARTERNSHIP, Factory: WGParternship}, // Q22
    {cardName: CardName.IDO_FRONT, Factory: IdoFront}, // Q23
    {cardName: CardName.INCITE_ENDER, Factory: InciteEnder, compatibility: 'turmoil'}, // Q24
    {cardName: CardName.TRADE_NAVIGATOR, Factory: TradeNavigator, compatibility: 'colonies'}, // Q25
    {cardName: CardName.BROTHERHOOD_OF_MUTANTS, Factory: BrotherhoodOfMutants, compatibility: 'turmoil'}, // Q26
    {cardName: CardName.VOID, Factory: Void}, // Q27
    {cardName: CardName.TEIAI_GROUP, Factory: TeiaiGroup},
    {cardName: CardName.PRISM, Factory: Prism},
    {cardName: CardName.MILLENNIUM_FALCON, Factory: MillenniumFalcon, compatibility: ['colonies']},
    {cardName: CardName.IMPERIAL_STAR_DESTROYER, Factory: ImperialStarDestroyer, compatibility: ['colonies']},
    {cardName: CardName.SITH_ORGANIZATIONS, Factory: SithOrganizations, compatibility: ['turmoil']},
    {cardName: CardName.RUNCITER_ASSOCIATES, Factory: RunciterAssociates},


  ],
  preludeCards: [
  ],

});
