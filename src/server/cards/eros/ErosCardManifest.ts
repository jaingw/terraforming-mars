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
import {Prism} from '../../cards/eros/corp/Prism';
import {HayMaker} from '../../cards/eros/HayMaker';
import {MartianFencing} from '../../cards/eros/MartianFencing';
import {MillenniumFalcon} from '../../cards/eros/corp/MillenniumFalcon';
import {ImperialStarDestroyer} from '../../cards/eros/corp/ImperialStarDestroyer';
// import {SithOrganizations} from '../../cards/eros/corp/SithOrganizations';
import {RunciterAssociates} from '../../cards/eros/corp/RunciterAssociates';
import {JovianDefenseDepartment} from '../../cards/eros/JovianDefenseDepartment';
import {Trantor} from '../../cards/eros/Trantor';
import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {SpaceMonsterPark} from './SpaceMonsterPark';
import {EnergyStation} from './EnergyStation';
import { LunaChain } from './corp/LunaChain';


export const EROS_CARD_MANIFEST = new ModuleManifest({
  module: 'eros',
  projectCards: {
    // { cardName: CardName.COSMOS_LIBRARY] : {Factory: CosmosLibrary },
    // { cardName: CardName.EARTH_CIVIL_COURT] : {Factory: EarthCivilCourt },
    // { cardName: CardName.NANO_BOTS] : {Factory: NanoBots },
    // { cardName: CardName.MOLECULAR_DETATACHMENT_DEVICE] : {Factory: MolecularDetachmentDevice },
    // { cardName: CardName.CUTTING_EDGE_LAB] : {Factory: CuttingEdgeLab },
    [CardName.SOLAR_COSMIC_RAYS]: {Factory: SolarCosmicRays}, // Q01
    [CardName.LARGE_ECOLOGICAL_RESERVE]: {Factory: LargeEcologicalReserve}, // Q02
    [CardName.INTERPLANETARY_ALLIANCE]: {Factory: InterplanetaryAlliance, compatibility: 'venus'}, // Q03
    [CardName.CLONE_TECHNOLOGY]: {Factory: CloneTechnology}, // Q04
    [CardName.SISTER_PLANET_SPONSORS]: {Factory: SisterPlanetSponsors, compatibility: 'venus'}, // Q05
    [CardName.MARS_HOT_SPRING]: {Factory: MarsHotSpring}, // Q06
    [CardName.STARCORE_MINING]: {Factory: StarCoreMining}, // Q07
    [CardName.JOVIAN_EXPEDITION]: {Factory: JovianExpedition, compatibility: 'colonies'}, // Q08
    [CardName.RESPIRATION_ENHANCE]: {Factory: RespirationEnhance}, // Q10
    [CardName.WASTE_INCINERATOR]: {Factory: WasteIncinerator}, // Q11
    [CardName.HYDROTHERMAL_VENT_ARCHAEA]: {Factory: HydrothermalVentArchaea}, // Q12
    [CardName.ELECTRIC_SHEEP]: {Factory: ElectricSheep}, // Q13
    [CardName.ANSIBLE]: {Factory: Ansible}, // Q14
    [CardName.COW]: {Factory: Cow}, // Q15
    [CardName.URGENT_TERRAFORMING_COMMAND]: {Factory: UrgentTerraformingCommand}, // Q16
    [CardName.FALL_OF_SUNRISE]: {Factory: FallOfSunrise}, // Q17
    [CardName.ENERGY_SUPPLY]: {Factory: EnergySupply}, // Q18
    // [CardName.STARCORE_PLUNDER] : {Factory: StarcorePlunder},
    [CardName.EM_DRIVE]: {Factory: EMDrive, compatibility: ['colonies', 'turmoil']}, // Q19
    [CardName.COMMUNITY_WORKER]: {Factory: CommunityWorker}, // Q20

    [CardName.VENUS_UNIVERSITY]: {Factory: VenusUniversity, compatibility: ['venus']}, // Q50
    [CardName.FLEET_RECYCLING]: {Factory: FleetRecycling, compatibility: ['colonies']}, // Q51
    // [ CardName.SQUID_GAME]:{Factory: SquidGame},
    [CardName.PLANT_SMUGGLING]: {Factory: PlantSmuggling, compatibility: ['colonies']}, // Q52
    [CardName.ANTI_GRAVITY_EXPERIMENT]: {Factory: AntiGravityExperiment}, // Q53
    [CardName.BORDER_CHECKPOINT]: {Factory: BorderCheckpoint}, // Q54
    [CardName.HAY_MAKER]: {Factory: HayMaker}, // Q55
    [CardName.MARTIAN_FENCING]: {Factory: MartianFencing}, // Q56
    [CardName.JOVIAN_DEFENSE_DEPARTMENT]: {Factory: JovianDefenseDepartment}, // Q57
    [CardName.TRANTOR]: {Factory: Trantor}, // Q58
    [CardName.SPACE_MONSTER_PARK]: {Factory: SpaceMonsterPark}, // Q59,
    [CardName.ENERGY_STATION]: {Factory: EnergyStation}, // Q60,

  },
  corporationCards: {
    [CardName.CHAOS]: {Factory: Chaos}, // Q21
    // [CardName.WG_PARTERNSHIP] : {Factory: WGParternship}, // Q22
    [CardName.IDO_FRONT]: {Factory: IdoFront}, // Q23
    [CardName.INCITE_ENDER]: {Factory: InciteEnder, compatibility: 'turmoil'}, // Q24
    [CardName.TRADE_NAVIGATOR]: {Factory: TradeNavigator, compatibility: 'colonies'}, // Q25
    [CardName.BROTHERHOOD_OF_MUTANTS]: {Factory: BrotherhoodOfMutants, compatibility: 'turmoil'}, // Q26
    [CardName.VOID]: {Factory: Void}, // Q27

    [CardName.TEIAI_GROUP]: {Factory: TeiaiGroup}, // Q28
    [CardName.PRISM]: {Factory: Prism}, // Q29
    [CardName.MILLENNIUM_FALCON]: {Factory: MillenniumFalcon, compatibility: ['colonies']}, // Q30
    [CardName.IMPERIAL_STAR_DESTROYER]: {Factory: ImperialStarDestroyer, compatibility: ['colonies']}, // Q31
    // [ CardName.SITH_ORGANIZATIONS]:{Factory: SithOrganizations, compatibility: ['turmoil']}, // Q32 没什么人玩，评价也不咋样
    [CardName.RUNCITER_ASSOCIATES]: {Factory: RunciterAssociates}, // Q33
    [CardName.LUNA_CHAIN]: {Factory: LunaChain}, // Q34


  },
  preludeCards: {
  },

});
