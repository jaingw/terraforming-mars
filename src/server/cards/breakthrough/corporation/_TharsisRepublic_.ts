import {Player} from '../../../Player';
import {ISpace} from '../../../boards/ISpace';
import {CardRenderer} from '../../render/CardRenderer';
import {Board} from '../../../boards/Board';
import {GainProduction} from '../../../deferredActions/GainProduction';
import {GainResources} from '../../../deferredActions/GainResources';
import {Priority} from '../../../deferredActions/DeferredAction';
import {all} from '../../Options';
import {Card} from '../../Card';
import {CardName} from '../../../../common/cards/CardName';
import {CardType} from '../../../../common/cards/CardType';
import {Size} from '../../../../common/cards/render/Size';
import {Tag} from '../../../../common/cards/Tag';
import {Resources} from '../../../../common/Resources';
import {ICorporationCard} from '../../corporation/ICorporationCard';

export class _TharsisRepublic_ extends Card implements ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
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

  public onTilePlaced(cardOwner: Player, activePlayer: Player, space: ISpace) {
    if (Board.isCitySpace(space)) {
      if (cardOwner.id === activePlayer.id) {
        cardOwner.game.defer(new GainResources(cardOwner, Resources.MEGACREDITS, {count: 3}));
      }
      cardOwner.game.defer(
        new GainProduction(cardOwner, Resources.MEGACREDITS),
        cardOwner.id !== activePlayer.id ? Priority.OPPONENT_TRIGGER : undefined,
      );
    }
    return;
  }

  public override bespokePlay(player: Player) {
    if (player.game.getPlayers().length === 1) {
      // Get bonus for 2 neutral cities
      player.production.add(Resources.MEGACREDITS, 2);
    }
    return undefined;
  }
}
