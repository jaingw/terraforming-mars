import {Tags} from '../../common/cards/Tags';
import {Player} from '../../Player';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {played} from '../Options';
import {Resources} from '../../common/Resources';

export class ShinraTech extends Card implements ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName.SHINRA_TECH,
      tags: [Tags.ENERGY],
      startingMegaCredits: 39,

      metadata: {
        cardNumber: 'XUEBAO2',
        description: 'You start with 2 energy production and 39 M€. Draw a Energy card.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br;
          b.production((pb) => pb.energy(2)).megacredits(39).cards(1, {secondaryTag: Tags.ENERGY});
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
    if (player.corpName(this.name)) {
      for (const tag of card.tags) {
        if (tag === Tags.SCIENCE) {
          player.game.getCardPlayer(this.name)?.addProduction(Resources.MEGACREDITS, 2, {log: true});
        }
      }
    }
  }
  public play(player: Player) {
    player.addProduction(Resources.ENERGY, 2);
    player.addProduction(Resources.MEGACREDITS, 2);
    player.drawCard(1, {tag: Tags.ENERGY});
    return undefined;
  }
}
