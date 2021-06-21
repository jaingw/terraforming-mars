import {IProjectCard} from '../IProjectCard';
import {Tags} from '../Tags';
import {CardType} from '../CardType';
import {Player} from '../../Player';
import {CardName} from '../../CardName';
import {CardRequirements} from '../CardRequirements';
import {MAX_OXYGEN_LEVEL, REDS_RULING_POLICY_COST} from '../../constants';
import {PartyHooks} from '../../turmoil/parties/PartyHooks';
import {PartyName} from '../../turmoil/parties/PartyName';
import {PlaceGreeneryTile} from '../../deferredActions/PlaceGreeneryTile';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';

export class LargeEcologicalReserve extends Card implements IProjectCard {
  constructor() {
    super({
      cost: 39,
      tags: [Tags.PLANT, Tags.MICROBE, Tags.ANIMAL, Tags.BUILDING],
      name: CardName.LARGE_ECOLOGICAL_RESERVE,
      cardType: CardType.AUTOMATED,

      requirements: CardRequirements.builder((b) => b.tag(Tags.PLANT).tag(Tags.ANIMAL).tag(Tags.MICROBE)),
      metadata: {
        description: 'Requires a Plant tag, a Microbe tag, and an Animal tag. Place 2 greenery tiles and raise oxygen 2 steps',
        cardNumber: 'Q02',
        renderData: CardRenderer.builder((b) => {
          b.greenery().nbsp.greenery();
        }),
        victoryPoints: 1,
      },
    });
  }

  public canPlay(player: Player): boolean {
    const canPlaceTile = player.game.board.getAvailableSpacesOnLand(player).length > 0;
    const oxygenMaxed = player.game.getOxygenLevel() === MAX_OXYGEN_LEVEL;
    const oxygenIncreased = Math.min(MAX_OXYGEN_LEVEL-player.game.getOxygenLevel(), 2);

    if (PartyHooks.shouldApplyPolicy(player.game, PartyName.REDS) && !oxygenMaxed) {
      return player.canAfford(player.getCardCost(this) + oxygenIncreased*REDS_RULING_POLICY_COST, {microbes: true}) && canPlaceTile && player.checkMultipleTagPresence([Tags.PLANT, Tags.ANIMAL, Tags.MICROBE]); ;
    }

    return canPlaceTile && player.checkMultipleTagPresence([Tags.PLANT, Tags.ANIMAL, Tags.MICROBE]); ;
  }
  public play(player: Player) {
    player.game.defer(new PlaceGreeneryTile(player, 'Select space for first greenery'));
    if (player.game.board.getAvailableSpacesOnLand(player).length > 0) {
      player.game.defer(new PlaceGreeneryTile(player, 'Select space for second greenery'));
    }
    return undefined;
  }
  public getVictoryPoints() {
    return 1;
  }
}


