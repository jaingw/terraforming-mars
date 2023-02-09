
import {AndOptions} from './AndOptions';
import {ICorporationCard} from '../cards/corporation/ICorporationCard';
import {IProjectCard} from '../cards/IProjectCard';
import {Player} from '../Player';
import {PlayerInputType} from '../../common/input/PlayerInputType';
import {SelectCard} from './SelectCard';
import {Merger} from '../cards/promo/Merger';

export class SelectInitialCards extends AndOptions {
  public override readonly inputType = PlayerInputType.SELECT_INITIAL_CARDS;
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
          doubleCorp ? corporation2 = foundCards[1] : '';
          return undefined;
        }, {max: corpNum, min: corpNum},
      ),
    );

    // Give each player Merger in this variant
    if (player.game.gameOptions.twoCorpsVariant) {
      player.dealtPreludeCards.push(new Merger());
    }

    if (player.game.gameOptions.preludeExtension) {
      this.options.push(
        new SelectCard(
          'Select 2 Prelude cards', undefined, player.dealtPreludeCards,
          (preludeCards: Array<IProjectCard>) => {
            if (preludeCards.length !== 2) {
              throw new Error('Only select 2 preludes');
            }
            player.preludeCardsInHand.push(...preludeCards);
            return undefined;
          }, {min: 2, max: 2},
        ),
      );
    }

    this.options.push(
      new SelectCard(
        'Select initial cards to buy', undefined, player.dealtProjectCards,
        (cards) => {
          player.cardsInHand.push(...cards);
          return undefined;
        }, {min: 0, max: 10},
      ),
    );
  }
}
