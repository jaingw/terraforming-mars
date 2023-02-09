import {Tag} from '../../../common/cards/Tag';
import {Player} from '../../Player';
import {Card} from '../Card';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {IProjectCard} from '../../cards/IProjectCard';
import {SimpleDeferredAction} from '../../deferredActions/DeferredAction';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectOption} from '../../inputs/SelectOption';
import {played} from '../../cards/Options';

export class IntegratedMicroorganisms extends Card implements ICorporationCard {
  constructor() {
    super({
      cardType: CardType.CORPORATION,
      name: CardName.INTEGRATED_MICROORGANISMS,
      tags: [Tag.MICROBE],
      startingMegaCredits: 40,

      initialActionText: 'Draw 1 card with a microbe tag',
      metadata: {
        cardNumber: 'XB07',
        description: 'You start with 40 M€. As your first action, draw 1 card with a microbe tag.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br;
          b.megacredits(40).cards(1, {secondaryTag: Tag.MICROBE});
          b.corpBox('effect', (ce) => {
            ce.effect('When you play a Microbe tag, including this, you may discard a card from hand to draw 2 cards.', (eb) => {
              eb.microbes(1, {played}).startEffect.minus().cards(1).nbsp.plus().cards(2);
            });
          });
        }),
      },
    });
  }

  public override bespokePlay(player: Player) {
    this.effectResolve(player, this as IProjectCard);
    return undefined;
  }

  public initialAction(player: Player) {
    player.drawCard(1, {tag: Tag.MICROBE});
    return undefined;
  }

  public onCorpCardPlayed(player: Player, card:ICorporationCard) {
    this.onCardPlayed(player, card as unknown as IProjectCard);
    return undefined;
  }
  private effectResolve(player: Player, card: IProjectCard) {
    const microbeTags = player.tags.cardTagCount(card, Tag.MICROBE);
    for (let i = 0; i < microbeTags; i++) {
      player.game.defer(new SimpleDeferredAction(
        player,
        () => {
          // No card to discard
          if (player.cardsInHand.length === 0) {
            return undefined;
          }
          return new OrOptions(
            new SelectCard('Select a card to discard', 'Discard', player.cardsInHand, (foundCards: Array<IProjectCard>) => {
              player.cardsInHand.splice(player.cardsInHand.indexOf(foundCards[0]), 1);
              player.game.projectDeck.discard(foundCards[0]);
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
    if (player.isCorporation(this.name)) {
      this.effectResolve(player, card);
    }
  }
}
