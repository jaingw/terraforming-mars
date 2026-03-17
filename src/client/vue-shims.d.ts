/*
 * @Author: Ender-Wiggin
 * @Date: 2026-02-03 15:32:45
 * @LastEditors: Ender-Wiggon
 * @LastEditTime: 2026-02-10 15:56:20
 * @Description:
 * Vue 2 type declarations for global component extensions
 */
import {Composer} from 'vue-i18n';

declare module 'vue/types/vue' {
  interface Vue {
    $t: typeof import('@/client/directives/i18n').$t;
  }
}

declare module '*.vue' {
  import {DefineComponent} from 'vue';

  interface ComponentCustomProperties {
    $t: typeof import('@/client/directives/i18n').$t;
  }

  export {DefineComponent};
}
