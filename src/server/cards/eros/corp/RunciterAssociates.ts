import {CardRenderer} from '../../render/CardRenderer';
import {CardName} from '../../../../common/cards/CardName';
import {IPlayer} from '../../../IPlayer';
import {Tag} from '../../../../common/cards/Tag';
import {Size} from '../../../../common/cards/render/Size';
import {IProjectCard} from '../../../cards/IProjectCard';
import {SelectCard} from '../../../inputs/SelectCard';
import {CorporationCard} from '../../corporation/CorporationCard';

export class RunciterAssociates extends CorporationCard {
  constructor() {
    super({
      name: CardName.RUNCITER_ASSOCIATES,
      // tags: [Tag.BUILDING],
      tags: [],
      startingMegaCredits: 35,

      metadata: {
        cardNumber: 'Q33',
        description: '',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br.br;
          b.megacredits(35).br;
          b.text('(You start with 35 MC.)', Size.TINY, false, false);
          b.corpBox('action', (ce) => {
            ce.action('Discard a card. For each tag it has, draw a card with the same tag.', (eb) => {
              eb.cards(1, {secondaryTag: Tag.WILD}).startAction.text('X').cards(1, {secondaryTag: Tag.WILD}).asterix();
            });
          });
        }),
      },
    });
  }


  public canAct(player: IPlayer): boolean {
    return player.cardsInHand.length >= 1;
  }

  public action(player: IPlayer) {
    return new SelectCard(
      'select one card to discard',
      'Discard',
      player.cardsInHand,
      {min: 1, max: 1},
    ).andThen((foundCards: Array<IProjectCard>) => {
      for (const card of foundCards) {
        player.cardsInHand.splice(player.cardsInHand.indexOf(card), 1);
        player.game.projectDeck.discard(card);
        player.game.log('${0} discard ${1}.', (b) => {
          b.player(player).card(card);
        });
        card.tags.filter((tag) => tag !== Tag.EVENT && tag !== Tag.WILD).forEach((tag) => {
          player.drawCard(1, {tag: tag});
        },
        );
        player.game.cardDrew = true;
      }

      return undefined;
    });
  }
}
