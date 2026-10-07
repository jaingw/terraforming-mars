<template>
  <ModuleItemFilter
    ref="filter"
    title="Corporations"
    :groups="groups"
    :items-by-group="cardsByModule"
    :selected="selectedCorporations"
    @update:selected="updateCorporations"
    @close="$emit('close')"
  >
    <template #item="{itemName, icon}">
      <span v-i18n>{{ itemName }}</span>
      <div
        v-for="expansion in compatibility(itemName)"
        :key="expansion"
        :class="icon(expansion)"
      ></div>
    </template>
  </ModuleItemFilter>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import ModuleItemFilter from '@/client/components/create/ModuleItemFilter.vue';
import {CardName} from '@/common/cards/CardName';
import {Expansion, GameModule, GAME_MODULES, MODULE_NAMES} from '@/common/cards/GameModule';
import {byModule, byType, getCard, getCards} from '@/client/cards/ClientCardManifest';
import {CardType} from '@/common/cards/CardType';
import {toName} from '@/common/utils/utils';

function corpCardNames(module: GameModule): Array<CardName> {
  return getCards(byModule(module))
    .filter(byType(CardType.CORPORATION))
    .map(toName)
    .filter((name) => name !== CardName.BEGINNER_CORPORATION);
}

export default defineComponent({
  name: 'CorporationsFilter',
  components: {ModuleItemFilter},
  emits: ['corporation-list-changed', 'close'],
  props: {
    expansions: {type: Object as () => Record<Expansion, boolean>, required: true},
    selected: {type: Array as () => Array<CardName>, required: false, default: () => []},
  },
  data() {
    const cardsByModule = Object.fromEntries(
      GAME_MODULES.map((module) => [module, [] as Array<CardName>]),
    ) as Record<GameModule, Array<CardName>>;

    getCards(byType(CardType.CORPORATION)).forEach((card) => {
      if (card.name !== CardName.BEGINNER_CORPORATION) {
        cardsByModule[card.module].push(card.name);
      }
    });
    GAME_MODULES.forEach((module) => cardsByModule[module].sort());

    const groups = GAME_MODULES
      .filter((module) => module !== 'breakthrough')
      .map((module) => ({key: module, label: MODULE_NAMES[module]}));

    const defaultSelected = [
      ...corpCardNames('base'),
      ...(this.expansions.corpera ? corpCardNames('corpera') : []),
      ...(this.expansions.prelude ? corpCardNames('prelude') : []),
      ...(this.expansions.prelude2 ? corpCardNames('prelude2') : []),
      ...(this.expansions.venus ? corpCardNames('venus') : []),
      ...(this.expansions.colonies ? corpCardNames('colonies') : []),
      ...(this.expansions.turmoil ? corpCardNames('turmoil') : []),
      ...(this.expansions.promo ? corpCardNames('promo') : []),
      ...(this.expansions.community ? corpCardNames('community') : []),
      ...(this.expansions.moon ? corpCardNames('moon') : []),
      ...(this.expansions.pathfinders ? corpCardNames('pathfinders') : []),
      ...(this.expansions.underworld ? corpCardNames('underworld') : []),
    ];

    return {
      cardsByModule,
      groups,
      selectedCorporations: this.selected.length > 0 ? [...this.selected] : defaultSelected,
    };
  },
  methods: {
    updateCorporations(value: Array<CardName>) {
      this.selectedCorporations = [...value];
      this.$emit('corporation-list-changed', value);
    },
    watchSelect(module: GameModule, enabled: boolean): void {
      const filter = this.$refs.filter as {watchSelect?: (key: string, enabled: boolean) => void} | undefined;
      filter?.watchSelect?.(module, enabled);
    },
    compatibility(corporation: CardName): Array<GameModule> {
      return getCard(corporation)?.compatibility ?? [];
    },
    commissionCardsOption(enabled: boolean): void {
      this.watchSelect('commission', enabled);
    },
  },
});
</script>
