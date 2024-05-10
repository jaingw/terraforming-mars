import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {played} from '../Options';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';

export class CommunityWorker extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
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

  public onCardPlayed(player: IPlayer, card: IProjectCard) {
    if (card.type !== CardType.EVENT && card.tags.filter((x)=> x!==Tag.WILD).length === 0) {
      player.megaCredits += 4;
    }
  }
}

