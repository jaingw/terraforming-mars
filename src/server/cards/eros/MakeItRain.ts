import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';

export class MakeItRain extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.MAKE_IT_RAIN,
      tags: [],
      cost: 1,
      metadata: {
        cardNumber: 'Q61',
        renderData: CardRenderer.builder((b) => {
          b.text('X').cards(1, {secondaryTag: Tag.SPACE}).startAction.text('X').titanium(1);
        }),
      },
    });
  }

  private getSpaceTagCards(player: IPlayer): Array<IProjectCard> {
    return player.cardsInHand.filter((card) => card.tags.includes(Tag.SPACE));
  }

  public override bespokeCanPlay(player: IPlayer): boolean {
    return this.getSpaceTagCards(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    const spaceTagCards = this.getSpaceTagCards(player);
    const maxCards = Math.min(spaceTagCards.length, 10);

    if (spaceTagCards.length === 0) {
      return undefined;
    }

    return new SelectCard(
      'Select Space tag cards to discard for titanium (max 10)',
      'Discard',
      spaceTagCards,
      {min: 0, max: maxCards})
      .andThen((cards) => {
        const titaniumGain = cards.length;
        if (titaniumGain > 0) {
          player.stock.add(Resource.TITANIUM, titaniumGain);
          cards.forEach((card) => player.discardCardFromHand(card));
          player.game.log('${0} discarded ${1} Space tag cards to gain ${2} titanium', (b) =>
            b.player(player).number(titaniumGain).number(titaniumGain));
        }
        return undefined;
      });
  }
}
