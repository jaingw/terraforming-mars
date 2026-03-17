import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {RemoveResourcesFromCard} from '../../deferredActions/RemoveResourcesFromCard';

export class Omnivore extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.OMNIVORE,
      type: CardType.ACTIVE,
      tags: [Tag.ANIMAL, Tag.MICROBE],
      cost: 8,

      metadata: {
        cardNumber: 'XB61',
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 microbe from any card to gain 5 M€, or spend 1 animal from any card to gain 7 M€.', (eb) => {
            eb.resource(CardResource.MICROBE).startAction.megacredits(5);
          }).br;
          b.or().br;
          b.action(undefined, (eb) => {
            eb.resource(CardResource.ANIMAL).startAction.megacredits(7);
          });
        }),
      },
    });
  }

  private microbeCards(player: IPlayer) {
    return player.getCardsWithResources(CardResource.MICROBE);
  }

  private animalCards(player: IPlayer) {
    return player.getCardsWithResources(CardResource.ANIMAL);
  }

  public canAct(player: IPlayer): boolean {
    return this.microbeCards(player).length > 0 || this.animalCards(player).length > 0;
  }

  public action(player: IPlayer) {
    const hasMicrobes = this.microbeCards(player).length > 0;
    const hasAnimals = this.animalCards(player).length > 0;

    const spendMicrobe = new SelectOption('Spend 1 microbe to gain 5 M€', 'Spend microbe')
      .andThen(() => {
        player.game.defer(
          new RemoveResourcesFromCard(player, CardResource.MICROBE, 1, {source: 'self', blockable: false})
            .andThen((response) => {
              if (response.proceed) {
                player.stock.add(Resource.MEGACREDITS, 5, {log: true});
              }
            }));
        return undefined;
      });

    const spendAnimal = new SelectOption('Spend 1 animal to gain 7 M€', 'Spend animal')
      .andThen(() => {
        player.game.defer(
          new RemoveResourcesFromCard(player, CardResource.ANIMAL, 1, {source: 'self', blockable: false})
            .andThen((response) => {
              if (response.proceed) {
                player.stock.add(Resource.MEGACREDITS, 7, {log: true});
              }
            }));
        return undefined;
      });

    if (hasMicrobes && hasAnimals) {
      return new OrOptions(spendMicrobe, spendAnimal);
    }
    if (hasMicrobes) {
      spendMicrobe.cb(undefined);
      return undefined;
    }
    spendAnimal.cb(undefined);
    return undefined;
  }
}
