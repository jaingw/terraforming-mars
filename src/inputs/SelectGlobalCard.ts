import {PlayerInputTypes} from '../common/input/PlayerInputTypes';
import {InputResponse} from '../common/inputs/InputResponse';
import {Message} from '../common/logs/Message';
import {Player} from '../Player';
import {PlayerInput} from '../PlayerInput';
import {IGlobalEvent} from '../turmoil/globalEvents/IGlobalEvent';

export class SelectGlobalCard<T extends IGlobalEvent> implements PlayerInput {
  public inputType: PlayerInputTypes = PlayerInputTypes.SELECT_GLOBAL_CARD;

  constructor(
        public title: string | Message,
        public buttonLabel: string = 'Save',
        public cards: Array<T>,
        public cb: (cards: Array<T>) => PlayerInput | undefined,
        public maxCardsToSelect: number = 1,
        public minCardsToSelect: number = 1,
  ) {
    this.buttonLabel = buttonLabel;
  }


  public process(input: InputResponse, player: Player) {
    player.checkInputLength(input, 1);
    if (input[0].length < this.minCardsToSelect) {
      throw new Error('Not enough cards selected');
    }
    if (input[0].length > this.maxCardsToSelect) {
      throw new Error('Too many cards selected');
    }
    const mappedCards: Array<T> = [];
    for (const cardName of input[0]) {
      mappedCards.push(PlayerInput.getCard(this.cards, cardName).card);
    }
    return this.cb(mappedCards);
  }
}
