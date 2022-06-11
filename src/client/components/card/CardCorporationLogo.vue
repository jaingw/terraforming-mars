<template>
  <div class="card-corporation-logo">
    <template v-if="title === CardName.APHRODITE || title === CardName._APHRODITE_">
      <div class="card-aphrodite-logo">APHRODITE</div>
    </template>
    <template v-else-if="title === CardName.ARKLIGHT || title === CardName._ARKLIGHT_">
      <div class="card-arklight-logo">ARKLIGHT</div>
    </template>
    <template v-else-if="title === CardName.POSEIDON">
      <div class="card-poseidon-logo">POSEIDON</div>
    </template>
    <template v-else-if="title === CardName.SATURN_SYSTEMS">
      <div class="card-saturn-logo">
        SATURN <span style="font-size:20px;display:inline-block;">&#x25CF;</span> SYSTEMS
      </div>
    </template>
    <template v-else-if="title === CardName.CELESTIC || title === CardName._CELESTIC_">
      <div class="card-celestic-logo">
        <span style="background: linear-gradient(to right, rgb(251,192,137),rgb(251,192,137),rgb(23,185,236));padding-left: 5px;">CEL</span>
        <span style="background:linear-gradient(to right,rgb(23,185,236),rgb(251,192,137))">ES</span>
        <span style="background:rgb(251,192,137);padding-right:5px;">TIC</span>
      </div>
    </template>
    <template v-else-if="title === CardName.MORNING_STAR_INC || title === CardName._MORNING_STAR_INC_">
      <div class="card-morning-star-logo">MORNING STAR INC.</div>
    </template>
    <template v-else-if="title === CardName.PRISTAR">
      <div class="card-pristar-logo">PRISTAR</div>
    </template>
    <template v-else-if="title === CardName.CHEUNG_SHING_MARS">
      <div class="card-cheung-shing-logo">
        <span style="color:red;border:4px solid red;border-radius:50%;padding:3px 5px 3px 5px;font-size:30px;line-height:14px;box-shadow: 3px 3px 3px grey, inset 0 0 3px 3px grey;text-shadow: 3px 3px 3px grey;">㨐</span></div>
      <div style="display: inline-block; width:140px; font-size:19px; line-height: 22px; vertical-align: middle; margin-bottom: 15px;font-weight:normal;">
      &nbsp;Cheung Shing <br><div style="margin-left:10px"> ■■MARS■■ </div>
      </div>
    </template>
    <template v-else-if="title === CardName.CREDICOR">
      <div class="card-credicor-logo">CREDICOR</div>
    </template>
    <template v-else-if="title === CardName.ECOLINE || title === CardName._ECOLINE_">
      <div class="card-ecoline-logo">ecoline</div>
    </template>
    <template v-else-if="title === CardName.HELION || title === CardName._HELION_">
      <div class="card-helion-logo">helion</div>
    </template>
    <template v-else-if="title === CardName.INTERPLANETARY_CINEMATICS || title === CardName._INTERPLANETARY_CINEMATICS_">
      <div style="color: #020202;font-size:17px;margin-top:10px;margin-left:-87px;">INTERPLANETARY</div>
      <div style="height:5px;margin-top:-2px;width:143px;background:linear-gradient(to right,yellow,black,yellow,black,yellow);border:5px solid #cc3333;box-shadow:3px 3px 6px grey;"></div>
      <div style="color: #020202;font-size:24px;margin-left:-89px;margin-top:-5px; display:inline-block; -webkit-transform:scale(0.5,1); -moz-transform:scale(0.5,1); -ms-transform:scale(0.5,1); -o-transform:scale(0.5,1); transform:scale(1,0.5); margin-bottom:15px;">CINEMATICS</div>
    </template>
    <template v-else-if="title === CardName.INVENTRIX">
      <span class="card-inventrix-logo">
      <span style="color: #020202;background-color:#6bb5c7;padding-left:4px;padding-right:4px;font-size:26px;box-shadow: 6px 6px 10px grey;">X</span>
      INVENTRIX</span>
    </template>
    <template v-else-if="title === CardName._INVENTRIX_">
      <span class="card-inventrix-breakthrough-logo">
      <span style="color: #020202;background-color:#6bb5c7;padding-left:4px;padding-right:4px;font-size:26px;box-shadow: 6px 6px 10px grey;">X</span>
        INVENTRIX</span>;
    </template>
    <template v-else-if="title === CardName.PHOBOLOG || title === CardName._PHOBOLOG_">
      <span class="card-phobolog-logo">PHOBOLOG</span>
    </template>
    <template v-else-if="title === CardName.POINT_LUNA">
      <span class="card-luna-logo">POINT LUNA</span>
    </template>
    <template v-else-if="title === CardName.POLYPHEMOS || title === CardName._POLYPHEMOS_">
      <span class="card-polyphemos-logo">POLYPHEMOS</span>
    </template>
    <template v-else-if="title === CardName.SEPTEM_TRIBUS">
      <span class="card-septem-tribus-logo">Septem Tribus</span>
    </template>
    <template v-else-if="title === CardName.TERRALABS_RESEARCH || title === CardName._TERRALABS_RESEARCH_">
      <div style="font-size: 13px;left:32px;top:10px;font-family:Prototype;color:#222;transform:scale(2,1);position:absolute;">TERRALABS</div>
      <div style="position:absolute;top:28px;left:46px;font-size:8px;letter-spacing:2px;font-family:Prototype;transform:scale(2,1)">RESEARCH</div>
    </template>
    <template v-else-if="title === CardName.THORGATE || title === CardName._THORGATE_">
      <span class="card-thorgate-logo">THORGATE</span>
    </template>
    <template v-else-if="title === CardName.VIRON || title === CardName._VIRON_">
      <span class="card-viron-logo">VIRON</span>
    </template>
    <template v-else-if="title === CardName.ARIDOR">
      <span class="card-aridor-logo">ARIDOR</span>
    </template>
    <template v-else-if="title === CardName.ASTRODRILL">
      <span class="card-astrodril-logo">Astrodrill</span>
    </template>
    <template v-else-if="title === CardName.FACTORUM || title === CardName._FACTORUM_">
      <span class="card-factorum-logo">FACTORUM</span>
    </template>
    <template v-else-if="title === CardName.MANUTECH">
      <span class="card-manutech-logo"><span style="color:white;background:#e63900;text-shadow:none;padding-left:2px;">MA</span>NUTECH</span>
    </template>
    <template v-else-if="title === CardName.AGRICOLA_INC">
      <span class="card-agricola-logo">Agricola Inc</span>
    </template>
    <template v-else-if="title === CardName.ARCADIAN_COMMUNITIES || title === CardName._ARCADIAN_COMMUNITIES_">
      <span class="card-arcadian-logo"><span>Arcadian</span><br><span>Communities</span></span>
    </template>
    <template v-else-if="title === CardName.INCITE">
      <span class="card-incite-logo">Incite</span>
    </template>
    <template v-else-if="title === CardName.LAKEFRONT_RESORTS">
      <div class="card-lakefront-logo">LAKEFRONT <br> &nbsp;&nbsp;RESORTS</div>
    </template>
    <template v-else-if="title === CardName.MINING_GUILD || title === CardName._MINING_GUILD_">
      <span class="card-mining-guild-logo">MINING<br>GUILD</span>
    </template>
    <template v-else-if="title === CardName.PHILARES">
      <div class="card-philares-logo">PHIL<span style="color:#ff5858">A</span>RES</div>
    </template>
    <template v-else-if="title === CardName.RECYCLON || title === CardName._RECYCLON_">
      <div class="card-recyclon-logo">Recyclon</div>
    </template>
    <template v-else-if="title === CardName.ROBINSON_INDUSTRIES || title === CardName._ROBINSON_INDUSTRIES_">
      <div class="card-robinson-logo"><div style="letter-spacing:4px;border-bottom:3px solid #ccc;margin-top:5px;">ROBINSON</div>
      <div style="border-bottom:3px solid #ccc;">•—•—•—•—•—•—•&nbsp;</div>
      <div style="letter-spacing:2px;">INDUSTRIES</div></div>
    </template>
    <template v-else-if="title === CardName.SPLICE || title === CardName._SPLICE_">
      <div class="card-splice-logo"><div>SPLI<span style="color:red">C</span>E</div>
      <div STYLE="height:3px;background:red;margin-top:-3px;"></div>
      <div STYLE="font-size:10px;line-height:18px;">TACTICAL GENOMICS</div>
      </div>
    </template>
    <template v-else-if="title === CardName.STORMCRAFT_INCORPORATED || title === CardName._STORMCRAFT_INCORPORATED_">
      <div class="card-stormcraft-logo">
      <div class="stormcraft1">STORM</div><div class="stormcraft2">CRAFT</div>
      <div class="stormcraft3">INCOR</div><div class="stormcraft4">PORATED</div>
      </div>
    </template>
    <template v-else-if="title === CardName.TERACTOR || title === CardName._TERACTOR_">
      <span class="card-teractor-logo">TERACTOR</span>
    </template>
    <template v-else-if="title === CardName.THARSIS_REPUBLIC || title === CardName._THARSIS_REPUBLIC_">
      <div class="card-tharsis-logo">
      <div class="card-tharsis-logo-image"></div>
      <div class="card-tharsis-logo-text">Tharsis Republic</div>
      </div>
    </template>
    <template v-else-if="title === CardName.UNITED_NATIONS_MARS_INITIATIVE || title === CardName._UNITED_NATIONS_MARS_INITIATIVE_">
      <span class="card-unmi-logo">UNITED<br/>NATIONS<br/>MARS<br/>INITIATIVE</span>
    </template>
    <template v-else-if="title === CardName.UTOPIA_INVEST">
      <div class="card-utopia-logo">
      <div class="utopia-corp-name-1">UTOPIA</div>
      <div class="utopia-corp-name-2">INVEST</div>
      </div>
    </template>
    <template v-else-if="title === CardName.VALLEY_TRUST || title === CardName._VALLEY_TRUST_">
      <div class="card-valley-trust-logo">
      <div style="display:inline-block;margin-left:25px;padding-top: 2px;margin-bottom:0px;font-size:26px;text-shadow: 2px 2px #ccc;text-align:center">VALLEY<br/> TRUST</div>
      </div>
    </template>
    <template v-else-if="title === CardName.VITOR">
      <div class="card-vitor-logo">
      <span style="color:white;background:orangered;padding-left:3px;">VIT</span>
      <span style="background:linear-gradient(to right, orangered,white);">O</span>
      <span style="background:white;padding-right:3px;">R</span></div>
    </template>
    <template v-else-if="title === CardName.PHARMACY_UNION">
      <div class="card-pharmacy-union-logo">Pharmacy<br/>Union</div>
    </template>
    <template v-else-if="title === CardName.PLAYWRIGHTS">
      <div class="card-playwrights-logo">Playwrights</div>
    </template>
    <template v-else-if="title === CardName.MIDAS">
      <div class="card-midas-logo">MIDAS</div>
    </template>
    <template v-else-if="title === CardName.PROJECT_WORKSHOP">
      <div class="card-project-workshop-logo">PROJECT<br/>WORKSHOP</div>
    </template>
    <template v-else-if="title === CardName.MONS_INSURANCE">
      <div class="card-mons-logo">
      <div class="mons0">▲</div>
      <div class="mons1">mons</div>
      <div class="mons2">INSURANCE</div>
      </div>
    </template>
    <template v-else-if="title === CardName.NANOTECH_INDUSTRIES">
      <div class="card-nanotech-industries-logo"></div>
    </template>
    <template v-else-if="title === CardName.TEMPEST_CONSULTANCY">
      <div class="card-tempest-consultancy-logo"></div>
    </template>
    <template v-else-if="title === CardName.THE_DARKSIDE_OF_THE_MOON_SYNDICATE">
      <div class="card-the-darkside-of-the-moon-syndicate-logo"></div>
    </template>
    <template v-else-if="title === CardName.LUNA_HYPERLOOP_CORPORATION">
      <div class="card-luna-hyperloop-corporation-logo"></div>
    </template>
    <template v-else-if="title === CardName.CRESCENT_RESEARCH_ASSOCIATION">
      <div class="card-crescent-research-association-logo"></div>
    </template>
    <template v-else-if="title === CardName.LUNA_FIRST_INCORPORATED">
      <div class="card-luna-first-incorporated-logo"></div>
    </template>
    <template v-else-if="title === CardName.THE_GRAND_LUNA_CAPITAL_GROUP">
      <div class="card-the-grand-luna-capital-group-logo"></div>
    </template>
    <template v-else-if="title === CardName.INTRAGEN_SANCTUARY_HEADQUARTERS">
      <div class="card-intragen-sanctuary-headquarters-logo"></div>
    </template>
    <template v-else-if="title === CardName.THE_ARCHAIC_FOUNDATION_INSTITUTE">
      <div class="card-the-archaic-foundation-institute-logo"></div>
    </template>
    <template v-else-if="title ===  CardName.POLARIS">
      <div class="card-polaris-logo"></div>
    </template>
    <template v-else-if="title ===  CardName.RINGCOM">
      <div class="card-ringcom-logo"></div>
    </template>
    <template v-else-if="title ===  CardName.CHIMERA">
      <div class="card-chimera-logo"></div>
    </template>
    <template v-else-if="title ===  CardName.STEELARIS">
      <div class="card-steelaris-logo"></div>
    </template>
    <template v-else-if="title ===  CardName.MARTIAN_INSURANCE_GROUP">
      <div class="card-martian-insurance-group-logo"></div>
    </template>
    <template v-else-if="title ===  CardName.ROBIN_HAULINGS">
      <div class="card-robin-haulings-logo"></div>
    </template>
    <template v-else-if="title ===  CardName.COLLEGIUM_COPERNICUS">
      <div class="card-collegium-copernicus-logo"></div>
    </template>
    <template v-else-if="title ===  CardName.MARS_DIRECT">
      <div class="card-mars-direct-logo"></div>
    </template>
    <template v-else-if="title ===  CardName.AMBIENT">
      <div class="card-ambient-logo"></div>
    </template>
    <template v-else-if="title ===  CardName.SOYLENT_SEEDLING_SYSTEMS">
      <div class="card-soylent-logo"></div>
    </template>
    <template v-else-if="title ===  CardName.BIO_SOL">
      <div class="card-bio-sol-logo"></div>
    </template>
    <template v-else-if="title ===  CardName.MIND_SET_MARS">
      <div class="card-mind-set-mars-logo"></div>
    </template>
    <template v-else-if="title ===  CardName.ADHAI_HIGH_ORBIT_CONSTRUCTIONS">
      <div class="card-adhai-high-orbit-constructions-logo"></div>
    </template>
    <template v-else-if="title ===  CardName.CURIOSITY_II">
      <div class="card-curiosity-ii-logo">Curiosity II</div>
    </template>

    <template v-else-if="title === CardName.ERIS">
      <div class="card-eris-logo">Eris</div>
    </template>
    <template v-else-if="title === CardName.COLONIAL_ONE">
      <div class="card-colonial-one-logo">Colonial One</div>
    </template>
    <template v-else-if="title === CardName.HOTSPRINGS">
      <div class="card-hotsprings-logo">Hotsprings</div>
    </template>
    <template v-else-if="title === CardName.JUNK_VENTURES">
      <div class="card-junk-ventures-logo">Junk Ventures</div>
    </template>
    <template v-else-if="title === CardName.ARISTARCHUS">
      <div class="card-aristarchus-logo">Aristarchus</div>
    </template>
    <template v-else-if="title === CardName.LABOUR_UNION">
      <div class="card-labour-union-logo">Labour Union</div>
    </template>
    <template v-else-if="title === CardName.UNITED_NATIONS_MISSION_ONE">
      <span class="card-unmo-logo">UNITED NATIONS<br/>MISSION ONE</span>
    </template>
    <template v-else-if="title === CardName.CHAOS">
      <span class="card-chaos-logo">CHAOS</span><div class="naming-award  naming-award-chaos"></div>
    </template>
    <template v-else-if="title === CardName.IDO_FRONT">
      <span class="card-idfront-logo">Id Front <span style="font-size:20px;display:inline-block;">&#x25CF;</span> 前线基地</span>
    </template>
    <template v-else-if="title === CardName.WG_PARTERNSHIP">
      <span class="card-wgparternship-logo">WG Parternship</span>
    </template>
    <template v-else-if="title === CardName.INCITE_ENDER">
      <div class="card-incite-ender-logo"></div><div class="naming-award  naming-award-incite"></div>
    </template>
    <template v-else-if="title === CardName.TRADE_NAVIGATOR">
      <div class="card-trade-navigator-logo"></div><div class="naming-award  naming-award-trade-navigator"></div>
    </template>
    <template v-else-if="title === CardName.BROTHERHOOD_OF_MUTANTS">
      <div class="card-mutant-logo"></div><div class="naming-award  naming-award-brotherhood"></div>
    </template>
    <template v-else-if="title === CardName.TEIAI_GROUP">
      <div class="card-teiai-group-logo"></div>
    </template>
    <template v-else-if="title === CardName.VOID">
      <div class="card-midas-logo">VOID</div>
    </template>
    <template v-else-if="title === CardName.SHINRA_TECH">
      <div class="card-playwrights-logo">🌸SHINRA<br/>TECH🌸</div>
    </template>
    <template v-else-if="title === CardName.TYRELL">
      <div class="card-incite-logo">TYRELL</div>
    </template>
    <template v-else-if="title === CardName.WEYLAND_YUTANI">
      <div class="card-project-workshop-logo">🌸WEYLAND<br/>YUTANI🌸</div>
    </template>
    <template v-else-if="title === CardName.SCOLEX_INDUSTRIES">
      <div class="card-scolex-logo">
        <div class="utopia-corp-name-1">scolex</div>
        <div class="utopia-corp-name-2">✡Ind✡</div>
      </div>
    </template>
    <template v-else-if="title === CardName.INTEGRATED_MICROORGANISMS">
      <div class="card-protogen-logo">🌸INTEGRATED<br/>MICROORGANISMS🌸</div>
    </template>
    <template v-else-if="title === CardName.PROTOGEN">
      <div class="card-protogen-logo">🌸PROTOGEN🌸</div>
    </template>
    <template v-else-if="title === CardName.MINING_CORP">
      <div class="card-curiosity-ii-logo">MINING CORP</div>
    </template>
    <template v-else-if="title ===  CardName.BUY_N_LARGE">
      <div class="card-buy-n-large-logo"></div>
    </template>
    <template v-else>
      <div>{{title}}</div>
    </template>
  </div>
</template>

<script lang="ts">

import Vue from 'vue';
import {CardName} from '@/common/cards/CardName';

export default Vue.extend({
  name: 'CardCorporationLogo',
  props: {
    title: {
      type: String as () => CardName,
      required: true,
    },
  },
  computed: {
    CardName(): typeof CardName {
      return CardName;
    },
  },
});

</script>

