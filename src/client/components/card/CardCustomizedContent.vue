<template>
  <div class="card-lastpay-counter">
      <div class="card-lastpay-counter-number"> {{ getAmount }} </div>
  </div>
</template>

<script lang="ts">

import Vue from 'vue';

export default Vue.extend({
  name: 'CardCustomizedContent',
  props: {
    amount: {
      type: Number,
      required: true,
    },
  },
  computed: {
    getAmount(): string {
      console.log('amount', this.amount);
      if (!this.amount || this.amount < 0) {
        return '';
      }
      return this.amount.toString();
    },
  },
});

</script>

