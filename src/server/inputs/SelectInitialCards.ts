import * as titles from '../../common/inputs/SelectInitialCards';
import {ICorporationCard} from '../cards/corporation/ICorporationCard';
import {IPlayer} from '../IPlayer';
import {SelectCard} from './SelectCard';
import {SelectInitialCardsModel} from '../../common/models/PlayerInputModel';
import {InputError} from './InputError';
import {OptionsInput} from './OptionsPlayerInput';
import {InputResponse, isSelectInitialCardsResponse} from '../../common/inputs/InputResponse';

export class SelectInitialCards extends OptionsInput<undefined> {
  constructor(private player: IPlayer, doubleCorp : boolean, cb: (corporation: ICorporationCard, corporation2: ICorporationCard | undefined) => undefined) {
    super('initialCards', '', []);
    const game = this.player.game;
    let corporation: ICorporationCard;
    let corporation2: ICorporationCard;
    this.title = ' ';
    this.buttonLabel = 'Start';
    const corpNum = doubleCorp? 2:1;
    this.options.push(
      new SelectCard<ICorporationCard>(
        doubleCorp ? titles.SELECT_CORPORATION_TITLE2: titles.SELECT_CORPORATION_TITLE, undefined, player.dealtCorporationCards, {min: corpNum, max: corpNum}).andThen(
        (foundCards: ReadonlyArray<ICorporationCard>) => {
          corporation = foundCards[0];
          doubleCorp ? corporation2 = foundCards[1] : '';
          return undefined;
        }),
    );

    // Give each player Merger in this variant
    // if (game.gameOptions.twoCorpsVariant) {
    //   player.dealtPreludeCards.push(new Merger());
    // }

    if (game.gameOptions.preludeExtension) {
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

    if (game.gameOptions.ceoExtension) {
      this.options.push(
        new SelectCard(titles.SELECT_CEO_TITLE, undefined, player.dealtCeoCards, {min: 1, max: 1}).andThen((ceoCards) => {
          if (ceoCards.length !== 1) {
            throw new InputError('Only select 1 CEO');
          }
          player.ceoCardsInHand.push(ceoCards[0]);
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
    // const player = this.player;
    // const game = player.game;

    // player.dealtProjectCards.forEach((_card) => {
    // if (player.cardsInHand.includes(card) === false) {
    //   player.game.projectDeck.discard(card);
    // }
    // });
    // player.dealtCorporationCards.forEach((card) => {
    //   if (card.name !== corporation.name && card.name !== corporation2?.name) {
    //     player.game.corporationDeck.discard(card);
    //   }
    // });

    // for (const card of player.dealtPreludeCards) {
    //   if (player.preludeCardsInHand.includes(card) === false) {
    //     game.preludeDeck.discard(card);
    //   }
    // }

    // for (const card of player.dealtCeoCards) {
    //   if (player.ceoCardsInHand.includes(card) === false) {
    //     game.ceoDeck.discard(card);
    //   }
    // }
  }

  public toModel(player: IPlayer): SelectInitialCardsModel {
    return {
      title: this.title,
      buttonLabel: this.buttonLabel,
      type: 'initialCards',
      options: this.options.map((option) => option.toModel(player)),
    };
  }

  public process(input: InputResponse, player: IPlayer) {
    if (!isSelectInitialCardsResponse(input)) {
      throw new InputError('Not a valid SelectInitialCardsResponse');
    }
    if (input.responses.length !== this.options.length) {
      throw new InputError('Incorrect options provided');
    }
    for (let i = 0; i < input.responses.length; i++) {
      player.runInput(input.responses[i], this.options[i]);
    }
    return this.cb(undefined);
  }
}
