import {AndOptions} from './AndOptions';
import {ICorporationCard} from '../cards/corporation/ICorporationCard';
import {IProjectCard} from '../cards/IProjectCard';
import {Player} from '../Player';
import {PlayerInputType} from '../../common/input/PlayerInputType';
import {SelectCard} from './SelectCard';
import {Merger} from '../cards/promo/Merger';
import {ICeoCard} from '../cards/ceos/ICeoCard';
import * as titles from '../../common/inputs/SelectInitialCards';


export class SelectInitialCards extends AndOptions {
  public override readonly inputType = PlayerInputType.SELECT_INITIAL_CARDS;
  constructor(private player: Player, doubleCorp : boolean, cb: (corporation: ICorporationCard, corporation2: ICorporationCard | undefined) => undefined) {
    super(() => {
      this.completed(corporation, corporation2);
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
        doubleCorp ? titles.SELECT_CORPORATION_TITLE2: titles.SELECT_CORPORATION_TITLE, undefined, player.dealtCorporationCards,
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
          titles.SELECT_PRELUDE_TITLE, undefined, player.dealtPreludeCards,
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

    if (player.game.gameOptions.ceoExtension) {
      this.options.push(
        new SelectCard(
          titles.SELECT_CEO_TITLE, undefined, player.dealtCeoCards,
          (ceoCards: Array<ICeoCard>) => {
            if (ceoCards.length !== 1) {
              throw new Error('Only select 1 CEO');
            }
            // Push chosen card to hand
            player.ceoCardsInHand.push(ceoCards[0]);
            // Discard unchosen CEOs
            player.dealtCeoCards.filter((c) => c !== ceoCards[0]).forEach((c) => player.game.ceoDeck.discard(c));
            return undefined;
          }, {min: 1, max: 1},
        ),
      );
    }

    this.options.push(
      new SelectCard(
        titles.SELECT_PROJECTS_TITLE, undefined, player.dealtProjectCards,
        (cards) => {
          player.cardsInHand.push(...cards);
          return undefined;
        }, {min: 0, max: 10},
      ),
    );
  }

  private completed(corporation: ICorporationCard, corporation2: ICorporationCard | undefined) {
    const player = this.player;
    player.dealtCorporationCards.forEach((card) => {
      if (card.name !== corporation.name && card.name !== corporation2?.name) {
        player.game.corporationDeck.discard(card);
      }
    });
  }
}
