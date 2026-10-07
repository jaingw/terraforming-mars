import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {ICorporationCard} from '../corporation/ICorporationCard';

export class SolBank extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.SOLBANK,
      startingMegaCredits: 40,
      resourceType: CardResource.DATA,

      metadata: {
        cardNumber: 'PfC13',
        description: 'You start with 40 M€',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).br;
          b.effect('Whenever you spend M€ (or steel or titanium) add 1 data to this card.', (eb) =>
            eb.minus().megacredits(1).slash().steel(1).slash().titanium(1).startEffect.resource(CardResource.DATA));
          b.br;
          b.effect('During the production phase convert each data from this card into 1M€ each.', (eb) => eb.resource(CardResource.DATA).asterix().startEffect.megacredits(1));
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer): undefined {
    if (player.megaCredits === 0) {
      player.megaCredits = this.startingMegaCredits - player.cardsInHand.length * player.cardCost;
      if (player.cardsInHand.length > 0) {
        player.addResourceTo(this, {log: true});
      }
    }
    return undefined;
  }

  // Behavior is in Pathfinders.addToSolBank.
  public onProductionPhase(player: IPlayer): undefined {
    player.megaCredits += this.resourceCount;
    this.resourceCount = 0;
    return undefined;
  }
}
