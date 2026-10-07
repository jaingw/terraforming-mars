import { defineComponent } from 'vue';
import * as Vue from 'vue';

type VueCompat = typeof Vue & {
  extend: typeof defineComponent,
  component: <T>(name: string, component: T) => T,
};

const vueCompat: VueCompat = {
  ...Vue,
  extend: defineComponent,
  component: <T>(_name: string, component: T) => component,
};

export * from 'vue';
export default vueCompat;
