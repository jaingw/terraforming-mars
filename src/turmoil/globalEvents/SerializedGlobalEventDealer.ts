import {IGlobalEvent} from './IGlobalEvent';

export interface SerializedGlobalEventDealer {
  globalEventsDeck: Array<IGlobalEvent>;
  discardedGlobalEvents: Array<IGlobalEvent>;
}
