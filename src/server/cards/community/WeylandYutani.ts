import {Tag} from '../../../common/cards/Tag';
import {Player} from '../../Player';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {all, played} from '../Options';
import {Resources} from '../../../common/Resources';

export class WeylandYutani extends Card implements ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName.WEYLAND_YUTANI,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 42,

      metadata: {
        cardNumber: 'XB01',
        description: 'You start with 40 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.LARGE);
            ce.effect('when a science tag is played, you gain 2 M€.', (eb) => {
              eb.science(1, {played, all}).startEffect;
              eb.megacredits(2);
            });
          });
        }),
      },
    });
  }


  public onCardPlayed(player: Player, card: IProjectCard) {
    return this._onCardPlayed(player, card);
  }

  public onCorpCardPlayed(player: Player, card: ICorporationCard) {
    this._onCardPlayed(player, card);
    return undefined;
  }

  private _onCardPlayed(player: Player, card: IProjectCard | ICorporationCard) {
    for (const tag of card.tags) {
      if (tag === Tag.SCIENCE) {
        player.game.getCardPlayer(this.name)?.addResource(Resources.MEGACREDITS, 2, {log: true});
      }
    }
  }
}
