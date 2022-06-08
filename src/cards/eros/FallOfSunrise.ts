import {IProjectCard} from '../IProjectCard';
import {Player} from '../../Player';
import {PartyHooks} from '../../turmoil/parties/PartyHooks';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {CardName} from '../../common/cards/CardName';
import {CardType} from '../../common/cards/CardType';
import {Tags} from '../../common/cards/Tags';
import {MAX_TEMPERATURE, REDS_RULING_POLICY_COST} from '../../common/constants';
import {Resources} from '../../common/Resources';
import {PartyName} from '../../common/turmoil/PartyName';

export class FallOfSunrise extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.FALL_OF_SUNRISE,
      cardType: CardType.EVENT,
      tags: [Tags.SPACE],
      cost: 15,

      metadata: {
        cardNumber: 'Q17',
        renderData: CardRenderer.builder((b) => {
          b.temperature(1);
          b.plants(4);
        }),
        description: 'Increase Temperature 1 step. Gain 4 plants.',
      },
    });
  }

  public override canPlay(player: Player): boolean {
    const temperatureStep = player.game.getTemperature() < MAX_TEMPERATURE ? 1 : 0;
    if (PartyHooks.shouldApplyPolicy(player, PartyName.REDS)) {
      return player.canAfford(player.getCardCost(this) + REDS_RULING_POLICY_COST * temperatureStep, {titanium: true});
    }

    return true;
  }

  public play(player: Player) {
    player.game.increaseTemperature(player, 1);
    player.addResource(Resources.PLANTS, 4);
    return undefined;
  }
}
