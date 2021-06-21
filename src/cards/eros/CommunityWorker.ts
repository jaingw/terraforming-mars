import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {Card} from '../Card';
import {CardType} from '../CardType';
import {CardName} from '../../CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Tags} from '../Tags';

export class CommunityWorker extends Card implements IProjectCard {
  constructor() {
    super({
      cardType: CardType.ACTIVE,
      name: CardName.COMMUNITY_WORKER,
      tags: [],
      cost: 9,

      metadata: {
        cardNumber: 'Q20',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a card WITH NO TAGS, including this, you gain 4M€.', (eb) => {
            eb.noTags().played.startEffect.megacredits(4);
          });
        }),
        victoryPoints: 1,
      },
    });
  }

  public onCardPlayed(player: Player, card: IProjectCard) {
    if (card.cardType !== CardType.EVENT && card.tags.filter((x)=> x!==Tags.WILDCARD).length === 0) {
      player.megaCredits += 4;
    }
  }

  public play() {
    return undefined;
  }
  public getVictoryPoints() {
    return 1;
  }
}

