import {Tags} from '../../Tags';
import {Player} from '../../../Player';
import {CorporationCard} from '../../corporation/CorporationCard';
import {ISpace} from '../../../boards/ISpace';
import {Resources} from '../../../Resources';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';
import {CardMetadata} from '../../CardMetadata';
import {CardRenderer} from '../../render/CardRenderer';
import {Size} from '../../render/Size';
import {SelectSpace} from '../../../inputs/SelectSpace';
import {Board} from '../../../boards/Board';
import {GainProduction} from '../../../deferredActions/GainProduction';
import {GainResources} from '../../../deferredActions/GainResources';
import {Priority} from '../../../deferredActions/DeferredAction';

export class _TharsisRepublic_ implements CorporationCard {
    public name = CardName._THARSIS_REPUBLIC_;
    public tags = [Tags.BUILDING];
    public startingMegaCredits: number = 40;
    public cardType = CardType.CORPORATION;

    public initialActionText: string = 'Place a city tile';
    public initialAction(player: Player) {
      return new SelectSpace('Select space on mars for city tile', player.game.board.getAvailableSpacesForCity(player), (space: ISpace) => {
        player.game.addCityTile(player, space.id);
        player.game.log('${0} placed a City tile', (b) => b.player(player));
        return undefined;
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

    public play(player: Player) {
      if (player.game.getPlayers().length === 1) {
        // Get bonus for 2 neutral cities
        player.addProduction(Resources.MEGACREDITS, 2);
      }
      return undefined;
    }
    public metadata: CardMetadata = {
      cardNumber: 'R31',
      description: 'You start with 40 M€. As your first action in the game,place a city tile.',
      renderData: CardRenderer.builder((b) => {
        b.br.br;
        b.megacredits(40).nbsp.city();
        b.corpBox('effect', (ce) => {
          ce.effect('When any city tile is placed, increase your M€ production 1 step. When you place a city tile, gain 3 M€.', (eb) => {
            eb.city(Size.SMALL).any.asterix().colon();
            eb.production((pb) => pb.megacredits(1)).nbsp;
            eb.city(Size.SMALL).startEffect.megacredits(3);
          });
        });
      }),
    }
}
