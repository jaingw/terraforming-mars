import {PlayerInputType} from '../../common/input/PlayerInputType';
import {InputResponse, isSelectCardResponse} from '../../common/inputs/InputResponse';
import {Message} from '../../common/logs/Message';
import {getCardFromPlayerInput, PlayerInput} from '../PlayerInput';
import {UnexpectedInput} from '../routes/UnexpectedInput';
import {IGlobalEvent} from '../turmoil/globalEvents/IGlobalEvent';

export class SelectGlobalCard<T extends IGlobalEvent> implements PlayerInput {
  public inputType: PlayerInputType = PlayerInputType.SELECT_GLOBAL_CARD;

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

  public process(input: InputResponse) {
    if (!isSelectCardResponse(input)) {
      throw new Error('Not a valid SelectCardResponse');
    }
    if (input.cards.length < this.minCardsToSelect) {
      throw new UnexpectedInput('Not enough cards selected');
    }
    if (input.cards.length > this.maxCardsToSelect) {
      throw new UnexpectedInput('Too many cards selected');
    }
    const mappedCards: Array<T> = [];
    for (const cardName of input.cards) {
      mappedCards.push(getCardFromPlayerInput(this.cards, cardName).card);
    }
    return this.cb(mappedCards);
  }
}
