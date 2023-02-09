import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {PlayerInput} from '../../PlayerInput';
import {SelectSpace} from '../../inputs/SelectSpace';
import {ISpace} from '../../boards/ISpace';
import {DrawCards} from '../../deferredActions/DrawCards';
import {SimpleDeferredAction} from '../..//deferredActions/DeferredAction';
import {Resources} from '../../../common/Resources';

export class BorderCheckpoint extends Card implements IProjectCard {
  constructor() {
    super({
      cardType: CardType.ACTIVE,
      name: CardName.BORDER_CHECKPOINT,
      tags: [Tag.CITY, Tag.BUILDING],
      cost: 18,

      behavior: {
        production: {energy: -1, megacredits: 2},
      },

      metadata: {
        cardNumber: 'Q54',
        renderData: CardRenderer.builder((b) => {
          b.action('Draw a card from discard pile.', (eb) => {
            eb.empty().startAction.cards(1).asterix();
          }).br;
          b.production((pb) => {
            pb.minus().energy(1).br;
            pb.plus().megacredits(2);
          }).nbsp.city();
        }),
        description: 'Place a city tile on the border.',
      },
    });
  }

  private isOnEdge(x: number, y: number): boolean {
    if (y === 0) return true;
    if (y === 8) return true;
    if (x === 8) return true;
    if (x === (Math.abs(4-y))) return true;
    return false;
  }

  private getAvailableSpaces(player: Player): Array<ISpace> {
    return player.game.board.getAvailableSpacesOnLand(player)
      .filter((space) => space.player === undefined &&
            space.tile === undefined &&
            this.isOnEdge(space.x, space.y));
  }

  private getRandomNum(Min:number, Max:number):number {
    const Range = Max - Min;
    const Rand = Math.random();
    return (Min + Math.round(Rand * Range));
  }


  public override canPlay(player: Player): boolean {
    return player.production.get(Resources.ENERGY) >= 1 && this.getAvailableSpaces(player).length > 0;
  }

  public override bespokePlay(player: Player): PlayerInput {
    return new SelectSpace('Select place on the border', this.getAvailableSpaces(player), (foundSpace: ISpace) => {
      player.game.addCityTile(player, foundSpace);
      return undefined;
    });
  }


  public canAct(player: Player): boolean {
    return player.game.projectDeck.discardPile.length >= 1;
  }


  public action(player: Player) {
    const cardIndex = this.getRandomNum(0, Math.min(4, player.game.projectDeck.discardPile.length));
    const cards: Array<IProjectCard> = player.game.projectDeck.discardPile.splice(cardIndex, 1);
    player.game.defer(new SimpleDeferredAction(player, () => DrawCards.choose(player, cards, {keepMax: 1})));
    player.game.cardDrew = true;
    return undefined;
  }
}
