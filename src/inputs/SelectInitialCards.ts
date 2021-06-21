
import {AndOptions} from './AndOptions';
import {CorporationCard} from '../cards/corporation/CorporationCard';
import {IProjectCard} from '../cards/IProjectCard';
import {Player} from '../Player';
import {PlayerInput} from '../PlayerInput';
import {PlayerInputTypes} from '../PlayerInputTypes';
import {SelectCard} from './SelectCard';

export class SelectInitialCards extends AndOptions implements PlayerInput {
    public inputType = PlayerInputTypes.SELECT_INITIAL_CARDS;
    constructor(player: Player, doubleCorp : boolean, cb: (corporation: CorporationCard, corporation2: CorporationCard | undefined) => undefined) {
      super(() => {
        cb(corporation, corporation2);
        return undefined;
      });
      let corporation: CorporationCard;
      let corporation2: CorporationCard;
      this.title = ' ';
      this.buttonLabel = 'Start';
      const corpNum = doubleCorp? 2:1;
      this.options.push(
        new SelectCard<CorporationCard>(
          'Select corporation', undefined, player.dealtCorporationCards,
          (foundCards: Array<CorporationCard>) => {
            corporation = foundCards[0];
            corporation2 = foundCards[1];
            return undefined;
          }, corpNum, corpNum, false, undefined, true, false,
        ),
      );

      if (player.game.gameOptions.preludeExtension) {
        this.options.push(
          new SelectCard(
            'Select 2 Prelude cards', undefined, player.dealtPreludeCards,
            (preludeCards: Array<IProjectCard>) => {
              player.preludeCardsInHand.push(...preludeCards);
              return undefined;
            }, 2, 2,
          ),
        );
      }

      this.options.push(
        new SelectCard(
          'Select initial cards to buy', undefined, player.dealtProjectCards,
          (foundCards: Array<IProjectCard>) => {
            player.cardsInHand.push(...foundCards);
            return undefined;
          }, 10, 0,
        ),
      );
    }
}
