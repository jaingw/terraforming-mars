/*
 * @Author: Ender-Wiggin
 * @Date: 2025-01-28 13:44:11
 * @LastEditors: Ender-Wiggin
 * @LastEditTime: 2025-01-29 18:02:00
 * @Description:
 */
import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {WeylandYutani} from './WeylandYutani';
import {ShinraTech} from './ShinraTech';
import {Tyrell} from './Tyrell';
import {MiningCorp} from './MiningCorp';
import {ScolexIndustries} from './ScolexIndustries';
import {Protogen} from './Protogen';
import {IntegratedMicroorganisms} from './IntegratedMicroorganisms';
import {BuyNLarge} from './BuyNLarge';
import {Rda} from './Rda';
import {ArkNova} from './ArkNova';
import {Thermopoli} from './Thermopoli';
import {EliteTech} from './EliteTech';
import {SolarPlant} from './SolarPlant';
import {PoliticalReform} from './PoliticalReform';
import {StarlinkDrifter} from './StarlinkDrifter';
import {Prowler} from './Prowler';
import {MirrorCoat} from './MirrorCoat';
import {GreenRing} from './GreenRing';
import {EnergySavingEcology} from './EnergySavingEcology';
import {GreenLeafDance} from './GreenLeafDance';
import {RaincatScientificProbe} from './RaincatScientificProbe';
import {StrategicRetrieval} from './StrategicRetrieval';
import {PlanetaryMeteorHarvesters} from './PlanetaryMeteorHarvesters';
import {UniqueItemBounty} from './UniqueItemBounty';
import {EarthCatCult} from './EarthCatCult';

export const COMMISSION_CARD_MANIFEST = new ModuleManifest({
  module: 'commission',
  corporationCards: {
    [CardName.WEYLAND_YUTANI]: {Factory: WeylandYutani}, // XB1
    [CardName.SHINRA_TECH]: {Factory: ShinraTech}, // XB2
    [CardName.TYRELL]: {Factory: Tyrell}, // XB3
    [CardName.MINING_CORP]: {Factory: MiningCorp}, // XB4
    [CardName.SCOLEX_INDUSTRIES]: {Factory: ScolexIndustries}, // XB5
    [CardName.PROTOGEN]: {Factory: Protogen}, // XB6
    [CardName.INTEGRATED_MICROORGANISMS]: {Factory: IntegratedMicroorganisms}, // XB7
    [CardName.BUY_N_LARGE]: {Factory: BuyNLarge}, // XB8
    [CardName.RDA]: {Factory: Rda}, // XB9
    [CardName.ARK_NOVA]: {Factory: ArkNova}, // XB10
    [CardName.THERMOPOLI]: {Factory: Thermopoli, compatibility: 'turmoil'}, // XB12
    [CardName.ELITETECH]: {Factory: EliteTech}, // XB13
    [CardName.SOLARPLANT]: {Factory: SolarPlant}, // XB14
    [CardName.POLITICALREFORM]: {Factory: PoliticalReform}, // XB15
    [CardName.STARLINKDRIFTER]: {Factory: StarlinkDrifter}, // XB16
    [CardName.PROWLER]: {Factory: Prowler}, // XB17
    [CardName.MIRRORCOAT]: {Factory: MirrorCoat}, // XB18
    [CardName.GREENRING]: {Factory: GreenRing}, // XB19
    [CardName.ENERGY_SAVING_ECOLOGY]: {Factory: EnergySavingEcology}, // XB20
    [CardName.GREEN_LEAF_DANCE]: {Factory: GreenLeafDance}, // XB21
    [CardName.RAINCAT_SCIENTIFIC_PROBE]: {Factory: RaincatScientificProbe}, // XB22
    [CardName.EARTHCATCULT]: {Factory: EarthCatCult, compatibility: 'ares'}, // A29
  },
  preludeCards: {
  },
  projectCards: {
    [CardName.STRATEGIC_RETRIEVAL]: {Factory: StrategicRetrieval}, // XB51
    [CardName.PLANETARY_METEOR_HARVESTERS]: {Factory: PlanetaryMeteorHarvesters}, // XB52
    [CardName.UNIQUE_ITEM_BOUNTY]: {Factory: UniqueItemBounty}, // XB53

  },
  globalEvents: {
  },
});
