import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {ColonyName} from '../../../common/colonies/ColonyName';
import {ColoniesHandler} from '../../colonies/ColoniesHandler';
import {BuildColony} from '../../deferredActions/BuildColony';

export class JovianExpedition extends Card implements IProjectCard {
  constructor() {
    super({
      cost: 20,
      tags: [Tag.JOVIAN, Tag.SPACE],
      name: CardName.JOVIAN_EXPEDITION,
      type: CardType.AUTOMATED,
      victoryPoints: 1,

      requirements: {colonies: 1},
      metadata: {
        cardNumber: 'Q08',
        renderData: CardRenderer.builder((b) => {
          b.colonyTile().nbsp.colonies(1);
        }),
        description: 'Requires a colony. Add a colony tile(NOT TITANIA) and place a colony.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer): boolean {
    let coloniesCount: number = 0;
    player.game.colonies.forEach((colony) => {
      coloniesCount += colony.colonies.filter((owner) => owner === player).length;
    });
    return coloniesCount > 0;
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    if (!game.gameOptions.coloniesExtension) return undefined;

    ColoniesHandler.addColonyTile(
      player,
      {title: 'Select colony tile to add', filter: ColonyName.TITANIA, cb: () =>{
        game.defer(new BuildColony(player, {title: 'Select colony for Jovian Expedition'}));
      }},
    );
    return undefined;
  }
}
