import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {Player} from '../../Player';
import {CardRenderer} from '../render/CardRenderer';
import {played} from '../Options';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Tags} from '../../common/cards/Tags';

export class StarCoreMining extends Card implements IProjectCard {
  constructor() {
    super({
      cardType: CardType.ACTIVE,
      name: CardName.STARCORE_MINING,
      tags: [Tags.PLANT, Tags.ENERGY, Tags.SPACE, Tags.BUILDING],
      cost: 32,
      victoryPoints: 2,
      metadata: {
        cardNumber: 'Q07',
        renderData: CardRenderer.builder((b) => {
          b.effect(undefined, (eb) => {
            eb.startEffect.plants(1, {played}).slash().energy(1, {played}).slash().space( {played}).slash().building(1, {played});
          }).br;
          b.effect(undefined, (eb) => {
            eb.empty().startEffect;
          }).br;
          b.effect('When you play a Plant, Energy, Space or Building tag, including these, gain related resource.', (eb) => {
            eb.startEffect.plants(1).slash().energy(1).slash().titanium(1).slash().steel(1);
          }).br;
        }),
      },
    });
  }
  public onCardPlayed(player: Player, card: IProjectCard) {
    const plantCount = card.tags.filter((tag) => tag === Tags.PLANT).length;
    plantCount !== 0 ? player.plants += plantCount : 0;
    const energyCount = card.tags.filter((tag) => tag === Tags.ENERGY).length;
    energyCount !== 0 ? player.energy += energyCount : 0;
    const spaceCount = card.tags.filter((tag) => tag === Tags.SPACE).length;
    spaceCount !== 0 ? player.titanium += spaceCount : 0;
    const buildingCount = card.tags.filter((tag) => tag === Tags.BUILDING).length;
    buildingCount !== 0 ? player.steel += buildingCount : 0;
    return undefined;
  }

  public play() {
    return undefined;
  }
}
