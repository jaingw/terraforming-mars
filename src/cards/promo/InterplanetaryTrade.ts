import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardName} from '../../CardName';
import {CardType} from '../CardType';
import {Tags} from '../Tags';
import {Player} from '../../Player';
import {Resources} from '../../Resources';
import {CardRenderer} from '../../cards/render/CardRenderer';

export class InterplanetaryTrade extends Card implements IProjectCard {
  constructor() {
    super({
      cardType: CardType.AUTOMATED,
      name: CardName.INTERPLANETARY_TRADE,
      tags: [Tags.SPACE],
      cost: 27,

      metadata: {
        cardNumber: 'X05',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(1));
          b.slash().diverseTag();
        }),
        description: 'Increase your M€ production 1 step per different tag you have in play, including this.',
        victoryPoints: 1,
      },
    });
  }

  public play(player: Player) {
    // This card tag is counting as well
    const availableTags = player.getDistinctTagCount(true, Tags.SPACE);
    // Only count wildcards up to the max amount of tag types existing (minus events and wildcards)
    const existingTags = Object.keys(Tags).length - 2;
    // 事件公司的标志上限是12
    if (player.isCorporation(CardName._INTERPLANETARY_CINEMATICS_) && player.playedCards.filter((card) => card.cardType === CardType.EVENT ).length > 0) player.addProduction(Resources.MEGACREDITS, Math.min(availableTags+1, existingTags), {log: true});
    else player.addProduction(Resources.MEGACREDITS, Math.min(availableTags, existingTags), {log: true});
    return undefined;
  }

  public getVictoryPoints() {
    return 1;
  }
}
