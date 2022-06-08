import {IProjectCard} from './../IProjectCard';
import {Player} from '../../Player';
import {IActionCard} from './../ICard';
import {CardRequirements} from '../CardRequirements';
import {CardRenderer} from '../render/CardRenderer';
import {DrawCards} from '../../deferredActions/DrawCards';
import {Card} from '../Card';
import {digit, all} from '../Options';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Tags} from '../../common/cards/Tags';

export class Ansible extends Card implements IActionCard, IProjectCard {
  constructor() {
    super({
      cardType: CardType.ACTIVE,
      name: CardName.ANSIBLE,
      tags: [Tags.SCIENCE],
      cost: 18,
      victoryPoints: 2,

      requirements: CardRequirements.builder((b) => b.tag(Tags.SCIENCE, 6)),
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

  public override canPlay(player: Player): boolean {
    return player.getTagCount(Tags.SCIENCE) >= 6;
  }

  public play() {
    return undefined;
  }

  public canAct(_player: Player): boolean {
    return true;
  }

  public action(player: Player) {
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

