import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {CardRenderer} from '../render/CardRenderer';
import {CardRequirements} from '../CardRequirements';
import {Card} from '../Card';
import {all} from '../Options';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';

export class SisterPlanetSponsors extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.SISTER_PLANET_SPONSORS,
      type: CardType.AUTOMATED,
      tags: [Tag.VENUS, Tag.EARTH],
      cost: 12,
      victoryPoints: 1,

      requirements: CardRequirements.builder((b) => b.tag(Tag.VENUS).tag(Tag.EARTH)),
      metadata: {
        cardNumber: 'Q05',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(4).nbsp.megacredits(1, {all}).asterix());
        }),
        description: 'Requires Venus and Earth tags. Increase your M€ production 4 steps. ALL OPPONENTS increase their M€ production 1 step.',
      },
    });
  }
  public override bespokeCanPlay(player: Player): boolean {
    return player.tags.playerHas([Tag.VENUS, Tag.EARTH]);
  }
  public override bespokePlay(player: Player) {
    player.production.add(Resource.MEGACREDITS, 3);
    for (const everyPlayer of player.game.getPlayers()) {
      everyPlayer.production.add(Resource.MEGACREDITS, 1);
    }
    return undefined;
  }
}

