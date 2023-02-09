import {Tag} from '../../../common/cards/Tag';
import {Player} from '../../Player';
import {PreludeCard} from '../prelude/PreludeCard';
import {IProjectCard} from '../IProjectCard';
import {CardName} from '../../../common/cards/CardName';
import {TurmoilUtil} from '../../turmoil/TurmoilUtil';
import {CardRenderer} from '../render/CardRenderer';

export class ByElection extends PreludeCard implements IProjectCard {
  constructor() {
    super({
      name: CardName.BY_ELECTION,
      tags: [Tag.WILD],

      metadata: {
        cardNumber: 'Y02',
        renderData: CardRenderer.builder((b) => {
          b.rulingParty().plus().influence();
        }),
        description: 'Set the ruling party to one of your choice. Gain 1 influence.',
      },
    });
  }
  public override bespokePlay(player: Player) {
    const turmoil = TurmoilUtil.getTurmoil(player.game);
    turmoil.addInfluenceBonus(player);
    turmoil.chooseRulingParty(player);

    return undefined;
  }
}
