import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {Card} from '../Card';
import {CardType} from '../../common/cards/CardType';
import {CardName} from '../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Tags} from '../../common/cards/Tags';
import {Units} from '../../common/Units';
import {SendDelegateToArea} from '../../deferredActions/SendDelegateToArea';
import {DeclareCloneTag} from '../../pathfinders/DeclareCloneTag';
import {ICloneTagCard} from './ICloneTagCard';
import {PathfindersExpansion} from '../../pathfinders/PathfindersExpansion';
import {TurmoilUtil} from '../../turmoil/TurmoilUtil';

export class LobbyHalls extends Card implements IProjectCard, ICloneTagCard {
  constructor() {
    super({
      cardType: CardType.AUTOMATED,
      name: CardName.LOBBY_HALLS,
      cost: 11,
      productionBox: Units.of({megacredits: 2}),

      metadata: {
        cardNumber: 'PfTBD',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(2)).delegates(1);
        }),
        // TODO(kberg): remove "from reserve" like Cultural Metropolis.
        description: 'Increase your M€ production 2 steps. Place 1 delegate from reserve in any party.',
      },
    });
  }

  public cloneTag: Tags = Tags.CLONE;

  public override get tags(): Array<Tags> {
    return [this.cloneTag, Tags.BUILDING];
  }

  public play(player: Player) {
    player.game.defer(new DeclareCloneTag(player, this, (tag) => PathfindersExpansion.raiseTrack(tag, player, 1)));
    player.adjustProduction(this.productionBox);
    const turmoil = TurmoilUtil.getTurmoil(player.game);
    if (turmoil.getAvailableDelegateCount(player, 'reserve') > 0) {
      player.game.defer(new SendDelegateToArea(player, undefined, {source: 'reserve'}));
    }
    return undefined;
  }
}