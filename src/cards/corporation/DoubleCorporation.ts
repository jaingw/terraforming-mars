import {CorporationCard} from './CorporationCard';
import {Player} from '../../Player';
import {Card} from '../Card';
import {CardName} from '../../CardName';
import {CardType} from '../CardType';
import {CardRenderer} from '../render/CardRenderer';
import {BoardType} from '../../boards/BoardType';
import {ISpace} from '../../boards/ISpace';
import {ResourceType} from '../../ResourceType';

/**
 * 双将包装类
 */
export class DoubleCorporation extends Card implements CorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName.DOUBLE_CORPORATION,

      metadata: {
        cardNumber: '',
        description: '',
        renderData: CardRenderer.builder(() => {}),
      },
      startingMegaCredits: 0,
    });
  }

  public corpCard1: CorporationCard | undefined = undefined;
  public corpCard2: CorporationCard | undefined = undefined;

  public corpName(cardName:CardName): boolean {
    return this.corpCard1?.name === cardName || this.corpCard2?.name === cardName;
  }

  public corpResourceType(resourceType: ResourceType): boolean {
    return this.corpCard1?.resourceType === resourceType || this.corpCard2?.resourceType === resourceType;
  }

  public onTilePlaced(cardOwner: Player, activePlayer: Player, space: ISpace, boardType: BoardType) {
    if (this.corpCard1 !== undefined && this.corpCard1.onTilePlaced !== undefined) {
      this.corpCard1?.onTilePlaced(cardOwner, activePlayer, space, boardType);
    }
    if (this.corpCard2 !== undefined && this.corpCard2.onTilePlaced !== undefined) {
      this.corpCard2?.onTilePlaced(cardOwner, activePlayer, space, boardType);
    }
  };


  public play(_player: Player) {
    return undefined;
  }
}
