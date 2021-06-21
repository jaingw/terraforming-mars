import {IProjectCard} from '../IProjectCard';
import {Tags} from '../Tags';
import {CardType} from '../CardType';
import {Player} from '../../Player';
import {Resources} from '../../Resources';
import {CardName} from '../../CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardRequirements} from '../CardRequirements';
import {Card} from '../Card';

export class SisterPlanetSponsors extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.SISTER_PLANET_SPONSORS,
      cardType: CardType.AUTOMATED,
      tags: [Tags.VENUS, Tags.EARTH],
      cost: 12,

      requirements: CardRequirements.builder((b) => b.tag(Tags.VENUS).tag(Tags.EARTH)),
      metadata: {
        cardNumber: 'Q05',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(4).nbsp.megacredits(1).any.asterix());
        }),
        description: 'Requires Venus and Earth tags. Increase your M€ production 4 steps. ALL OPPONENTS increase their M€ production 1 step.',
        victoryPoints: 1,
      },
    });
  };
  public canPlay(player: Player): boolean {
    return player.checkMultipleTagPresence([Tags.VENUS, Tags.EARTH]);
  }
  public play(player: Player) {
    player.addProduction(Resources.MEGACREDITS, 3);
    for (const everyPlayer of player.game.getPlayers()) {
      everyPlayer.addProduction(Resources.MEGACREDITS, 1);
    }
    return undefined;
  }
  public getVictoryPoints(): number {
    return 1;
  }
}

