import {BasePlayerInput} from '../PlayerInput';
import {InputResponse, isSelectGlobalEventResponse} from '../../common/inputs/InputResponse';
import {SelectGlobalEventModel} from '../../common/models/PlayerInputModel';
import {IGlobalEvent} from '../turmoil/globalEvents/IGlobalEvent';
import {InputError} from './InputError';
import {UnexpectedInput} from './UnexpectedInput';

export class SelectGlobalEvent extends BasePlayerInput<Array<IGlobalEvent>> {
  constructor(public globalEvents: ReadonlyArray<IGlobalEvent>,
    title: string = 'Select Global Event',
    buttonLabel: string = 'Save',
    public maxCardsToSelect: number = 1,
    public minCardsToSelect: number = 1,
  ) {
    super('card', title);
    this.buttonLabel = buttonLabel;
  }

  public toModel(): SelectGlobalEventModel {
    return {
      title: this.title,
      buttonLabel: this.buttonLabel,
      type: 'globalEvent',
      globalEventNames: this.globalEvents.map((globalEvent) => globalEvent.name),
      max: this.maxCardsToSelect,
      min: this.minCardsToSelect,
    };
  }

  public process(input: InputResponse) {
    if (!isSelectGlobalEventResponse(input)) {
      throw new InputError('Not a valid SelectGlobalEventResponse');
    }
    if (input.globalEventNames.length < this.minCardsToSelect) {
      throw new UnexpectedInput('Not enough cards selected');
    }
    if (input.globalEventNames.length > this.maxCardsToSelect) {
      throw new UnexpectedInput('Too many cards selected');
    }
    const globalEvents: Array<IGlobalEvent> = input.globalEventNames.map((globalEventName) => {
      return this.globalEvents.find((e) => e.name === globalEventName);
    }) as Array<IGlobalEvent>;
    if (globalEvents === undefined) {
      throw new InputError(`Invalid Global Event ${input.globalEventNames}`);
    }
    return this.cb(globalEvents);
  }
}
