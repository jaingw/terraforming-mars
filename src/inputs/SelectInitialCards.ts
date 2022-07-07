
import {AndOptions} from './AndOptions';
import {ICorporationCard} from '../cards/corporation/ICorporationCard';
import {IProjectCard} from '../cards/IProjectCard';
import {Player} from '../Player';
import {PlayerInput} from '../PlayerInput';
import {PlayerInputTypes} from '../common/input/PlayerInputTypes';
import {SelectCard} from './SelectCard';

export class SelectInitialCards extends AndOptions implements PlayerInput {
  public override inputType = PlayerInputTypes.SELECT_INITIAL_CARDS;
  constructor(player: Player, doubleCorp : boolean, cb: (corporation: ICorporationCard, corporation2: ICorporationCard | undefined) => undefined) {
    super(() => {
      cb(corporation, corporation2);
      return undefined;
    });
    let corporation: ICorporationCard;
    let corporation2: ICorporationCard;
    this.title = ' ';
    this.buttonLabel = 'Start';
    const corpNum = doubleCorp? 2:1;
    this.options.push(
      new SelectCard<ICorporationCard>(
        doubleCorp ? 'Select 2 corporations' : 'Select corporation', undefined, player.dealtCorporationCards,
        (foundCards: Array<ICorporationCard>) => {
          corporation = foundCards[0];
          corporation2 = foundCards[1];
          return undefined;
        }, {max: corpNum, min: corpNum},
      ),
    );

    if (player.game.gameOptions.preludeExtension) {
      this.options.push(
        new SelectCard(
          'Select 2 Prelude cards', undefined, player.dealtPreludeCards,
          (preludeCards: Array<IProjectCard>) => {
            player.preludeCardsInHand.push(...preludeCards);
            return undefined;
          }, {min: 2, max: 2},
        ),
      );
    }

    this.options.push(
      new SelectCard(
        'Select initial cards to buy', undefined, player.dealtProjectCards,
        (foundCards: Array<IProjectCard>) => {
          player.cardsInHand.push(...foundCards);
          return undefined;
        }, {min: 0, max: 10},
      ),
    );
  }
}
