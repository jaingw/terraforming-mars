import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {all, played} from '../Options';
import {Resource} from '../../../common/Resource';
import {CorporationCard} from '../corporation/CorporationCard';

export class WeylandYutani extends CorporationCard {
  constructor() {
    super({
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


  public onCardPlayed(player: IPlayer, card: IProjectCard) {
    return this._onCardPlayed(player, card);
  }

  public onCorpCardPlayed(player: IPlayer, card: ICorporationCard) {
    this._onCardPlayed(player, card);
    return undefined;
  }

  private _onCardPlayed(player: IPlayer, card: IProjectCard | ICorporationCard) {
    for (const tag of card.tags) {
      if (tag === Tag.SCIENCE) {
        player.game.getCardPlayerOrThrow(this.name)?.stock.add(Resource.MEGACREDITS, 2, {log: true});
      }
    }
  }
}
