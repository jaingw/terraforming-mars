import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
export class WGPartnership extends PreludeCard {
  constructor() {
    super({
      name: CardName.WG_PARTNERSHIP,
      tags: [Tag.SPACE],
      // startingMegacredits: -0,

      metadata: {
        cardNumber: 'Q101',
        renderData: CardRenderer.builder((b) => {
          b.startEffect.temperature(1).slash().oxygen(1).slash().venus(1).slash().oceans(1, {size: Size.SMALL}).asterix();
        }),
        description: 'You gain the bonus of world government.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    // 标记这张牌的所有者
    player.game.wgPartnershipOwner = player;
    return undefined;
  }
}
