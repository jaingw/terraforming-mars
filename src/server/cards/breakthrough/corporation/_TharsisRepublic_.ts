import {IPlayer} from '../../../IPlayer';
import {Space} from '../../../boards/Space';
import {CardRenderer} from '../../render/CardRenderer';
import {Board} from '../../../boards/Board';
import {GainProduction} from '../../../deferredActions/GainProduction';
import {GainResources} from '../../../deferredActions/GainResources';
import {all} from '../../Options';
import {CardName} from '../../../../common/cards/CardName';
import {Size} from '../../../../common/cards/render/Size';
import {Tag} from '../../../../common/cards/Tag';
import {Resource} from '../../../../common/Resource';
import {CorporationCard} from '../../corporation/CorporationCard';
import {Priority} from '../../../deferredActions/Priority';

export class _TharsisRepublic_ extends CorporationCard {
  constructor() {
    super({
      name: CardName._THARSIS_REPUBLIC_,
      tags: [Tag.BUILDING],
      startingMegaCredits: 40,
      firstAction: {
        text: 'Place a city tile',
        city: {},
      },
      metadata: {
        cardNumber: 'R31',
        description: 'You start with 40 M€. As your first action in the game,place a city tile.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40).nbsp.city();
          b.corpBox('effect', (ce) => {
            ce.effect('When any city tile is placed, increase your M€ production 1 step. When you place a city tile, gain 3 M€.', (eb) => {
              eb.city({size: Size.SMALL, all}).asterix().colon();
              eb.production((pb) => pb.megacredits(1)).nbsp;
              eb.city({size: Size.SMALL}).startEffect.megacredits(3);
            });
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    if (Board.isCitySpace(space)) {
      if (cardOwner.id === activePlayer.id) {
        cardOwner.game.defer(new GainResources(cardOwner, Resource.MEGACREDITS, {count: 3}));
      }
      cardOwner.game.defer(
        new GainProduction(cardOwner, Resource.MEGACREDITS),
        cardOwner.id !== activePlayer.id ? Priority.OPPONENT_TRIGGER : undefined,
      );
    }
    return;
  }

  public override bespokePlay(player: IPlayer) {
    if (player.game.getPlayers().length === 1) {
      // Get bonus for 2 neutral cities
      player.production.add(Resource.MEGACREDITS, 2);
    }
    return undefined;
  }
}
