import {Player} from '../../../Player';
import {CardRenderer} from '../../render/CardRenderer';
import {ArcadianCommunities} from '../../promo/ArcadianCommunities';
import {ISpace} from '../../../boards/ISpace';
import {digit} from '../../Options';
import {CardName} from '../../../../common/cards/CardName';
import {ICardMetadata} from '../../../../common/cards/ICardMetadata';
import {Size} from '../../../../common/cards/render/Size';
import {BoardType} from '../../../boards/BoardType';

export class _ArcadianCommunities_ extends ArcadianCommunities {
  public override get name() {
    return CardName._ARCADIAN_COMMUNITIES_;
  }
  public onTilePlaced(cardOwner: Player, activePlayer: Player, space: ISpace, boardType: BoardType) {
    if ( cardOwner.id !== activePlayer.id || boardType === BoardType.MOON ) {
      return;
    }
    let bonusResource: number = 0;
    if (space.player !== undefined && space.player.isCorporation && space.player.isCorporation(CardName._ARCADIAN_COMMUNITIES_)) {
      bonusResource = cardOwner.game.board.getAdjacentSpaces(space)
        .filter((space) => space.tile !== undefined && space.player !== undefined && space.player === cardOwner)
        .length;
    }
    cardOwner.megaCredits += bonusResource;
  }


  public override get metadata(): ICardMetadata {
    return {
      cardNumber: 'R44',
      description: 'You start with 40 M€ and 10 steel. AS YOUR FIRST ACTION, PLACE A COMMUNITY [PLAYER MARKER] ON A NON-RESERVED AREA.',
      renderData: CardRenderer.builder((b) => {
        b.br;
        b.megacredits(40).nbsp.steel(10, {digit}).nbsp.community().asterix();
        b.corpBox('action', (ce) => {
          ce.vSpace(Size.LARGE);
          ce.effect('marked areas are reserved for you. when you place a tile there, gain 3 M€. When you place a tile, gain 1 M€ for each tiles you own adjacent to it', (eb) => {
            eb.emptyTile('normal', {size: Size.SMALL}).emptyTile('normal', {size: Size.SMALL}).startEffect.megacredits(1);
          });
          ce.action('place a community on a non-reserved area adjacent to one of your tiles or marked areas.', (eb) => {
            eb.startAction;
          });
        });
      }),
    };
  }
}

