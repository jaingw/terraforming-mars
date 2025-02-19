import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';
import {CardResource} from '../../../common/CardResource';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';
import {ICard} from '../../cards/ICard';
import {Resource} from '../../../common/Resource';
import {CorporationCard} from '../corporation/CorporationCard';

export class ArkNova extends CorporationCard {
  constructor() {
    super({
      name: CardName.ARK_NOVA,
      tags: [Tag.BUILDING, Tag.CITY, Tag.ANIMAL],
      startingMegaCredits: 49,
      resourceType: CardResource.ANIMAL,
      victoryPoints: {tag: Tag.BUILDING, per: 4},

      metadata: {
        cardNumber: 'XB10',
        description: 'You start with 49 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(49).nbsp.tag(Tag.BUILDING).slash().tag(Tag.CITY).colon().resource(CardResource.ANIMAL).br;
          b.text('(Action: When you play a card with a building or city tag, add 1 animal on this card.)', Size.SMALL, false, false).br;
          b.effect('When you have 3 animals, automatically convert to 1 steel and draw 1 card.', (eb) => {
            eb.text('3').resource(CardResource.ANIMAL).asterix().startAction.steel(1, {digit}).cards(1);
          }).br;
        }),
      },
    });
  }

  public override resourceCount = 2;


  public onCardPlayed(player: IPlayer, card: IProjectCard) {
    if (player.isCorporation(this.name)) {
      for (const tag of card.tags) {
        if (tag === Tag.BUILDING || tag === Tag.CITY) {
          player.addResourceTo(this, {log: true});
        }
      }
    }
  }

  public onCorpCardPlayed(player: IPlayer, card: ICorporationCard) {
    this.onCardPlayed(player, card as unknown as IProjectCard);
    return undefined;
  }

  public onResourceAdded(player: IPlayer, playedCard: ICard) {
    const resourceNum = 3;
    if (playedCard.name !== this.name) return;
    if (this.resourceCount >= resourceNum) {
      const delta = Math.floor(this.resourceCount / resourceNum);
      const deducted = delta * resourceNum;
      this.resourceCount -= deducted;
      player.stock.add(Resource.STEEL, delta, {log: true});
      player.drawCard(delta);
      player.game.log('${0} removed ${1} animals from ${2} to gain ${3} steels and ${4} cards.',
        (b) => b.player(player).number(deducted).card(this).number(delta).number(delta));
    }
  }
}
