import {Player} from '../../Player';
import {PreludeCard} from '../prelude/PreludeCard';
import {IProjectCard} from '../IProjectCard';
import {CardRenderer} from '../render/CardRenderer';
import {CardName} from '../../common/cards/CardName';
import {Tags} from '../../common/cards/Tags';
import {Resources} from '../../common/Resources';
import {Units} from '../../common/Units';

export class NitrateReducers extends PreludeCard implements IProjectCard {
  constructor() {
    super({
      name: CardName.NITRATE_REDUCERS,
      tags: [Tags.VENUS, Tags.MICROBE],
      productionBox: Units.of({megacredits: 3}),
      metadata: {
        cardNumber: 'Y15',
        renderData: CardRenderer.builder((b) => {
          b.cards(2, {secondaryTag: Tags.MICROBE}).br;
          b.production((pb) => pb.megacredits(3));
        }),
        description: 'Draw 2 microbe cards. Increase your M€ production 3 steps.',
      },
    });
  }

  public play(player: Player) {
    player.addProduction(Resources.MEGACREDITS, 3);
    player.drawCard(2, {tag: Tags.MICROBE});
    return undefined;
  }
}

