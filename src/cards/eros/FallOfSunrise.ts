import {IProjectCard} from '../IProjectCard';
import {Tags} from '../Tags';
import {CardType} from '../CardType';
import {Player} from '../../Player';
import {Resources} from '../../Resources';
import {CardName} from '../../CardName';
import {MAX_TEMPERATURE, REDS_RULING_POLICY_COST} from '../../constants';
import {PartyHooks} from '../../turmoil/parties/PartyHooks';
import {PartyName} from '../../turmoil/parties/PartyName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';

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
  };

  public canPlay(player: Player): boolean {
    const temperatureStep = player.game.getTemperature() < MAX_TEMPERATURE ? 1 : 0;
    if (PartyHooks.shouldApplyPolicy(player.game, PartyName.REDS)) {
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
