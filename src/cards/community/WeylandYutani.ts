import {Tags} from '../../common/cards/Tags';
import {Player} from '../../Player';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../common/cards/render/Size';
import {all, played} from '../Options';
import {Resources} from '../../common/Resources';

export class WeylandYutani extends Card implements ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName.WEYLAND_YUTANI,
      tags: [Tags.SCIENCE],
      startingMegaCredits: 51,

      metadata: {
        cardNumber: 'XUEBAO1',
        description: 'You start with 49 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(49);
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
    return this._onCardPlayed(player, card);
  }

  private _onCardPlayed(player: Player, card: IProjectCard | ICorporationCard) {
    for (const tag of card.tags) {
      if (tag === Tags.SCIENCE) {
        player.game.getCardPlayer(this.name)?.addResource(Resources.MEGACREDITS, 2, {log: true});
      }
    }
  }


  public play() {
    return undefined;
  }
}
