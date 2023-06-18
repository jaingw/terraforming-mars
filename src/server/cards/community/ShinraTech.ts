import {Tag} from '../../../common/cards/Tag';
import {Player} from '../../Player';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {played} from '../Options';
import {Resource} from '../../../common/Resource';

export class ShinraTech extends Card implements ICorporationCard {
  constructor() {
    super({
      type: CardType.CORPORATION,
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
              eb.energy(1, {played}).asterix().startEffect.production((pb) => pb.megacredits(2));
            });
          });
        }),
      },
    });
  }

  public onCardPlayed(player: Player, card: IProjectCard) {
    return this._onCardPlayed(player, card);
  }
  private _onCardPlayed(player: Player, card: IProjectCard | ICorporationCard) {
    if (player.isCorporation(this.name)) {
      for (const tag of card.tags) {
        if (tag === Tag.POWER) {
          player.production.add(Resource.MEGACREDITS, 2, {log: true});
        }
      }
    }
  }

  public onCorpCardPlayed(player: Player, card:ICorporationCard) {
    this.onCardPlayed(player, card as unknown as IProjectCard);
    return undefined;
  }

  public override bespokePlay(player: Player) {
    player.production.add(Resource.ENERGY, 2);
    player.production.add(Resource.MEGACREDITS, 2);
    player.drawCard(1, {tag: Tag.POWER});
    return undefined;
  }
}
