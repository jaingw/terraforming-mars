import {GlobalEventName} from '../../../common/turmoil/globalEvents/GlobalEventName';

export type SerializedGlobalEventDealer = {
  globalEventsDeck?: Array< GlobalEventName>;
  discardedGlobalEvents?: Array< GlobalEventName>;
  deck: Array<GlobalEventName>;
  discarded: Array<GlobalEventName>;
}
