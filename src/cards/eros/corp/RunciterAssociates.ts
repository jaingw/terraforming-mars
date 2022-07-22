import {CardRenderer} from '../../render/CardRenderer';
import {Card} from '../../Card';
import {ICard} from '../../ICard';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {ICorporationCard} from '../../corporation/ICorporationCard';
import {Player} from '../../../Player';
import {Tags} from '../../../common/cards/Tags';
import {Size} from '../../../common/cards/render/Size';
import {IProjectCard} from '../../../cards/IProjectCard';
import {SelectCard} from '../../../inputs/SelectCard';

export class RunciterAssociates extends Card implements ICard, ICorporationCard {
  constructor() {
    super({
      name: CardName.RUNCITER_ASSOCIATES,
      // tags: [Tags.BUILDING],
      tags: [],
      startingMegaCredits: 35,
      cardType: CardType.CORPORATION,

      metadata: {
        cardNumber: 'Q33',
        description: '',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br.br;
          b.megacredits(35).br;
          b.text('(You start with 35 MC.)', Size.TINY, false, false);
          b.corpBox('action', (ce) => {
            ce.action('Discard a card. For each tag it has, draw a card with the same tag.', (eb) => {
              eb.cards(1, {secondaryTag: Tags.WILD}).startAction.cards(1, {secondaryTag: Tags.WILD}).asterix();
            });
          });
        }),
      },
    });
  }

  public play() {
    return undefined;
  }

  public canAct(player: Player): boolean {
    return player.cardsInHand.length >= 1;
  }

  public action(player: Player) {
    return new SelectCard(
      'select one card to discard',
      'Discard',
      player.cardsInHand,
      (foundCards: Array<IProjectCard>) => {
        for (const card of foundCards) {
          player.cardsInHand.splice(player.cardsInHand.indexOf(card), 1);
          player.game.dealer.discard(card);
          player.game.log('${0} discard ${1}.', (b) => {
            b.player(player).card(card);
          });
          card.tags.filter((tag) => tag !== Tags.EVENT && tag !== Tags.WILD).forEach((tag) => {
            player.drawCard(1, {tag: tag});
          },
          );
          player.game.cardDrew = true;
        }

        return undefined;
      },
      {min: 1, max: 1},
    );
  }
}
