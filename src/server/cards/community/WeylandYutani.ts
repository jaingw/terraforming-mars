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
      startingMegaCredits: 50,

      metadata: {
        cardNumber: 'XB01',
        description: 'You start with 50 M€.As your first action, draw 1 card with a science tag.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(50).cards(1, {secondaryTag: Tag.SCIENCE});
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.LARGE);
            ce.effect(undefined, (eb) => {
              eb.science(1, {played, all}).startEffect;
              eb.megacredits(1, {all});
            });
            ce.vSpace();
            ce.effect('when a science tag is played, incl. this, THAT PLAYER gains 1 M€, and you gain 1 M€.', (eb) => {
              eb.science(1, {played, all}).startEffect;
              eb.megacredits(1);
            });
          });
        }),
      },
    });
  }


  public initialAction(player: IPlayer) {
    player.drawCard(1, {tag: Tag.SCIENCE});
    return undefined;
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
        player.stock.add(Resource.MEGACREDITS, 1, {log: true});
        player.game.getCardPlayerOrThrow(this.name)?.stock.add(Resource.MEGACREDITS, 1, {log: true});
      }
    }
  }
}
