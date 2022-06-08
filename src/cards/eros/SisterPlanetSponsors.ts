import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {CardRenderer} from '../render/CardRenderer';
import {CardRequirements} from '../CardRequirements';
import {Card} from '../Card';
import {all} from '../Options';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Tags} from '../../common/cards/Tags';
import {Resources} from '../../common/Resources';

export class SisterPlanetSponsors extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.SISTER_PLANET_SPONSORS,
      cardType: CardType.AUTOMATED,
      tags: [Tags.VENUS, Tags.EARTH],
      cost: 12,
      victoryPoints: 1,

      requirements: CardRequirements.builder((b) => b.tag(Tags.VENUS).tag(Tags.EARTH)),
      metadata: {
        cardNumber: 'Q05',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(4).nbsp.megacredits(1, {all}).asterix());
        }),
        description: 'Requires Venus and Earth tags. Increase your M€ production 4 steps. ALL OPPONENTS increase their M€ production 1 step.',
      },
    });
  }
  public override canPlay(player: Player): boolean {
    return player.checkMultipleTagPresence([Tags.VENUS, Tags.EARTH]);
  }
  public play(player: Player) {
    player.addProduction(Resources.MEGACREDITS, 3);
    for (const everyPlayer of player.game.getPlayers()) {
      everyPlayer.addProduction(Resources.MEGACREDITS, 1);
    }
    return undefined;
  }
}

