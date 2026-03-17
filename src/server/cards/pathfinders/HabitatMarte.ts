import {CorporationCard} from '../corporation/CorporationCard';
import {Tag} from '../../../common/cards/Tag';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';

export class HabitatMarte extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.HABITAT_MARTE,
      tags: [Tag.MARS],
      startingMegaCredits: 40,

      metadata: {
        cardNumber: 'PfC22',
        description: 'You start with 40 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40);
          b.corpBox('effect', (ce) => {
            ce.effect('Mars tags also count as science tags.', (eb) => {
              eb.tag(Tag.MARS).startEffect.tag(Tag.SCIENCE);
            });
          });
        }),
      },
    });
  }
  // Behavior in Player.getTagCount

  // 触发科标联动， 如火星大学等， 但是目前proxy卡牌不触发onCardPlayed联动

  // public onCardPlayedForCorps(player: IPlayer, card: ICard): void {

  //   const qty = card.tags.filter((cardTag) => cardTag === Tag.MARS).length;
  //   console.log('onCardPlayedForCorps', card.name, qty);
  //   if (qty > 0) {
  //     for(let i = 0; i < qty; i++) {
  //       player.playCard(new ScienceTagCard(), undefined, 'nothing');
  //     }
  //   }
  // }

  public onCardPlayedForCorps(player: IPlayer, card: ICard): void {
    const qty = card.tags.filter((cardTag) => cardTag === Tag.MARS).length;
    if (qty > 0) {
      for (let i = 0; i < qty; i++) {
        // 触发建造者自己的卡片效果
        for (const card of player.tableau) {
          // 如果本人有WEYLAND_YUTANI， 确保触发WEYLAND_YUTANI的两次效果
          card.onNonCardTagAdded?.(player, Tag.SCIENCE, player);
        }
        // WeylandYutani特殊处理：需要监听所有玩家的Leavitt建造行为
        for (const cardOwner of player.game.players) {
          if (cardOwner !== player && cardOwner.tableau.has(CardName.WEYLAND_YUTANI)) {
            const weylandCard = cardOwner.tableau.get(CardName.WEYLAND_YUTANI);
            (weylandCard as any).onNonCardTagAdded?.(player, Tag.SCIENCE, cardOwner);
          }
        }
      }
    }
  }
}
