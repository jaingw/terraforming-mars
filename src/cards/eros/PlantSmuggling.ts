import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Tags} from '../../common/cards/Tags';
import {Resources} from '../../common/Resources';
import {CardRequirements} from '../CardRequirements';

export class PlantSmuggling extends Card implements IProjectCard {
  constructor() {
    super({
      cost: 14,
      tags: [Tags.BUILDING, Tags.PLANT],
      name: CardName.PLANT_SMUGGLING,
      cardType: CardType.ACTIVE,

      requirements: CardRequirements.builder((b) => b.colonies()),
      metadata: {
        cardNumber: 'Q036',
        renderData: CardRenderer.builder((b) => {
          b.trade().text(':').plants(1).br.br;
          b.production((pb) => pb.megacredits(2));
        }),
        description: 'Requires a colony. Increase your MC production 2 step. When any player trades, you gain 1 plant.',
        victoryPoints: 1,
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

  public play(player: Player) {
    player.addProduction(Resources.MEGACREDITS, 2);
    return undefined;
  }
}
