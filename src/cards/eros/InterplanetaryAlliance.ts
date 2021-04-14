
import {Tags} from '../Tags';
import {CardType} from '../CardType';
import {Player} from '../../Player';
import {CardName} from '../../CardName';
import {CardRequirements} from '../CardRequirements';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';

export class InterplanetaryAlliance extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.INTERPLANETARY_ALLIANCE,
      cardType: CardType.AUTOMATED,
      tags: [Tags.VENUS, Tags.JOVIAN, Tags.EARTH],
      cost: 5,

      requirements: CardRequirements.builder((b) => b.tag(Tags.VENUS).tag(Tags.EARTH).tag(Tags.JOVIAN)),
      metadata: {
        description: 'Requires that you have a Venus tag, an Earth tag and a Jovian tag.',
        cardNumber: 'Q03',
        victoryPoints: 1,
      },
    });
  };
  public canPlay(player: Player): boolean {
    return player.checkMultipleTagPresence([Tags.VENUS, Tags.EARTH, Tags.JOVIAN]);
  }
  public play() {
    return undefined;
  }
  public getVictoryPoints(): number {
    return 1;
  }
}

