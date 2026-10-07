<template>
  <div class="card-lastpay-counter">
    <div class="card-lastpay-counter-number"> {{ getAmount }} </div>
  </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CardCustomizedContent',
  props: {
    amount: {
      type: Number,
      required: true,
    },
  },
  computed: {
    getAmount(): string {
      if (this.amount !== undefined && this.amount >= 0) {
        return this.amount.toString();
      }
      return '';
    },
  },
});

</script>

