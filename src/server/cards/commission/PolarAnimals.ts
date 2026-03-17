import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {IPlayer} from '../../IPlayer';
import {CardResource} from '../../../common/CardResource';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {ICard} from '../ICard';
import {TileType} from '../../../common/TileType';
import {PlaceTile} from '../../deferredActions/PlaceTile';
import {SelectAmount} from '../../inputs/SelectAmount';
import {Resource} from '../../../common/Resource';

export class PolarAnimals extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.POLAR_ANIMALS,
      type: CardType.ACTIVE,
      tags: [Tag.ANIMAL, Tag.MARS],
      cost: 10,
      resourceType: CardResource.ANIMAL,
      requirements: {temperature: -16, max: true},

      metadata: {
        cardNumber: 'XB60',
        description: 'Requires max -16°C. Place an animal tile on any land space.',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you play an animal or Mars tag INCLUDING THESE, add 1 animal to this card.', (eb) => {
            eb.tag(Tag.ANIMAL).slash().tag(Tag.MARS).startEffect.resource(CardResource.ANIMAL);
          }).br;
          b.action('Remove any number of animals here to gain equal M€.', (eb) => {
            eb.text('x').resource(CardResource.ANIMAL).startAction.megacredits(1, {text: 'x'});
          }).br;
          b.tile(TileType.ECOLOGICAL_ZONE, false, true);
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.game.defer(
      new PlaceTile(player, {
        tile: {tileType: TileType.ECOLOGICAL_ZONE, card: this.name},
        on: () => player.game.board.getAvailableSpacesOnLand(player),
        title: 'Select space for animal tile',
      }));
    return undefined;
  }

  public onCardPlayed(player: IPlayer, card: ICard): void {
    const qty = player.tags.cardTagCount(card, [Tag.ANIMAL, Tag.MARS]);
    player.addResourceTo(this, {qty, log: true});
  }

  public canAct(): boolean {
    return this.resourceCount > 0;
  }

  public action(player: IPlayer) {
    return new SelectAmount(
      'Remove any number of animals to gain equal M€',
      'Remove animals',
      1,
      this.resourceCount,
      true,
    ).andThen((amount) => {
      player.removeResourceFrom(this, amount, {log: false});
      player.stock.add(Resource.MEGACREDITS, amount, {log: true, from: {card: this}});
      player.game.log('${0} removed ${1} animals from ${2} to gain ${3} M€', (b) =>
        b.player(player).number(amount).card(this).number(amount));
      return undefined;
    });
  }
}
