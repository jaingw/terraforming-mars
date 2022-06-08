import {ICorporationCard} from '../corporation/ICorporationCard';
import {Player} from '../../Player';
import {Tags} from '../../common/cards/Tags';
import {ResourceType} from '../../common/ResourceType';
import {IProjectCard} from '../IProjectCard';
import {Resources} from '../../common/Resources';
import {CardType} from '../../common/cards/CardType';
import {CardName} from '../../common/cards/CardName';
import {IResourceCard} from '../ICard';
import {Card, StaticCardProperties} from '../Card';
import {VictoryPoints} from '../ICard';
import {CardRenderer} from '../render/CardRenderer';
import {played} from '../Options';

export class Arklight extends Card implements ICorporationCard, IResourceCard {
  constructor(properties?: StaticCardProperties) {
    super(Object.assign({
      name: CardName.ARKLIGHT,
      tags: [Tags.ANIMAL],
      startingMegaCredits: 45,
      resourceType: ResourceType.ANIMAL,
      cardType: CardType.CORPORATION,
      victoryPoints: VictoryPoints.resource(1, 2),

      metadata: {
        cardNumber: 'R04',
        description: 'You start with 45 M€. Increase your M€ production 2 steps. 1 VP per 2 animals on this card.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(45).nbsp.production((pb) => pb.megacredits(2));
          b.corpBox('effect', (ce) => {
            ce.effect('When you play an animal or plant tag, including this, add 1 animal to this card.', (eb) => {
              eb.animals(1, {played}).slash().plants(1, {played}).startEffect.animals(1);
            });
            ce.vSpace(); // to offset the description to the top a bit so it can be readable
          });
        }),
      },
    }, properties));
  }

  public override resourceCount = 0;

  public play(player: Player) {
    player.addProduction(Resources.MEGACREDITS, 2);
    player.addResourceTo(this, {log: true});
    return undefined;
  }

  public onCardPlayed(player: Player, card: IProjectCard): void {
    if (player.isCorporation(CardName.ARKLIGHT)) {
      player.addResourceTo(this, {qty: card.tags.filter((cardTag) => cardTag === Tags.ANIMAL || cardTag === Tags.PLANT).length, log: true});
    }
  }
    public onCorpCardPlayed(player: Player, card:ICorporationCard) {
      return this.onCardPlayed(player, card as unknown as IProjectCard);
    }
}
