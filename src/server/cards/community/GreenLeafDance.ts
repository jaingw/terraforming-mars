/*
 * @Author: Ender-Wiggin
 * @Date: 2024-10-26 12:57:01
 * @LastEditors: Ender-Wiggin
 * @LastEditTime: 2024-11-05 00:19:43
 * @Description:
 */
import {CorporationCard} from '../corporation/CorporationCard';
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Space} from '../../boards/Space';
import {Size} from '../../../common/cards/render/Size';
import {Phase} from '../../../common/Phase';
import {BoardType} from '../../boards/BoardType';
import {SpaceType} from '../../../common/boards/SpaceType';
import {SpaceBonus} from '../../../common/boards/SpaceBonus';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {TITLES} from '../../inputs/titles';

export class GreenLeafDance extends CorporationCard {
  constructor() {
    super({
      name: CardName.GREEN_LEAF_DANCE,
      tags: [Tag.PLANT],
      startingMegaCredits: 45,

      firstAction: {
        text: 'Place your initial ocean.',
        ocean: {},
      },

      metadata: {
        cardNumber: 'PfC1',
        description: 'You start with 45 M€. As your first action, place an ocean tile.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(45).oceans(1);
          b.corpBox('effect', (ce) => {
            ce.vSpace();
            ce.effect(
              'When you place a tile on an area that has a plant placement bonus, you can spend 3 MC to increase plant production 1 step.',
              (eb) => {
                eb.emptyTile('normal', {size: Size.SMALL}).nbsp.asterix().colon().megacredits(-3).empty().startAction.production((pb) => pb.plants(1));
              });
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space, boardType: BoardType) {
    if (boardType !== BoardType.MARS || space.spaceType === SpaceType.COLONY) return;
    if (cardOwner.id !== activePlayer.id || cardOwner.game.phase === Phase.SOLAR) {
      return;
    }

    // Don't grant bonuses when overplacing.
    if (space.tile?.covers !== undefined) return;

    const bonuses = space.bonus;
    if (bonuses.length === 0 || !bonuses.includes(SpaceBonus.PLANT)) {
      return;
    }

    if (cardOwner.canAfford({cost: 3})) {
      const orOptions = new OrOptions();
      orOptions.options.push(
        new SelectOption('Pay 3 M€ to increase a plant production').andThen(() => {
          cardOwner.game.defer(new SelectPaymentDeferred(cardOwner, 3, {title: TITLES.payForCardAction(this.name)}))
            .andThen(() => cardOwner.production.add(Resource.PLANTS, 1, {log: true}));
          return undefined;
        }),
      );
      orOptions.options.push(new SelectOption('Do not use card effect').andThen(() => {
        cardOwner.game.log('${0} declined to use the ${1} effect', (b) => b.player(cardOwner).card(this));
        return undefined;
      }));
      cardOwner.defer(orOptions);
    } else {
      cardOwner.game.log('${0} cannot afford to use the ${1} effect', (b) => b.player(cardOwner).card(this));
    }
  }
}
