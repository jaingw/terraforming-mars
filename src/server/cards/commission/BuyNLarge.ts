import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Tag} from '../../../common/cards/Tag';
// import {Size} from '../../../common/cards/render/Size';
import {digit} from '../Options';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {SelectSpace} from '../../inputs/SelectSpace';
import {Resource} from '../../../common/Resource';
import {ICard} from '../../cards/ICard';
import {CardResource} from '../../../common/CardResource';
import {CorporationCard} from '../corporation/CorporationCard';

/** Number of seeds required to auto-convert to plants */
const SEED_THRESHOLD = 8;
/** Number of plants gained per conversion */
const PLANTS_GAINED = 8;

export class BuyNLarge extends CorporationCard {
  constructor() {
    super({
      name: CardName.BUY_N_LARGE,
      tags: [Tag.PLANT],
      startingMegaCredits: 30,
      resourceType: CardResource.SEED,
      initialActionText: 'Place a greenery',

      metadata: {
        cardNumber: 'XB08',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(30).greenery().br;
          b.effect('When you place a greenery tile or play a biology tag, add 1 seed resource to this card.', (eb) => {
            eb.greenery().slash().tag(Tag.ANIMAL).slash().tag(Tag.PLANT).slash().tag(Tag.MICROBE).startEffect.resource(CardResource.SEED);
          }).br;
          b.effect(`When you have ${SEED_THRESHOLD} seeds, automatically convert to ${PLANTS_GAINED} plants.`, (eb) => {
            eb.text(String(SEED_THRESHOLD)).resource(CardResource.SEED).asterix().startAction.plants(PLANTS_GAINED, {digit});
          }).br;
        }),
        description: 'You start with 30M€. As your first action, place a greenery.',
      },
    });
  }

  public override initialAction(player: IPlayer) {
    return new SelectSpace('Select space for greenery tile',
      player.game.board.getAvailableSpacesForGreenery(player) ).andThen((space: Space) => {
      player.game.addGreenery(player, space);

      player.game.log('${0} placed a Greenery tile', (b) => b.player(player));

      return undefined;
    });
  }

  public onCardPlayedForCorps(player: IPlayer, card: ICard) {
    if (player.playedCards.has(this.name)) {
      for (const tag of card.tags) {
        if (tag === Tag.ANIMAL || tag === Tag.PLANT || tag === Tag.MICROBE) {
          player.addResourceTo(this, {log: true});
        }
      }
    }
  }


  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    if (cardOwner.id !== activePlayer.id) {
      return;
    }
    if (Board.isGreenerySpace(space)) {
      cardOwner.addResourceTo(this, {log: true});
    }
  }

  public onResourceAdded(player: IPlayer, playedCard: ICard) {
    if (playedCard.name !== this.name) return;
    if (this.resourceCount >= SEED_THRESHOLD) {
      const delta = Math.floor(this.resourceCount / SEED_THRESHOLD);
      const deducted = delta * SEED_THRESHOLD;
      this.resourceCount -= deducted;
      player.stock.add(Resource.PLANTS, PLANTS_GAINED * delta, {log: true});
      player.game.log('${0} removed ${1} seeds from ${2} to gain ${3} plants.',
        (b) => b.player(player).number(deducted).card(this).number(PLANTS_GAINED * delta));
    }
  }
}

