import {Player} from '../../Player';
import {CardType} from '../../common/cards/CardType';
import {CardName} from '../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {Tags} from '../../common/cards/Tags';
// import {Size} from '../../common/cards/render/Size';
import {played, digit} from '../Options';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {ResourceType} from '../../common/ResourceType';
import {ISpace} from '../../boards/ISpace';
import {Board} from '../../boards/Board';
import {SelectSpace} from '../../inputs/SelectSpace';
import {IProjectCard} from '../../cards/IProjectCard';
import {Resources} from '../../common/Resources';
import {ICard} from '../../cards/ICard';

export class BuyNLarge extends Card implements ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName.BUY_N_LARGE,
      tags: [Tags.PLANT],
      startingMegaCredits: 35,
      resourceType: ResourceType.SEED,

      metadata: {
        cardNumber: 'XUEBAO08',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(35).greenery().br;
          b.effect('When you place a greenery tile or play a biology tag, add 1 seed resource to this card.', (eb) => {
            eb.greenery().slash().animals(1, {played}).slash().plants(1, {played}).slash().microbes(1, {played}).startEffect.seed();
          }).br;
          b.effect('When you have 8 seeds, automatically convert to 8 plants.', (eb) => {
            eb.text('8').seed().asterix().startAction.plants(8, {digit});
          }).br;
        }),
        description: 'You start with 35M€. As your first action, place a greenery.',
      },
    });
  }

  public override resourceCount = 0;

  public play() {
    this.resourceCount += 1;
    return undefined;
  }

  public initialAction(player: Player) {
    return new SelectSpace('Select space for greenery tile',
      player.game.board.getAvailableSpacesForGreenery(player), (space: ISpace) => {
        player.game.addGreenery(player, space.id);

        player.game.log('${0} placed a Greenery tile', (b) => b.player(player));

        return undefined;
      });
  }

  public onCardPlayed(player: Player, card: IProjectCard) {
    if (player.corpName(this.name)) {
      for (const tag of card.tags) {
        if (tag === Tags.ANIMAL || tag === Tags.PLANT || tag === Tags.MICROBE) {
          player.addResourceTo(this, {log: true});
        }
      }
    }
  }

  public onCorpCardPlayed(player: Player, card: ICorporationCard) {
    return this.onCardPlayed(player, card as unknown as IProjectCard);
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
    if (this.resourceCount >= 8) {
      const delta = Math.floor(this.resourceCount / 8);
      const deducted = delta * 8;
      this.resourceCount -= deducted;
      player.addResource(Resources.PLANTS, 8*delta, {log: true});
      player.game.log('${0} removed ${1} seeds from ${2} to gain ${3} plants.',
        (b) => b.player(player).number(deducted).card(this).number(8*delta));
    }
  }
}

