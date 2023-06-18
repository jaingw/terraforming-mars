import {ICorporationCard} from '../corporation/ICorporationCard';
import {Player} from '../../Player';
import {Tag} from '../../../common/cards/Tag';
import {Game} from '../../Game';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {ARES_CARD_MANIFEST} from './AresCardManifest';
import {PlaceHazardTile} from '../../deferredActions/PlaceHazardTile';
import {ISpace} from '../../boards/ISpace';
import {SelectOption} from '../../inputs/SelectOption';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectSpace} from '../../inputs/SelectSpace';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {Size} from '../../../common/cards/render/Size';
import {isHazardTileType, TileType} from '../../../common/TileType';
import {CardManifest} from '../ModuleManifest';


export class Eris extends Card implements ICorporationCard {
  constructor() {
    super({
      type: CardType.CORPORATION,
      name: CardName.ERIS,
      tags: [Tag.BUILDING],
      initialActionText: 'Draw an Ares card',
      startingMegaCredits: 46,

      metadata: {
        cardNumber: 'R47',
        description: 'You start with 46 M€. As your first action, draw an Ares card.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(46).nbsp.cards(1, {secondaryTag: AltSecondaryTag.ARES});
          b.corpBox('action', (ce) => {
            ce.action('Place a new hazard tile adjacent to NO OTHER TILE, OR remove a hazard tile to gain 1 TR.', (eb) => {
              eb.empty().startAction.plus().hazardTile().slash().minus().hazardTile().colon().tr(1, {size: Size.SMALL});
            });
          });
        }),
      },
    });
  }

  public initialAction(player: Player) {
    if (player.game.gameOptions.aresExtension) {
      this.drawAresCard(player);
    }

    return undefined;
  }

  public canAct(player: Player): boolean {
    const game = player.game;
    const availableSpaces = this.getAvailableSpaces(player, game);
    const hazardSpaces = this.getAllUnprotectedHazardSpaces(game);

    if (availableSpaces.length === 0 && hazardSpaces.length === 0) return false;
    return true;
  }

  public action(player: Player) {
    const game = player.game;
    const orOptions = new OrOptions();
    const availableSpaces = this.getAvailableSpaces(player, game);
    const hazardSpaces = this.getAllUnprotectedHazardSpaces(game);

    if (availableSpaces.length > 0) {
      orOptions.options.push(new SelectOption('Place a hazard tile adjacent to no other tile', 'Select', () => {
        const title = 'Select space next to no other tile for hazard';
        const tileType = Math.floor(Math.random() * 2) === 0 ? TileType.DUST_STORM_MILD : TileType.EROSION_MILD;
        game.defer(new PlaceHazardTile(player, tileType, availableSpaces, {title}));
        return undefined;
      }));
    }

    if (hazardSpaces.length > 0) {
      orOptions.options.push(new SelectOption('Remove a hazard tile to gain 1 TR', 'Select', () => {
        return new SelectSpace(
          'Select hazard tile to remove',
          this.getAllUnprotectedHazardSpaces(game),
          (space: ISpace) => {
            space.tile = undefined;
            player.increaseTerraformRating();
            return undefined;
          },
        );
      }));
    }

    if (orOptions.options.length === 1) return orOptions.options[0].cb();
    return orOptions;
  }

  private drawAresCard(player: Player) {
    player.drawCard(1, {
      include: (card) => CardManifest.values(ARES_CARD_MANIFEST.projectCards).find( (x) => card instanceof x.Factory ) !== undefined,
    });

    return undefined;
  }

  private getAvailableSpaces(player: Player, game: Game): Array<ISpace> {
    return game.board.getAvailableSpacesOnLand(player)
      .filter(((space) => space.tile === undefined))
      .filter((space) => {
        const adjacentSpaces = game.board.getAdjacentSpaces(space);
        return adjacentSpaces.filter((space) => space.tile !== undefined).length === 0;
      });
  }

  private getAllUnprotectedHazardSpaces(game: Game): Array<ISpace> {
    return game.board.spaces.filter(
      (space) => space.tile && isHazardTileType(space.tile.tileType) && space.tile.protectedHazard === false,
    );
  }
}
