import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardRequirements} from '../CardRequirements';

export class PlantSmuggling extends Card implements IProjectCard {
  constructor() {
    super({
      cost: 14,
      tags: [Tag.BUILDING, Tag.PLANT],
      name: CardName.PLANT_SMUGGLING,
      type: CardType.ACTIVE,

      behavior: {
        production: {megacredits: 2},
      },
      victoryPoints: 1,
      requirements: CardRequirements.builder((b) => b.colonies()),
      metadata: {
        cardNumber: 'Q52',
        renderData: CardRenderer.builder((b) => {
          b.trade().text(':').plants(1).br.br;
          b.production((pb) => pb.megacredits(2));
        }),
        description: 'Requires a colony. Increase your MC production 2 step. When any player trades, you gain 1 plant.',

      },
    });
  }


  public override canPlay(player: Player): boolean {
    let coloniesCount: number = 0;
    player.game.colonies.forEach((colony) => {
      coloniesCount += colony.colonies.filter((owner) => owner === player).length;
    });
    return coloniesCount > 0;
  }
}
