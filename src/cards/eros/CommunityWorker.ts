import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {played} from '../Options';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Tags} from '../../common/cards/Tags';

export class CommunityWorker extends Card implements IProjectCard {
  constructor() {
    super({
      cardType: CardType.ACTIVE,
      name: CardName.COMMUNITY_WORKER,
      tags: [],
      cost: 9,
      victoryPoints: 1,

      metadata: {
        cardNumber: 'Q20',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play a card WITH NO TAGS, including this, you gain 4M€.', (eb) => {
            eb.noTags({played}).startEffect.megacredits(4);
          });
        }),
      },
    });
  }

  public onCardPlayed(player: Player, card: IProjectCard) {
    if (card.cardType !== CardType.EVENT && card.tags.filter((x)=> x!==Tags.WILD).length === 0) {
      player.megaCredits += 4;
    }
  }

  public play() {
    return undefined;
  }
}

