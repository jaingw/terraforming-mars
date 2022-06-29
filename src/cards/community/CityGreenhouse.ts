import {Player} from '../../Player';
import {ISpace} from '../../boards/ISpace';
import {CardRenderer} from '../render/CardRenderer';
import {Board} from '../../boards/Board';
import {GainResources} from '../../deferredActions/GainResources';
import {Card} from '../Card';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Size} from '../../common/cards/render/Size';
import {Tags} from '../../common/cards/Tags';
import {Resources} from '../../common/Resources';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {digit, all} from '../../cards/Options';

export class CityGreenhouse extends Card implements ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName.CITY_GREENHOUSE,
      tags: [Tags.BUILDING],
      startingMegaCredits: 49,

      metadata: {
        cardNumber: 'XUEBAO10',
        description: 'You start 49 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br.br;
          b.megacredits(49);
          b.corpBox('effect', (ce) => {
            ce.effect('When any city tile is placed, gain 4 heat.', (eb) => {
              eb.city({size: Size.MEDIUM, all}).startEffect.heat(4, {digit});
            });
          });
        }),
      },
    });
  }


  public onTilePlaced(cardOwner: Player, _activePlayer: Player, space: ISpace) {
    if (Board.isCitySpace(space)) {
      cardOwner.game.defer(new GainResources(cardOwner, Resources.HEAT, {count: 4}));
    }
    return;
  }

  public play() {
    return undefined;
  }
}
