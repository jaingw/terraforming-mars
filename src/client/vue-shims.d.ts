import {Composer} from 'vue-i18n';

declare module '*.vue' {
  import {DefineComponent} from 'vue';
  interface ComponentCustomProperties {
    $t: typeof import('@/client/directives/i18n').$t;
  }
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
