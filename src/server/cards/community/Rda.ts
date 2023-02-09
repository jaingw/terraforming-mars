import {Card} from '../Card';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {Tag} from '../../../common/cards/Tag';
import {Player} from '../../Player';
import {SelectSpace} from '../../inputs/SelectSpace';
import {SpaceType} from '../../../common/boards/SpaceType';
import {ISpace} from '../../boards/ISpace';
import {CardName} from '../../../common/cards/CardName';
import {Priority, SimpleDeferredAction} from '../../deferredActions/DeferredAction';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {BoardType} from '../../boards/BoardType';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {Phase} from '../../../common/Phase';

const VALID_BONUSES: Array<SpaceBonus> = [
  SpaceBonus.TITANIUM,
  SpaceBonus.STEEL,
  SpaceBonus.PLANT,
  SpaceBonus.HEAT,
  SpaceBonus.MEGACREDITS,
  SpaceBonus.ANIMAL,
  SpaceBonus.MICROBE,
  SpaceBonus.ENERGY,
  SpaceBonus.DATA,
  SpaceBonus.SCIENCE,
];

export class Rda extends Card implements ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName.RDA,
      tags: [Tag.BUILDING],
      initialActionText: 'Place a city tile',
      startingMegaCredits: 49,

      metadata: {
        cardNumber: 'XB09',
        description: 'You start with 49 M€. As your first action in the game, place a city tile.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(49).nbsp.city();
          b.corpBox('effect', (ce) => {
            ce.effect('When you place a tile ON MARS gain 1 additional resource on the space.', (eb) => {
              eb.emptyTile('normal', {size: Size.SMALL}).startEffect.plus().wild(1).asterix();
            });
          });
        }),
      },
    });
  }

  public initialAction(player: Player) {
    return new SelectSpace('Select space on mars for city tile', player.game.board.getAvailableSpacesForCity(player), (space: ISpace) => {
      player.game.addCityTile(player, space);
      player.game.log('${0} placed a City tile', (b) => b.player(player));
      return undefined;
    });
  }


  public onTilePlaced(cardOwner: Player, activePlayer: Player, space: ISpace, boardType: BoardType) {
    if (boardType !== BoardType.MARS || space.spaceType === SpaceType.COLONY) return;
    if (cardOwner.id !== activePlayer.id || cardOwner.game.phase === Phase.SOLAR) {
      return;
    }

    // Don't grant bonuses when overplacing.
    if (space.tile?.covers !== undefined) return;

    const bonuses = space.bonus;
    if (bonuses.length === 0) {
      return;
    }
    const filtered = bonuses.filter((bonus) => VALID_BONUSES.includes(bonus));
    const unique = Array.from(new Set(filtered));
    const options = new OrOptions();
    options.title = 'Select an additional bonus from this space.';
    unique.forEach((bonus) => {
      options.options.push(new SelectOption(
        SpaceBonus.toString(bonus),
        'Select',
        () => {
          activePlayer.game.grantSpaceBonus(activePlayer, bonus, 1);
          return undefined;
        },
      ));
    });
    if (options.options.length === 1) {
      options.options[0].cb();
      return;
    }
    if (options.options.length === 0) {
      // should not happen.
      return;
    }
    const action = new SimpleDeferredAction(activePlayer, () => options);
    action.priority = Priority.GAIN_RESOURCE_OR_PRODUCTION;
    activePlayer.game.defer(action);
  }
}
