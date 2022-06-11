import {Card} from '../Card';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {Tags} from '../../common/cards/Tags';
import {Player} from '../../Player';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {ResourceType} from '../../common/ResourceType';
import {ICard} from '../../cards/ICard';

export class Protogen extends Card implements ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName.PROTOGEN,
      tags: [Tags.MICROBE],
      startingMegaCredits: 47,

      initialActionText: 'Draw 1 card with a microbe tag',
      metadata: {
        cardNumber: 'XUEBAO06',
        description: 'You start with 47 M€. As your first action, draw 1 card with a microbe tag.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br;
          b.megacredits(47).cards(1, {secondaryTag: Tags.MICROBE});
          b.corpBox('effect', (ce) => {
            ce.effect('When you gain microbes in one action, also gain 2 heat.', (eb) => {
              eb.microbes(1).asterix().startEffect.heat(2);
            });
          });
        }),
      },
    });
  }

  public play() {
    return undefined;
  }

  public initialAction(player: Player) {
    player.drawCard(1, {tag: Tags.MICROBE});
    return undefined;
  }
  public onResourceAdded(player: Player, card: ICard) {
    if (card.resourceType === ResourceType.MICROBE) {
      player.heat += 2;
    }
  }
}
