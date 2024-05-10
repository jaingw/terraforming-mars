import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Tag} from '../../../common/cards/Tag';
// import {Size} from '../../../common/cards/render/Size';
import {played, digit} from '../Options';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {SelectSpace} from '../../inputs/SelectSpace';
import {IProjectCard} from '../../cards/IProjectCard';
import {Resource} from '../../../common/Resource';
import {ICard} from '../../cards/ICard';
import {CardResource} from '../../../common/CardResource';
import {CorporationCard} from '../corporation/CorporationCard';

export class BuyNLarge extends CorporationCard {
  constructor() {
    super({
      name: CardName.BUY_N_LARGE,
      tags: [Tag.PLANT],
      startingMegaCredits: 35,
      resourceType: CardResource.SEED,

      metadata: {
        cardNumber: 'XB08',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(35).greenery().br;
          b.effect('When you place a greenery tile or play a biology tag, add 1 seed resource to this card.', (eb) => {
            eb.greenery().slash().animals(1, {played}).slash().plants(1, {played}).slash().microbes(1, {played}).startEffect.seed();
          }).br;
          b.effect('When you have 6 seeds, automatically convert to 8 plants.', (eb) => {
            eb.text('6').seed().asterix().startAction.plants(8, {digit});
          }).br;
        }),
        description: 'You start with 35M€. As your first action, place a greenery.',
      },
    });
  }

  public override resourceCount = 1;

  public initialAction(player: IPlayer) {
    return new SelectSpace('Select space for greenery tile',
      player.game.board.getAvailableSpacesForGreenery(player) ).andThen((space: Space) => {
      player.game.addGreenery(player, space);

      player.game.log('${0} placed a Greenery tile', (b) => b.player(player));

      return undefined;
    });
  }

  public onCardPlayed(player: IPlayer, card: IProjectCard) {
    if (player.isCorporation(this.name)) {
      for (const tag of card.tags) {
        if (tag === Tag.ANIMAL || tag === Tag.PLANT || tag === Tag.MICROBE) {
          player.addResourceTo(this, {log: true});
        }
      }
    }
  }

  public onCorpCardPlayed(player: IPlayer, card:ICorporationCard) {
    this.onCardPlayed(player, card as unknown as IProjectCard);
    return undefined;
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
    if (this.resourceCount >= 6) {
      const delta = Math.floor(this.resourceCount / 6);
      const deducted = delta * 6;
      this.resourceCount -= deducted;
      player.stock.add(Resource.PLANTS, 8*delta, {log: true});
      player.game.log('${0} removed ${1} seeds from ${2} to gain ${3} plants.',
        (b) => b.player(player).number(deducted).card(this).number(8*delta));
    }
  }
}

