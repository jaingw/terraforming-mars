import {AndOptions} from './AndOptions';
import {ICorporationCard} from '../cards/corporation/ICorporationCard';
import {IPlayer} from '../IPlayer';
import {SelectCard} from './SelectCard';
import {ICeoCard} from '../cards/ceos/ICeoCard';
import * as titles from '../../common/inputs/SelectInitialCards';
import {SelectInitialCardsModel} from '../../common/models/PlayerInputModel';
import {InputError} from './InputError';


export class SelectInitialCards extends AndOptions {
  public override readonly type = 'initialCards';
  constructor(private player: IPlayer, doubleCorp : boolean, cb: (corporation: ICorporationCard, corporation2: ICorporationCard | undefined) => undefined) {
    super();
    let corporation: ICorporationCard;
    let corporation2: ICorporationCard;
    this.title = ' ';
    this.buttonLabel = 'Start';
    const corpNum = doubleCorp? 2:1;
    this.options.push(
      new SelectCard<ICorporationCard>(
        doubleCorp ? titles.SELECT_CORPORATION_TITLE2: titles.SELECT_CORPORATION_TITLE, undefined, player.dealtCorporationCards, {min: corpNum, max: corpNum}).andThen(
        (foundCards: Array<ICorporationCard>) => {
          corporation = foundCards[0];
          doubleCorp ? corporation2 = foundCards[1] : '';
          return undefined;
        }),
    );

    // Give each player Merger in this variant
    // if (player.game.gameOptions.twoCorpsVariant) {
    //   player.dealtPreludeCards.push(new Merger());
    // }

    if (player.game.gameOptions.preludeExtension) {
      this.options.push(
        new SelectCard(titles.SELECT_PRELUDE_TITLE, undefined, player.dealtPreludeCards, {min: 2, max: 2})
          .andThen((preludeCards) => {
            if (preludeCards.length !== 2) {
              throw new InputError('Only select 2 preludes');
            }
            player.preludeCardsInHand.push(...preludeCards);
            return undefined;
          }));
    }

    if (player.game.gameOptions.ceoExtension) {
      this.options.push(
        new SelectCard(titles.SELECT_CEO_TITLE, undefined, player.dealtCeoCards, {min: 1, max: 1}).andThen((ceoCards: Array<ICeoCard>) => {
          if (ceoCards.length !== 1) {
            throw new InputError('Only select 1 CEO');
          }
          // Push chosen card to hand
          player.ceoCardsInHand.push(ceoCards[0]);
          // Discard unchosen CEOs
          player.dealtCeoCards.filter((c) => c !== ceoCards[0]).forEach((c) => player.game.ceoDeck.discard(c));
          return undefined;
        }));
    }

    this.options.push(
      new SelectCard(titles.SELECT_PROJECTS_TITLE, undefined, player.dealtProjectCards, {min: 0, max: 10})
        .andThen((cards) => {
          player.cardsInHand.push(...cards);
          return undefined;
        }),
    );
    this.andThen(() => {
      this.completed(corporation, corporation2);

      // TODO(kberg): This is probably broken. Stop subclassing AndOptions.
      cb(corporation, corporation2);
      return undefined;
    });
  }

  private completed(_corporation: ICorporationCard, _corporation2: ICorporationCard | undefined) {
    //  Game.ts 的 selectInitialCards中已包含下面逻辑,先校验金额再执行, 新增部分迁移出去
    const player = this.player;
    // discard all unpurchased cards
    player.dealtProjectCards.forEach((_card) => {
      // if (player.cardsInHand.includes(card) === false) {
      //   player.game.projectDeck.discard(card);
      // }
    });
    // player.dealtCorporationCards.forEach((card) => {
    //   if (card.name !== corporation.name && card.name !== corporation2?.name) {
    //     player.game.corporationDeck.discard(card);
    //   }
    // });
  }

  public override toModel(player: IPlayer): SelectInitialCardsModel {
    return {
      title: this.title,
      buttonLabel: this.buttonLabel,
      type: 'initialCards',
      options: this.options.map((option) => option.toModel(player)),
    };
  }
}
