import {IProjectCard} from './../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {IActionCard} from './../ICard';
import {CardRenderer} from '../render/CardRenderer';
import {DrawCards} from '../../deferredActions/DrawCards';
import {Card} from '../Card';
import {digit, all} from '../Options';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';

export class Ansible extends Card implements IActionCard, IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ANSIBLE,
      tags: [Tag.SCIENCE],
      cost: 18,
      victoryPoints: 2,

      requirements: {tag: Tag.SCIENCE, count: 6},
      metadata: {
        cardNumber: 'Q14',
        renderData: CardRenderer.builder((b) => {
          b.action('draw 3 cards. All OPPONENTS draw 1 card.', (eb) => {
            eb.empty().startAction;
            eb.plus().cards(3, {digit}).nbsp.plus().cards(1, {all}).asterix();
          });
        }),
        description: 'Requires 6 science tags.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer): boolean {
    return player.tags.count(Tag.SCIENCE) >= 6;
  }

  public canAct(_player: IPlayer): boolean {
    return true;
  }

  public action(player: IPlayer) {
    const game = player.game;
    // game.defer(new DiscardCards(player));
    game.defer(DrawCards.keepAll(player, 3));
    const otherPlayers = game.getPlayers().filter((p) => p.id !== player.id);
    for (const p of otherPlayers) {
      game.defer(DrawCards.keepAll(p));
    }
    return undefined;
  }
}

