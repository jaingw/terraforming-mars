import {IPlayer} from '../../IPlayer';
import {CardRenderer} from '../render/CardRenderer';
import {Board} from '../../boards/Board';
import {GainResources} from '../../deferredActions/GainResources';
import {CardName} from '../../../common/cards/CardName';
import {Size} from '../../../common/cards/render/Size';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {digit, all} from '../../cards/Options';
import {CorporationCard} from '../corporation/CorporationCard';
import {Space} from '../../boards/Space';

export class CityGreenhouse extends CorporationCard {
  constructor() {
    super({
      name: CardName.CITY_GREENHOUSE,
      tags: [Tag.BUILDING],
      startingMegaCredits: 49,

      metadata: {
        cardNumber: 'XB11',
        description: 'You start 49 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br.br;
          b.megacredits(49);
          b.corpBox('effect', (ce) => {
            ce.effect('When any city tile is placed, gain 6 heat.', (eb) => {
              eb.city({size: Size.MEDIUM, all}).startEffect.heat(6, {digit});
            });
          });
        }),
      },
    });
  }


  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    if (Board.isCitySpace(space)) {
      cardOwner.game.defer(new GainResources(cardOwner, Resource.HEAT, {count: 6}));
      cardOwner.game.log('${0} received 4 Heat from ${1} city', (b) =>
        b.player(cardOwner)
          .player(activePlayer),
      );
    }
    return;
  }

  public override bespokePlay(player: IPlayer) {
    if (player.game.getPlayers().length === 1) {
      // Get bonus for 2 neutral cities
      player.stock.add(Resource.HEAT, 8);
    }
    return undefined;
  }
}
