/*
 * @Author: Ender-Wiggin
 * @Date: 2024-11-21 01:00:48
 * @LastEditors: Ender-Wiggin
 * @LastEditTime: 2025-01-28 13:51:10
 * @Description:
 */
import {IPlayer} from '../../IPlayer';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Tag} from '../../../common/cards/Tag';
import {digit} from '../Options';
import {IProjectCard} from '../../cards/IProjectCard';
import {Resource} from '../../../common/Resource';
import {ICard} from '../../cards/ICard';
import {CardResource} from '../../../common/CardResource';
import {CorporationCard} from '../corporation/CorporationCard';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {Size} from '../../../common/cards/render/Size';

const RESOURCE_AUTO_NUM = 6;

export class RaincatScientificProbe extends CorporationCard {
  constructor() {
    super({
      name: CardName.RAINCAT_SCIENTIFIC_PROBE,
      tags: [Tag.SCIENCE, Tag.EARTH],
      startingMegaCredits: 44,
      resourceType: CardResource.SCIENCE,

      metadata: {
        cardNumber: 'XB22',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(44).br;
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.LARGE);
            ce.effect(undefined, (eb) => {
              eb.cards(1).startEffect.resource(CardResource.SCIENCE);
            });
            ce.vSpace();
            ce.effect(undefined, (eb) => {
              eb.resource(CardResource.SCIENCE, RESOURCE_AUTO_NUM).startAction.steel(3, {digit}).or;
            });
            ce.vSpace();
            ce.effect('每打1张手牌(包括此卡),拿1个科学资源,每当有6个科学资源，自动拿3钢/2钛/4热', (eb) => {
              eb.resource(CardResource.SCIENCE, RESOURCE_AUTO_NUM).startAction.titanium(2, {digit}).slash().heat(4, {digit});
            }).vSpace(Size.SMALL);
          });
        }),
        description: 'You start with 44M€.',
      },
    });
  }


  public onCardPlayed(player: IPlayer, _card: IProjectCard) {
    if (player.playedCards.has(this.name)) {
      player.addResourceTo(this, {log: true});
    }
  }


  public onResourceAdded(player: IPlayer, playedCard: ICard) {
    if (playedCard.name !== this.name) {
      return;
    }
    if (this.resourceCount >= RESOURCE_AUTO_NUM) {
      player.defer(new OrOptions(
        new SelectOption('Gain 3 steels', 'Gain steel').andThen(() => {
          player.stock.add(Resource.STEEL, 3, {log: true});
          return undefined;
        }),
        new SelectOption('Gain 2 titaniums', 'Gain titantium').andThen(() => {
          player.stock.add(Resource.TITANIUM, 2, {log: true});
          return undefined;
        }), new SelectOption('Gain 4 heat', 'Gain heat').andThen(() => {
          player.stock.add(Resource.HEAT, 4, {log: true});
          return undefined;
        }),
      ));
      this.resourceCount -= RESOURCE_AUTO_NUM;
      player.game.log('${0} removed ${1} science resources.',
        (b) => b.player(player).number(RESOURCE_AUTO_NUM).card(this).number(RESOURCE_AUTO_NUM));
    }
  }
}
