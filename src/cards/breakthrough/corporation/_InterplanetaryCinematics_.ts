import {CorporationCard} from '../../corporation/CorporationCard';
import {Player} from '../../../Player';
import {Tags} from '../../Tags';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';
import {CardMetadata} from '../../CardMetadata';
import {CardRenderer} from '../../render/CardRenderer';
import {IProjectCard} from '../../IProjectCard';

export class _InterplanetaryCinematics_ implements CorporationCard {
    public name = CardName._INTERPLANETARY_CINEMATICS_;
    public tags = [Tags.BUILDING];
    public startingMegaCredits: number = 50;
    public cardType = CardType.CORPORATION;

    public onCardPlayed(player: Player, card: IProjectCard) {
      if (player.corpName(this.name) && card.cardType === CardType.EVENT) {
        player.megaCredits += 3;
      }
    }
    public play(player: Player) {
      player.drawCard(2, {cardType: CardType.EVENT});
      return undefined;
    }
    public metadata: CardMetadata = {
      cardNumber: 'R19',
      description: 'You start with 50 M€. As your first action, draw 2 event cards.',
      renderData: CardRenderer.builder((b) => {
        b.br.br.br;
        b.megacredits(50).nbsp.cards(2).secondaryTag(Tags.EVENT);
        b.corpBox('effect', (ce) => {
          ce.effect('Your tags on event work the same as green or blue card. Event tag is a new tag for you. Each time you play an event, you gain 3 M€.', (eb) => {
            eb.event().played.startEffect.megacredits(3);
            eb.description();
          });
        });
      }),
    }
}
