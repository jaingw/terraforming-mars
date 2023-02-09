import {Player} from '../../Player';
import {PreludeCard} from '../prelude/PreludeCard';
import {IProjectCard} from '../IProjectCard';
import {CardRenderer} from '../render/CardRenderer';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';

export class NitrateReducers extends PreludeCard implements IProjectCard {
  constructor() {
    super({
      name: CardName.NITRATE_REDUCERS,
      tags: [Tag.VENUS, Tag.MICROBE],

      behavior: {
        production: {megacredits: 3},
      },

      metadata: {
        cardNumber: 'Y15',
        renderData: CardRenderer.builder((b) => {
          b.cards(2, {secondaryTag: Tag.MICROBE}).br;
          b.production((pb) => pb.megacredits(3));
        }),
        description: 'Draw 2 microbe cards. Increase your M€ production 3 steps.',
      },
    });
  }

  public override bespokePlay(player: Player) {
    player.drawCard(2, {tag: Tag.MICROBE});
    return undefined;
  }
}

