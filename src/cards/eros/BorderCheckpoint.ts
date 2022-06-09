import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Tags} from '../../common/cards/Tags';
import {PlayerInput} from '../../PlayerInput';
import {SelectSpace} from '../../inputs/SelectSpace';
import {ISpace} from '../../boards/ISpace';
import {DrawCards} from '../../deferredActions/DrawCards';
import {DeferredAction} from '../..//deferredActions/DeferredAction';

export class BorderCheckpoint extends Card implements IProjectCard {
  constructor() {
    super({
      cardType: CardType.ACTIVE,
      name: CardName.BORDER_CHECKPOINT,
      tags: [Tags.CITY, Tags.BUILDING],
      cost: 18,

      metadata: {
        cardNumber: 'Q36',
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


  // public override canPlay(player: Player): boolean {
  //   return this.getAvailableSpaces(player).length > 0;
  // }

  public play(player: Player): PlayerInput {
    return new SelectSpace('Select place on the border', this.getAvailableSpaces(player), (foundSpace: ISpace) => {
      player.game.addCityTile(player, foundSpace.id);
      return undefined;
    });
  }


  public canAct(player: Player): boolean {
    return player.game.dealer.getDiscardedSize() >= 5;
  }


  public action(player: Player) {
    const cardIndex = this.getRandomNum(0, 4);
    const cards: Array<IProjectCard> = player.game.dealer.discarded.splice(cardIndex, 1);
    player.game.defer(new DeferredAction(player, () => DrawCards.choose(player, cards, {keepMax: 1})));
    return undefined;
  }
}
