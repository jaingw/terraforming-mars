import {Player} from '../../../Player';
import {CardRenderer} from '../../render/CardRenderer';
import {IProjectCard} from '../../IProjectCard';
import {played} from '../../Options';
import {Card} from '../../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {ICardMetadata} from '../../../common/cards/ICardMetadata';
import {Tags} from '../../../common/cards/Tags';
import {ICorporationCard} from '../../corporation/ICorporationCard';

export class _InterplanetaryCinematics_ extends Card implements ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName._INTERPLANETARY_CINEMATICS_,
      tags: [Tags.BUILDING],
      startingMegaCredits: 50,

    });
  }

  public onCardPlayed(player: Player, card: IProjectCard) {
    if (player.corpName(this.name) && card.cardType === CardType.EVENT) {
      player.megaCredits += 3;
    }
  }
  public play(player: Player) {
    player.drawCard(2, {cardType: CardType.EVENT});
    return undefined;
  }
  public override get metadata(): ICardMetadata {
    return {
      cardNumber: 'R19',
      description: 'You start with 50 M€. draw 2 event cards.',
      renderData: CardRenderer.builder((b) => {
        b.br.br.br;
        b.megacredits(50).nbsp.cards(2, {secondaryTag: Tags.EVENT});
        b.corpBox('effect', (ce) => {
          ce.effect('Your tags on event work the same as green or blue card. Event tag is a new tag for you. Each time you play an event, you gain 3 M€.', (eb) => {
            eb.event({played}).startEffect.megacredits(3);
            eb.description();
          });
        });
      }),
    };
  }
}
