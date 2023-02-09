import {_PhoboLog_} from './corporation/_PhoboLog_';
import {_Thorgate_} from './corporation/_Thorgate_';
import {_Inventrix_} from './corporation/_Inventrix_';
import {_Helion_} from './corporation/_Helion_';
import {_Teractor_} from './corporation/_Teractor_';
import {_EcoLine_} from './corporation/_EcoLine_';
import {_Aphrodite_} from './corporation/_Aphrodite_';
import {_Factorum_} from './corporation/_Factorum_';
import {_MiningGuild_} from './corporation/_MiningGuild_';
import {_Recyclon_} from './corporation/_Recyclon_';
import {_RobinsonIndustries_} from './corporation/_RobinsonIndustries_';
import {_Splice_} from './corporation/_Splice_';
import {_TerralabsResearch_} from './corporation/_TerralabsResearch_';
import {_UnitedNationsMarsInitiative_} from './corporation/_UnitedNationsMarsInitiative_';
import {_ValleyTrust_} from './corporation/_ValleyTrust_';
import {_Viron_} from './corporation/_Viron_';
import {_Celestic_} from './corporation/_Celestic_';
import {_Arklight_} from './corporation/_Arklight_';
import {_StormCraftIncorporated_} from './corporation/_StormCraftIncorporated_';
import {_Polyphemos_} from './corporation/_Polyhemos_';
import {_ArcadianCommunities_} from './corporation/_ArcadianCommunities_';
import {_TharsisRepublic_} from './corporation/_TharsisRepublic_';
import {_MorningStarInc_} from './corporation/_MorningStarInc_';
import {_InterplanetaryCinematics_} from './corporation/_InterplanetaryCinematics_';
import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {_Pristar_} from './corporation/_Pristar_';

export const BREAKTHROUGH_CARD_MANIFEST = new ModuleManifest({
  module: 'breakthrough',
  projectCards: {},
  corporationCards: {
    [CardName._APHRODITE_]: {Factory: _Aphrodite_, cardName_ori: CardName.APHRODITE, compatibility: 'venus'},
    [CardName._ARCADIAN_COMMUNITIES_]: {Factory: _ArcadianCommunities_, cardName_ori: CardName.ARCADIAN_COMMUNITIES},
    [CardName._ARKLIGHT_]: {Factory: _Arklight_, cardName_ori: CardName.ARKLIGHT}, // compatibility: 'colonies'},
    [CardName._CELESTIC_]: {Factory: _Celestic_, compatibility: 'venus', cardName_ori: CardName.CELESTIC},
    [CardName._ECOLINE_]: {Factory: _EcoLine_, cardName_ori: CardName.ECOLINE},
    [CardName._FACTORUM_]: {Factory: _Factorum_, cardName_ori: CardName.FACTORUM},
    [CardName._HELION_]: {Factory: _Helion_, cardName_ori: CardName.HELION},
    [CardName._INTERPLANETARY_CINEMATICS_]: {Factory: _InterplanetaryCinematics_, cardName_ori: CardName.INTERPLANETARY_CINEMATICS},
    [CardName._INVENTRIX_]: {Factory: _Inventrix_, cardName_ori: CardName.INVENTRIX},
    [CardName._MINING_GUILD_]: {Factory: _MiningGuild_, cardName_ori: CardName.MINING_GUILD},
    [CardName._MORNING_STAR_INC_]: {Factory: _MorningStarInc_, cardName_ori: CardName.MORNING_STAR_INC},
    [CardName._PHOBOLOG_]: {Factory: _PhoboLog_, cardName_ori: CardName.PHOBOLOG},
    [CardName._POLYPHEMOS_]: {Factory: _Polyphemos_, cardName_ori: CardName.POLYPHEMOS},
    [CardName._RECYCLON_]: {Factory: _Recyclon_, cardName_ori: CardName.RECYCLON},
    [CardName._ROBINSON_INDUSTRIES_]: {Factory: _RobinsonIndustries_, cardName_ori: CardName.ROBINSON_INDUSTRIES},
    [CardName._SPLICE_]: {Factory: _Splice_, cardName_ori: CardName.SPLICE},
    [CardName._STORMCRAFT_INCORPORATED_]: {Factory: _StormCraftIncorporated_, cardName_ori: CardName.STORMCRAFT_INCORPORATED, compatibility: 'venus'},
    [CardName._TERACTOR_]: {Factory: _Teractor_, cardName_ori: CardName.TERACTOR},
    [CardName._TERRALABS_RESEARCH_]: {Factory: _TerralabsResearch_, cardName_ori: CardName.TERRALABS_RESEARCH}, // compatibility: 'turmoil'},
    [CardName._THARSIS_REPUBLIC_]: {Factory: _TharsisRepublic_, cardName_ori: CardName.THARSIS_REPUBLIC},
    [CardName._THORGATE_]: {Factory: _Thorgate_, cardName_ori: CardName.THORGATE},
    [CardName._UNITED_NATIONS_MARS_INITIATIVE_]: {Factory: _UnitedNationsMarsInitiative_, cardName_ori: CardName.UNITED_NATIONS_MARS_INITIATIVE},
    [CardName._VALLEY_TRUST_]: {Factory: _ValleyTrust_, cardName_ori: CardName.VALLEY_TRUST},
    [CardName._VIRON_]: {Factory: _Viron_, cardName_ori: CardName.VIRON}, // compatibility: 'venus'},
    [CardName._PRISTAR_]: {Factory: _Pristar_, cardName_ori: CardName.PRISTAR},

  },
  cardsToRemove: [
  //   CardName.PHOBOLOG,
  //   CardName.INVENTRIX,
  //   CardName.THORGATE,
  //   CardName.HELION,
  //   CardName.TERACTOR,
  //   CardName.ECOLINE,
  //   CardName.APHRODITE,
  //   CardName.FACTORUM,
  //   CardName.MINING_GUILD,
  //   CardName.RECYCLON,
  //   CardName.ROBINSON_INDUSTRIES,
  //   CardName.SPLICE,
  //   CardName.TERRALABS_RESEARCH,
  //   CardName.UNITED_NATIONS_MARS_INITIATIVE,
  //   CardName.VALLEY_TRUST,
  //   CardName.VIRON,
  //   CardName.CELESTIC,
  //   CardName.ARKLIGHT,
  //   CardName.STORMCRAFT_INCORPORATED,
  //   CardName.POLYPHEMOS,
  //   CardName.ARCADIAN_COMMUNITIES,
  //   CardName.THARSIS_REPUBLIC,
  //   CardName.MORNING_STAR_INC,
  //   CardName.INTERPLANETARY_CINEMATICS,
  ],
});
