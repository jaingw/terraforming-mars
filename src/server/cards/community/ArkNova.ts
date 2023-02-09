import {Card} from '../Card';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {digit, played} from '../Options';
import {CardResource} from '../../../common/CardResource';
import {Player} from '../../Player';
import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';
import {ICard, VictoryPoints} from '../../cards/ICard';
import {Resources} from '../../../common/Resources';

export class ArkNova extends Card implements ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName.ARK_NOVA,
      tags: [Tag.BUILDING, Tag.CITY],
      startingMegaCredits: 42,
      resourceType: CardResource.ANIMAL,
      victoryPoints: VictoryPoints.tags(Tag.BUILDING, 1, 3),

      metadata: {
        cardNumber: 'XB10',
        description: 'You start with 42 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(42).nbsp.building(1, {played}).slash().cityTag(1, {played}).colon().animals(1).br;
          b.text('(Action: When you play a card with a building or city tag, add 1 animal on this card.)', Size.SMALL, false, false).br;
          b.effect('When you have 3 animals, automatically convert to 1 steel and draw 1 card.', (eb) => {
            eb.text('3').animals(1).asterix().startAction.steel(1, {digit}).cards(1);
          }).br;
        }),
      },
    });
  }

  public override resourceCount = 2;


  public onCardPlayed(player: Player, card: IProjectCard) {
    if (player.isCorporation(this.name)) {
      for (const tag of card.tags) {
        if (tag === Tag.BUILDING || tag === Tag.CITY) {
          player.addResourceTo(this, {log: true});
        }
      }
    }
  }

  public onCorpCardPlayed(player: Player, card: ICorporationCard) {
    this.onCardPlayed(player, card as unknown as IProjectCard);
    return undefined;
  }

  public onResourceAdded(player: Player, playedCard: ICard) {
    const resourceNum = 3;
    if (playedCard.name !== this.name) return;
    if (this.resourceCount >= resourceNum) {
      const delta = Math.floor(this.resourceCount / resourceNum);
      const deducted = delta * resourceNum;
      this.resourceCount -= deducted;
      player.addResource(Resources.STEEL, delta, {log: true});
      player.drawCard(delta);
      player.game.log('${0} removed ${1} animals from ${2} to gain ${3} steels and ${4} cards.',
        (b) => b.player(player).number(deducted).card(this).number(delta).number(delta));
    }
  }
}
