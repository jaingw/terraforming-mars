import {Tags} from '../../common/cards/Tags';
import {Player} from '../../Player';
import {Card} from '../Card';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {IProjectCard} from '../../cards/IProjectCard';
import {DeferredAction} from '../../deferredActions/DeferredAction';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectOption} from '../../inputs/SelectOption';
import {played} from '../../cards/Options';

export class IntegratedMicroorganisms extends Card implements ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName.INTEGRATED_MICROORGANISMS,
      tags: [Tags.MICROBE],
      startingMegaCredits: 36,

      initialActionText: 'Draw 1 card with a microbe tag',
      metadata: {
        cardNumber: 'XUEBAO07',
        description: 'You start with 36 M€. As your first action, draw 1 card with a microbe tag.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br;
          b.megacredits(36).cards(1, {secondaryTag: Tags.MICROBE});
          b.corpBox('effect', (ce) => {
            ce.effect('When you play a Microbe tag, including this, you may discard a card from hand to draw 2 cards.', (eb) => {
              eb.microbes(1, {played}).startEffect.minus().cards(1).nbsp.plus().cards(2);
            });
          });
        }),
      },
    });
  }

  public play(player: Player) {
    this.effectResolve(player, this as IProjectCard);
    return undefined;
  }

  public initialAction(player: Player) {
    player.drawCard(1, {tag: Tags.MICROBE});
    return undefined;
  }

  public onCorpCardPlayed(player: Player, card:ICorporationCard) {
    return this.onCardPlayed(player, card as unknown as IProjectCard);
  }
  private effectResolve(player: Player, card: IProjectCard) {
    const microbeTags = player.cardTagCount(card, Tags.MICROBE);
    for (let i = 0; i < microbeTags; i++) {
      player.game.defer(new DeferredAction(
        player,
        () => {
          // No card to discard
          if (player.cardsInHand.length === 0) {
            return undefined;
          }
          return new OrOptions(
            new SelectCard('Select a card to discard', 'Discard', player.cardsInHand, (foundCards: Array<IProjectCard>) => {
              player.cardsInHand.splice(player.cardsInHand.indexOf(foundCards[0]), 1);
              player.game.dealer.discard(foundCards[0]);
              player.game.log('${0} is using their ${1} effect to draw 2 cards by discarding a card.', (b) => b.player(player).card(this));
              player.game.log('You discarded ${0}', (b) => b.card(foundCards[0]), {reservedFor: player});
              player.drawCard(2);
              return undefined;
            }),
            new SelectOption('Do nothing', 'Confirm', () => {
              return undefined;
            }),
          );
        },
      ));
    }
    return undefined;
  }
  public onCardPlayed(player: Player, card: IProjectCard) {
    if (player.corpName(this.name)) {
      this.effectResolve(player, card);
    }
  }
}
