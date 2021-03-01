import {Player} from '../../../Player';
import {CardName} from '../../../CardName';
import {CardRenderer} from '../../render/CardRenderer';
import {CardRenderItemSize} from '../../render/CardRenderItemSize';
import {ArcadianCommunities} from '../../promo/ArcadianCommunities';
import {ISpace} from '../../../boards/ISpace';
import {CardMetadata} from '../../CardMetadata';


export class _ArcadianCommunities_ extends ArcadianCommunities {
  public get name() {
    return CardName._ARCADIAN_COMMUNITIES_;
  }
  public onTilePlaced(cardOwner: Player, activePlayer: Player, space: ISpace) {
    if ( cardOwner.id !== activePlayer.id) {
      return;
    }
    let bonusResource: number = 0;
    if (space.player !== undefined && space.player.isCorporation(CardName._ARCADIAN_COMMUNITIES_)) {
      bonusResource = cardOwner.game.board.getAdjacentSpaces(space)
        .filter((space) => space.tile !== undefined && space.player !== undefined && space.player === cardOwner)
        .length;
    }
    cardOwner.megaCredits += bonusResource;
  }


  public get metadata(): CardMetadata {
    return {
      cardNumber: 'R44',
      description: 'You start with 40 MC and 10 steel. AS YOUR FIRST ACTION, PLACE A COMMUNITY [PLAYER MARKER] ON A NON-RESERVED AREA.',
      renderData: CardRenderer.builder((b) => {
        b.br;
        b.megacredits(40).nbsp.steel(10).digit.nbsp.community().asterix();
        b.corpBox('action', (ce) => {
          ce.vSpace(CardRenderItemSize.LARGE);
          ce.effect('marked areas are reserved for you. when you place a tile there, gain 3 MC. When you place a tile, gain 1 MC for each tiles you own adjacent to it.)<br>(Action: place a community on a non-reserved area adjacent to one of your tiles or marked areas.', (eb) => {
            eb.emptyTile('normal', CardRenderItemSize.SMALL).emptyTile('normal', CardRenderItemSize.SMALL).startEffect.megacredits(1);
          });
        });
      }),
    };
  }
}

