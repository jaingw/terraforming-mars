/*
 * @Author: Ender-Wiggin
 * @Date: 2024-10-10 23:21:26
 * @LastEditors: Ender-Wiggin
 * @LastEditTime: 2024-12-09 23:56:51
 * @Description:
 */
import {CorporationCard} from '../../corporation/CorporationCard';
import {IPlayer} from '../../../IPlayer';
import {Tag} from '../../../../common/cards/Tag';
import {Resource} from '../../../../common/Resource';
import {CardResource} from '../../../../common/CardResource';
import {ICorporationCard} from '../../corporation/ICorporationCard';
import {ICard} from '../../ICard';
import {SelectOption} from '../../../inputs/SelectOption';
import {OrOptions} from '../../../inputs/OrOptions';
import {CardName} from '../../../../common/cards/CardName';
import {CardRenderer} from '../../render/CardRenderer';
export class _Recyclon_ extends CorporationCard {
  constructor() {
    super({
      name: CardName._RECYCLON_,
      tags: [Tag.MICROBE, Tag.BUILDING],
      startingMegaCredits: 38,
      resourceType: CardResource.MICROBE,

      behavior: {
        production: {steel: 1},
        addResources: 2,
      },

      metadata: {
        cardNumber: 'R26',
        description: 'You start with 38 M€ and 1 steel production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(38).resource(CardResource.MICROBE).resource(CardResource.MICROBE).asterix().nbsp.production((pb) => pb.steel(1));
          b.corpBox('effect', (ce) => {
            ce.effect('When you play a building tag, including this, or a microbe tag, gain 1 microbe to this card, or remove ALL microbes to gain same amount plants.', (eb) => {
              eb.tag(Tag.MICROBE).slash().tag(Tag.BUILDING).colon().resource(CardResource.MICROBE).or();
              eb.text('X').resource(CardResource.MICROBE).startEffect.text('X').plants(1);
            });
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (!player.isCorporation(this.name)) {
      return undefined;
    }

    if (!card.tags.includes(Tag.BUILDING) && !card.tags.includes(Tag.MICROBE)) {
      return undefined;
    }
    // 双公司出Mining Guild得2微生物
    if (card.tags.filter((x) => x === Tag.BUILDING ).length ===2) {
      player.addResourceTo(this);
    }
    if (this.resourceCount < 2) {
      player.addResourceTo(this);
      return undefined;
    }

    const addResource = new SelectOption('Add a microbe resource to this card', 'Add microbe').andThen(() => {
      player.addResourceTo(this);
      return undefined;
    });

    const resourceCount = this.resourceCount;
    const spendResource = new SelectOption(`Remove ${resourceCount} microbes on this card and gain ${resourceCount} plants.`, 'Remove microbes').andThen(() => {
      player.removeResourceFrom(this, resourceCount);
      player.stock.add(Resource.PLANTS, resourceCount, {log: true});

      return undefined;
    });
    return new OrOptions(spendResource, addResource);
  }

  public onCorpCardPlayed(player: IPlayer, card: ICorporationCard) {
    return this.onCardPlayed(player, card);
  }
}
