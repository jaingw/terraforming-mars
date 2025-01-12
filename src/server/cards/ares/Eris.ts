import {IPlayer} from '../../IPlayer';
import {Tag} from '../../../common/cards/Tag';
import {CardName} from '../../../common/cards/CardName';
import {ARES_CARD_MANIFEST} from './AresCardManifest';
import {PlaceHazardTile} from '../../deferredActions/PlaceHazardTile';
import {Space} from '../../boards/Space';
import {SelectOption} from '../../inputs/SelectOption';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectSpace} from '../../inputs/SelectSpace';
import {CardRenderer} from '../render/CardRenderer';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {Size} from '../../../common/cards/render/Size';
import {TileType} from '../../../common/TileType';
import {CardManifest} from '../ModuleManifest';
import {CorporationCard} from '../corporation/CorporationCard';
import {IGame} from '../../IGame';
import {isHazardTileType} from '../../../common/AresTileType';


export class Eris extends CorporationCard {
  constructor() {
    super({
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

  public initialAction(player: IPlayer) {
    if (player.game.gameOptions.aresExtension) {
      this.drawAresCard(player);
    }

    return undefined;
  }

  public canAct(player: IPlayer): boolean {
    const game = player.game;
    const availableSpaces = this.getAvailableSpaces(player, game);
    const hazardSpaces = this.getAllUnprotectedHazardSpaces(game);

    if (availableSpaces.length === 0 && hazardSpaces.length === 0) return false;
    return true;
  }

  public action(player: IPlayer) {
    const game = player.game;
    const orOptions = new OrOptions();
    const availableSpaces = this.getAvailableSpaces(player, game);
    const hazardSpaces = this.getAllUnprotectedHazardSpaces(game);

    if (availableSpaces.length > 0) {
      orOptions.options.push(new SelectOption('Place a hazard tile adjacent to no other tile', 'Select' )
        .andThen(() => {
          const title = 'Select space next to no other tile for hazard';
          const tileType = Math.floor(Math.random() * 2) === 0 ? TileType.DUST_STORM_MILD : TileType.EROSION_MILD;
          game.defer(new PlaceHazardTile(player, tileType, {title, spaces: availableSpaces}));
          return undefined;
        }));
    }

    if (hazardSpaces.length > 0) {
      orOptions.options.push(new SelectOption('Remove a hazard tile to gain 1 TR', 'Select' ).andThen( () => {
        return new SelectSpace(
          'Select hazard tile to remove',
          this.getAllUnprotectedHazardSpaces(game))
          .andThen((space: Space) => {
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

  private drawAresCard(player: IPlayer) {
    player.drawCard(1, {
      include: (card) => CardManifest.values(ARES_CARD_MANIFEST.projectCards).find( (x) => card instanceof x.Factory ) !== undefined,
    });

    return undefined;
  }

  private getAvailableSpaces(player: IPlayer, game: IGame): Array<Space> {
    return game.board.getAvailableSpacesOnLand(player)
      .filter(((space) => space.tile === undefined))
      .filter((space) => {
        const adjacentSpaces = game.board.getAdjacentSpaces(space);
        return adjacentSpaces.filter((space) => space.tile !== undefined).length === 0;
      });
  }

  private getAllUnprotectedHazardSpaces(game: IGame): Array<Space> {
    return game.board.spaces.filter(
      (space) => space.tile && isHazardTileType(space.tile.tileType) && space.tile.protectedHazard === false,
    );
  }
}
