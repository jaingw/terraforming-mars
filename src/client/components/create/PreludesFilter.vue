<template>
  <ModuleItemFilter
    ref="filter"
    title="Preludes"
    :groups="groups"
    :items-by-group="cardsByModule"
    :selected="selectedPreludes"
    @update:selected="updatePreludes"
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

function preludeCardNames(module: GameModule): Array<CardName> {
  return getCards(byModule(module))
    .filter(byType(CardType.PRELUDE))
    .map(toName);
}

export default defineComponent({
  name: 'PreludesFilter',
  components: {ModuleItemFilter},
  emits: ['prelude-list-changed', 'close'],
  props: {
    expansions: {type: Object as () => Record<Expansion, boolean>, required: true},
    selected: {type: Array as () => Array<CardName>, required: false, default: () => []},
  },
  data() {
    const cardsByModule = Object.fromEntries(
      GAME_MODULES.map((module) => [module, [] as Array<CardName>]),
    ) as Record<GameModule, Array<CardName>>;

    getCards(byType(CardType.PRELUDE)).forEach((card) => {
      if (card.name !== CardName.DELTA_PROJECT) {
        cardsByModule[card.module].push(card.name);
      }
    });
    GAME_MODULES.forEach((module) => cardsByModule[module].sort());

    const groups = GAME_MODULES.map((module) => ({key: module, label: MODULE_NAMES[module]}));

    const defaultSelected = [
      ...preludeCardNames('prelude'),
      ...(this.expansions.promo ? preludeCardNames('promo') : []),
      ...(this.expansions.community ? preludeCardNames('community') : []),
      ...(this.expansions.commission ? preludeCardNames('commission') : []),
      ...(this.expansions.moon ? preludeCardNames('moon') : []),
      ...(this.expansions.pathfinders ? preludeCardNames('pathfinders') : []),
      ...(this.expansions.ceo ? preludeCardNames('ceo') : []),
      ...(this.expansions.underworld ? preludeCardNames('underworld') : []),
      ...(this.expansions.prelude2 ? preludeCardNames('prelude2') : []),
    ];

    return {
      cardsByModule,
      groups,
      selectedPreludes: this.selected.length > 0 ? [...this.selected] : defaultSelected,
    };
  },
  methods: {
    updatePreludes(value: Array<CardName>) {
      this.selectedPreludes = [...value];
      this.$emit('prelude-list-changed', value);
    },
    watchSelect(module: GameModule, enabled: boolean): void {
      const filter = this.$refs.filter as {watchSelect?: (key: string, enabled: boolean) => void} | undefined;
      filter?.watchSelect?.(module, enabled);
    },
    compatibility(prelude: CardName): Array<GameModule> {
      return getCard(prelude)?.compatibility ?? [];
    },
  },
});
</script>
