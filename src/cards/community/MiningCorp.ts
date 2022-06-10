import {Tags} from '../../common/cards/Tags';
import {Player} from '../../Player';
import {Card} from '../Card';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Resources} from '../../common/Resources';
import {Size} from '../../common/cards/render/Size';
import {digit} from '../../cards/Options';
export class MiningCorp extends Card implements ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName.MINING_CORP,
      tags: [Tags.ENERGY, Tags.BUILDING],
      startingMegaCredits: 25,

      metadata: {
        cardNumber: 'XUEBAO4',
        description: 'You start with 1 energy and steel production, 25 M€ and 10 steel. Draw 3 building cards.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.production((pb) => pb.energy(1).steel(1)).megacredits(25).steel(10, {digit}).cards(3, {secondaryTag: Tags.BUILDING, digit});
          b.corpBox('effect', (ce) => {
            ce.effect('Your steel resources are worth 1 M€ extra.', (eb) => {
              eb.steel(1).startEffect.plus(Size.SMALL).megacredits(1);
            });
          });
        }),
      },
    });
  }

  public play(player: Player) {
    player.addResource(Resources.STEEL, 10);
    player.addProduction(Resources.ENERGY, 1);
    player.addProduction(Resources.STEEL, 1);
    player.drawCard(3, {tag: Tags.BUILDING});
    player.increaseSteelValue();
    return undefined;
  }
}
