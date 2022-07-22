import {IProjectCard} from '../IProjectCard';
import {Tags} from '../../common/cards/Tags';
import {Card} from '../Card';
import {CardType} from '../../common/cards/CardType';
import {Player} from '../../Player';
import {SpaceName} from '../../SpaceName';
import {SpaceType} from '../../common/boards/SpaceType';
import {CardName} from '../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Resources} from '../../common/Resources';

export class Trantor extends Card implements IProjectCard {
  constructor() {
    super({
      cardType: CardType.AUTOMATED,
      name: CardName.TRANTOR,
      tags: [Tags.SPACE, Tags.CITY],
      cost: 10,
      victoryPoints: 3,

      metadata: {
        cardNumber: 'Q042',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(2)).br;
          b.city().asterix();
        }),
        description: 'Increase your M€ production 2 steps. Place a city tile IN SPACE, outside and separate from the planet. At the end of the game, if you have most cities not on Mars, gain 3 VPs.',
      },
    });
  }

  public play(player: Player) {
    player.addProduction(Resources.MEGACREDITS, 2);
    player.game.addCityTile(player, SpaceName.TRANTOR, SpaceType.COLONY);
    return undefined;
  }

  public override getVictoryPoints(player: Player) {
    const trantorCount = player.game.getCitiesCount(player) - player.game.getCitiesCount(player);
    return player.game.getPlayers().some((p) => {
      player.game.getCitiesCount(p) - player.game.getCitiesCount(p) > trantorCount;
    }) ? 0 : 3;
  }
}
