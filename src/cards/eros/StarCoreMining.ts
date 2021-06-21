import {IProjectCard} from '../IProjectCard';
import {Tags} from '../Tags';
import {Card} from '../Card';
import {CardType} from '../CardType';
import {Player} from '../../Player';
import {CardName} from '../../CardName';
import {CardRenderer} from '../render/CardRenderer';

export class StarCoreMining extends Card implements IProjectCard {
  constructor() {
    super({
      cardType: CardType.ACTIVE,
      name: CardName.STARCORE_MINING,
      tags: [Tags.PLANT, Tags.ENERGY, Tags.SPACE, Tags.BUILDING],
      cost: 32,
      metadata: {
        cardNumber: 'Q07',
        renderData: CardRenderer.builder((b) => {
          b.plants(1).played.slash().energy(1).played.slash().space().played.slash().building(1).played.startEffect.br;
          b.plants(1).slash().energy(1).slash().titanium(1).slash().steel(1).br;
        }),
        description: 'When you play a Plant, Energy, Space or Building tag, including these, gain related resource.',
        victoryPoints: 2,
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

  public getVictoryPoints(_player: Player) {
    return 2;
  }
}
