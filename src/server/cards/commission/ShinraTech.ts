import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Resource} from '../../../common/Resource';
import {CorporationCard} from '../corporation/CorporationCard';

export class ShinraTech extends CorporationCard {
  constructor() {
    super({
      name: CardName.SHINRA_TECH,
      tags: [Tag.POWER],
      startingMegaCredits: 39,

      metadata: {
        cardNumber: 'XB02',
        description: 'You start with 2 energy production and 39 M€. Draw a Energy card.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br;
          b.production((pb) => pb.energy(2)).megacredits(39).cards(1, {secondaryTag: Tag.POWER});
          b.corpBox('effect', (ce) => {
            ce.effect('When playing a power tag, increase MC production 2 steps', (eb) => {
              eb.tag(Tag.POWER).asterix().startEffect.production((pb) => pb.megacredits(2));
            });
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: IProjectCard) {
    return this._onCardPlayed(player, card);
  }
  private _onCardPlayed(player: IPlayer, card: IProjectCard | ICorporationCard) {
    if (player.isCorporation(this.name)) {
      for (const tag of card.tags) {
        if (tag === Tag.POWER) {
          player.production.add(Resource.MEGACREDITS, 2, {log: true});
        }
      }
    }
  }

  public onCorpCardPlayed(player: IPlayer, card:ICorporationCard) {
    this.onCardPlayed(player, card as unknown as IProjectCard);
    return undefined;
  }

  public override bespokePlay(player: IPlayer) {
    player.production.add(Resource.ENERGY, 2);
    player.production.add(Resource.MEGACREDITS, 2);
    player.drawCard(1, {tag: Tag.POWER});
    return undefined;
  }
}
