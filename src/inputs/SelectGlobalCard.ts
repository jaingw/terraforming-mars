import {Message} from '../Message';
import {PlayerInput} from '../PlayerInput';
import {PlayerInputTypes} from '../PlayerInputTypes';
import {IGlobalEvent} from '../turmoil/globalEvents/IGlobalEvent';

export class SelectGlobalCard implements PlayerInput {
    public inputType: PlayerInputTypes = PlayerInputTypes.SELECT_GLOBAL_CARD;

    constructor(
        public title: string | Message,
        public buttonLabel: string = 'Save',
        public cards: Array<IGlobalEvent>,
        public cb: (cards: Array<IGlobalEvent>) => PlayerInput | undefined,
        public maxCardsToSelect: number = 1,
        public minCardsToSelect: number = 1,
    ) {
      this.buttonLabel = buttonLabel;
    }
}
