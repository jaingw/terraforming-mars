import {Tag} from '../../../common/cards/Tag';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {IActionCard} from '../ICard';
import {PreludeCard} from '../prelude/PreludeCard';
import {IPlayer} from '../../IPlayer';
import {SelectCard} from '../../inputs/SelectCard';
import {message} from '../../logs/MessageBuilder';
import {PreludesExpansion} from '../../preludes/PreludesExpansion';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {IPreludeCard} from '../prelude/IPreludeCard';

export class BoardOfDirectors extends PreludeCard implements IActionCard {
  constructor() {
    super({
      name: CardName.BOARD_OF_DIRECTORS,
      tags: [Tag.EARTH],
      resourceType: CardResource.DIRECTOR,

      behavior: {
        addResources: 4,
      },

      metadata: {
        cardNumber: 'P45',
        renderData: CardRenderer.builder((b) => {
          b.plainText('ACTION: ').arrow().br;
          b.plainText('DRAW 1 PRELUDE CARD: EITHER DISCARD IT, OR PAY 12 M€ AND REMOVE 1 DIRECTOR RESOURCE HERE TO PLAY IT.').br;
          b.resource(CardResource.DIRECTOR, 4);
        }),
        description: 'Add 4 director resources here.',
      },
    });
  }

  public canAct(player: IPlayer) {
    if (!player.canAfford(12)) {
      this.warnings.add('cannotAffordBoardOfDirectors');
    }
    return this.resourceCount > 0 && player.game.preludeDeck.canDraw(1);
  }

  private discard(player: IPlayer, prelude: IPreludeCard) {
    const game = player.game;
    game.log('${0} drew and discarded a prelude', (b) => b.player(player));
    game.log('You drew and discarded ${0}', (b) => b.card(prelude), {reservedFor: player});
    game.preludeDeck.discard(prelude);
  }

  public action(player: IPlayer) {
    const game = player.game;
    const prelude = game.preludeDeck.drawOrThrow(player.game);

    if (player.canAfford(12)) {
      // 检查前序卡是否可以打出
      if (prelude.canPlay?.(player, {cost: 12}) === false) {
        prelude.warnings.add('preludeFizzle');
      }
      // 获取卡片的支付选项，包括可能的TR增加所需的额外费用（红党规则）
      const options = player.affordOptionsForCard(prelude);
      options.cost = 12;
      // 使用公开的canAfford方法检查玩家是否能够负担所有费用，包括红党执政下的额外费用
      if (!player.canAfford(options)) {
        // 如果不能负担全部费用，记录并终止操作
        prelude.warnings.add('preludeFizzle');
      }


      return new SelectCard(
        message('Would you like pay 12 M€ and one Director to play ${0}', (b)=> b.card(prelude)),
        'Buy', [prelude], {min: 0, max: 1}).andThen((selected) => {
        if (selected.length === 1) {
          const card = selected[0];

          game.defer(new SelectPaymentDeferred(player, 12, {title: 'Select how to pay 12 M€'})).andThen(() => {
            player.removeResourceFrom(this, 1);

            // 支付12块之后，再检查一次
            // 获取卡片的支付选项，包括可能的TR增加所需的额外费用（红党规则）
            const options = player.affordOptionsForCard(card);

            // 使用公开的canAfford方法检查玩家是否能够负担所有费用，包括红党执政下的额外费用
            if (!player.canAfford(options)) {
              // 如果不能负担全部费用，记录并终止操作
              game.log('${0} cannot afford to play ${1} due to additional costs (e.g., Reds policy)', (b) => b.player(player).card(card));
              PreludesExpansion.fizzle(player, card);
              return undefined;
            }

            // 如果卡片不能打出，则fizzle
            if (card.canPlay?.(player) === false) {
              PreludesExpansion.fizzle(player, card);
            } else {
              player.playCard(card, undefined, 'add');
            }
            return undefined;
          });
        } else {
          // 付的起12 ， 但是选择弃掉
          this.discard(player, prelude);
        }
        return undefined;
      });
    } else {
      // 12都付不起， 直接弃掉
      this.discard(player, prelude);
    }

    return undefined;
  }
}
