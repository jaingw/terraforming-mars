import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {IPlayer} from '../../IPlayer';
import {SpaceName} from '../../SpaceName';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Resource} from '../../../common/Resource';
import {CardRenderDynamicVictoryPoints} from '../render/CardRenderDynamicVictoryPoints';

export class Trantor extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.TRANTOR,
      tags: [Tag.SPACE, Tag.CITY],
      cost: 10,
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'Q58',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(2)).br;
          b.city().asterix();
        }),
        description: 'Increase your M€ production 2 steps. Place a city tile IN SPACE, outside and separate from the planet. At the end of the game, if you have most cities not on Mars, gain 3 VPs.',
        victoryPoints: CardRenderDynamicVictoryPoints.trantor(),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.production.add(Resource.MEGACREDITS, 2);
    const space = player.game.board.getSpaceOrThrow(SpaceName.TRANTOR);
    player.game.addCity(player, space);
    return undefined;
  }

  public override getVictoryPoints(player: IPlayer) {
    const game = player.game;
    const trantorCount = game.board.getCitiesOffMars(player);
    return game.getPlayers().some((p) => {
      game.board.getCitiesOffMars(p) > trantorCount;
    }) ? 0 : 3;
  }
}
