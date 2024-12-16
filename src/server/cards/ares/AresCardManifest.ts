import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {BioengineeringEnclosure} from './BioengineeringEnclosure';
import {BiofertilizerFacility} from './BiofertilizerFacility';
import {ButterflyEffect} from './ButterflyEffect';
import {CapitalAres} from './CapitalAres';
import {CommercialDistrictAres} from './CommercialDistrictAres';
import {DeimosDownAres} from './DeimosDownAres';
import {DesperateMeasures} from './DesperateMeasures';
import {EcologicalSurvey} from './EcologicalSurvey';
import {EcologicalZoneAres} from './EcologicalZoneAres';
import {Eglogue} from './Eglogue';
import {GeologicalSurvey} from './GeologicalSurvey';
import {GreatDamAres} from './GreatDamAres';
import {IndustrialCenterAres} from './IndustrialCenterAres';
import {LavaFlowsAres} from './LavaFlowsAres';
import {MagneticFieldGeneratorsAres} from './MagneticFieldGeneratorsAres';
import {MarketingExperts} from './MarketingExperts';
import {MetallicAsteroid} from './MetallicAsteroid';
import {MiningAreaAres} from './MiningAreaAres';
import {MiningRightsAres} from './MiningRightsAres';
import {MoholeAreaAres} from './MoholeAreaAres';
import {NaturalPreserveAres} from './NaturalPreserveAres';
import {NuclearZoneAres} from './NuclearZoneAres';
import {OceanCity} from './OceanCity';
import {OceanFarm} from './OceanFarm';
import {OceanSanctuary} from './OceanSanctuary';
import {RestrictedAreaAres} from './RestrictedAreaAres';
import {SolarFarm} from './SolarFarm';

export const ARES_CARD_MANIFEST = new ModuleManifest({
  module: 'ares',
  projectCards: {
    [CardName.BIOENGINEERING_ENCLOSURE]: {Factory: BioengineeringEnclosure}, // A01
    [CardName.BIOFERTILIZER_FACILITY]: {Factory: BiofertilizerFacility}, // A02
    [CardName.BUTTERFLY_EFFECT]: {Factory: ButterflyEffect}, // A03
    [CardName.DESPERATE_MEASURES]: {Factory: DesperateMeasures}, // A04
    [CardName.CAPITAL_ARES]: {Factory: CapitalAres}, // A05
    [CardName.COMMERCIAL_DISTRICT_ARES]: {Factory: CommercialDistrictAres}, // A06
    [CardName.ECOLOGICAL_SURVEY]: {Factory: EcologicalSurvey}, // A07
    [CardName.ECOLOGICAL_ZONE_ARES]: {Factory: EcologicalZoneAres}, // A08
    [CardName.GEOLOGICAL_SURVEY]: {Factory: GeologicalSurvey}, // A09
    [CardName.INDUSTRIAL_CENTER_ARES]: {Factory: IndustrialCenterAres}, // A10
    [CardName.LAVA_FLOWS_ARES]: {Factory: LavaFlowsAres}, // A11
    [CardName.MARKETING_EXPERTS]: {Factory: MarketingExperts}, // A12
    [CardName.METALLIC_ASTEROID]: {Factory: MetallicAsteroid}, // A13
    [CardName.MINING_AREA_ARES]: {Factory: MiningAreaAres}, // A14
    [CardName.MINING_RIGHTS_ARES]: {Factory: MiningRightsAres}, // A15
    [CardName.MOHOLE_AREA_ARES]: {Factory: MoholeAreaAres}, // A16
    [CardName.SOLAR_FARM]: {Factory: SolarFarm}, // A17
    [CardName.NATURAL_PRESERVE_ARES]: {Factory: NaturalPreserveAres}, // A18
    [CardName.NUCLEAR_ZONE_ARES]: {Factory: NuclearZoneAres}, // A19
    [CardName.OCEAN_CITY]: {Factory: OceanCity}, // A20
    [CardName.OCEAN_FARM]: {Factory: OceanFarm}, // A21
    [CardName.OCEAN_SANCTUARY]: {Factory: OceanSanctuary}, // A22
    [CardName.RESTRICTED_AREA_ARES]: {Factory: RestrictedAreaAres}, // A24
    [CardName.GREAT_DAM_ARES]: {Factory: GreatDamAres}, // A25
    [CardName.DEIMOS_DOWN_ARES]: {Factory: DeimosDownAres}, // A26
    [CardName.MAGNETIC_FIELD_GENERATORS_ARES]: {Factory: MagneticFieldGeneratorsAres}, // A27
  },
  corporationCards: {
    [CardName.EGLOGUE]: {Factory: Eglogue}, // A28
  },
  cardsToRemove: [
    CardName.CAPITAL,
    CardName.COMMERCIAL_DISTRICT,
    CardName.DEIMOS_DOWN,
    CardName.DEIMOS_DOWN_PROMO,
    CardName.ECOLOGICAL_ZONE,
    CardName.GREAT_DAM,
    CardName.GREAT_DAM_PROMO,
    CardName.INDUSTRIAL_CENTER,
    CardName.LAVA_FLOWS,
    CardName.MAGNETIC_FIELD_GENERATORS,
    CardName.MAGNETIC_FIELD_GENERATORS_PROMO,
    CardName.MINING_AREA,
    CardName.MINING_RIGHTS,
    CardName.MOHOLE_AREA,
    CardName.NATURAL_PRESERVE,
    CardName.NUCLEAR_ZONE,
    CardName.RESTRICTED_AREA,
  ],
});
