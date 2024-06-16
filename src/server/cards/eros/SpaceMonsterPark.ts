import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {CardResource} from '../../../common/CardResource';
import {CardName} from '../../../common/cards/CardName';
import {Priority} from '../../deferredActions/Priority';
import {CardRenderer} from '../render/CardRenderer';
import {played} from '../Options';

export class SpaceMonsterPark extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.SPACE_MONSTER_PARK,
      tags: [Tag.SPACE, Tag.EARTH, Tag.VENUS],
      cost: 16,

      behavior: {
        production: {titanium: -1},
      },
      resourceType: CardResource.FLOATER,
      victoryPoints: 1,

      metadata: {
        cardNumber: 'Q59',
        renderData: CardRenderer.builder((b) => {
          b.titanium(1, {played}).slash().earth(1, {played}).slash().venus(1, {played}).colon().floaters(1).br;
          b.or().br;
          b.minus().floaters(2).plus().cards(1);
          b.production((pb) => {
            pb.minus().titanium(1);
          });
        }),
        description: 'When you play a science tag, including this, either add a science resource to this card, or remove a science resource from this card to draw a card.',
      },
    });
  }


  public onCardPlayed(player: IPlayer, card: IProjectCard) {
    const canTriggerTags = [Tag.SPACE, Tag.EARTH, Tag.VENUS];
    let tagCount = 0;
    for (const tag of canTriggerTags) {
      tagCount += player.tags.cardTagCount(card, tag);
    }
    for (let i = 0; i < tagCount; i++) {
      player.defer(() => {
        // Can't remove a resource
        if (this.resourceCount <= 1) {
          player.addResourceTo(this, 1);
          return undefined;
        }
        const options = new OrOptions(
          new SelectOption('Remove 2 floater resources from this card to draw a card', 'Remove resource').andThen(() => {
            player.removeResourceFrom(this, 2);
            player.drawCard();
            return undefined;
          }),
          new SelectOption('Add a floater resource to this card', 'Add resource').andThen(() => {
            player.addResourceTo(this, 1);
            return undefined;
          }),
        );
        options.title = 'Select an option for Space Monster Park';
        return options;
      },
      Priority.SUPERPOWER); // Unshift that deferred action
    }
    return undefined;
  }
}
