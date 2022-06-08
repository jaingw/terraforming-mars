
import {Player} from '../../Player';
import {CardRequirements} from '../CardRequirements';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Tags} from '../../common/cards/Tags';

export class InterplanetaryAlliance extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.INTERPLANETARY_ALLIANCE,
      cardType: CardType.AUTOMATED,
      tags: [Tags.VENUS, Tags.JOVIAN, Tags.EARTH],
      cost: 5,
      victoryPoints: 1,

      requirements: CardRequirements.builder((b) => b.tag(Tags.VENUS).tag(Tags.EARTH).tag(Tags.JOVIAN)),
      metadata: {
        description: 'Requires that you have a Venus tag, an Earth tag and a Jovian tag.',
        cardNumber: 'Q03',
      },
    });
  }
  public override canPlay(player: Player): boolean {
    return player.checkMultipleTagPresence([Tags.VENUS, Tags.EARTH, Tags.JOVIAN]);
  }
  public play() {
    return undefined;
  }
}

