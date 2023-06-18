import {Player} from '../../Player';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {Tag} from '../../../common/cards/Tag';
// import {Size} from '../../../common/cards/render/Size';
import {played, digit} from '../Options';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {ISpace} from '../../boards/ISpace';
import {Board} from '../../boards/Board';
import {SelectSpace} from '../../inputs/SelectSpace';
import {IProjectCard} from '../../cards/IProjectCard';
import {Resource} from '../../../common/Resource';
import {ICard} from '../../cards/ICard';
import {CardResource} from '../../../common/CardResource';

export class BuyNLarge extends Card implements ICorporationCard {
  constructor() {
    super({
      type: CardType.CORPORATION,
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

  public initialAction(player: Player) {
    return new SelectSpace('Select space for greenery tile',
      player.game.board.getAvailableSpacesForGreenery(player), (space: ISpace) => {
        player.game.addGreenery(player, space);

        player.game.log('${0} placed a Greenery tile', (b) => b.player(player));

        return undefined;
      });
  }

  public onCardPlayed(player: Player, card: IProjectCard) {
    if (player.isCorporation(this.name)) {
      for (const tag of card.tags) {
        if (tag === Tag.ANIMAL || tag === Tag.PLANT || tag === Tag.MICROBE) {
          player.addResourceTo(this, {log: true});
        }
      }
    }
  }

  public onCorpCardPlayed(player: Player, card:ICorporationCard) {
    this.onCardPlayed(player, card as unknown as IProjectCard);
    return undefined;
  }

  public onTilePlaced(cardOwner: Player, activePlayer: Player, space: ISpace) {
    if (cardOwner.id !== activePlayer.id) {
      return;
    }
    if (Board.isGreenerySpace(space)) {
      cardOwner.addResourceTo(this, {log: true});
    }
  }

  public onResourceAdded(player: Player, playedCard: ICard) {
    if (playedCard.name !== this.name) return;
    if (this.resourceCount >= 6) {
      const delta = Math.floor(this.resourceCount / 6);
      const deducted = delta * 6;
      this.resourceCount -= deducted;
      player.addResource(Resource.PLANTS, 8*delta, {log: true});
      player.game.log('${0} removed ${1} seeds from ${2} to gain ${3} plants.',
        (b) => b.player(player).number(deducted).card(this).number(8*delta));
    }
  }
}

