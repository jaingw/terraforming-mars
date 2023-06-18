
import {Player} from '../../Player';
import {CardRequirements} from '../CardRequirements';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';

export class InterplanetaryAlliance extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.INTERPLANETARY_ALLIANCE,
      type: CardType.AUTOMATED,
      tags: [Tag.VENUS, Tag.JOVIAN, Tag.EARTH],
      cost: 5,
      victoryPoints: 1,

      requirements: CardRequirements.builder((b) => b.tag(Tag.VENUS).tag(Tag.EARTH).tag(Tag.JOVIAN)),
      metadata: {
        description: 'Requires that you have a Venus tag, an Earth tag and a Jovian tag.',
        cardNumber: 'Q03',
      },
    });
  }
  public override bespokeCanPlay(player: Player): boolean {
    return player.tags.playerHas([Tag.VENUS, Tag.EARTH, Tag.JOVIAN]);
  }
}

