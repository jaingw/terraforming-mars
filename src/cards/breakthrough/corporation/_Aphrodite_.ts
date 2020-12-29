
import {CorporationCard} from '../../corporation/CorporationCard';
import {Player} from '../../../Player';
import {Game} from '../../../Game';
import {Tags} from '../../Tags';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';

export class _Aphrodite_ implements CorporationCard {
    public name: CardName = CardName._APHRODITE_;
    public tags: Array<Tags> = [Tags.PLANT, Tags.VENUS];
    public startingMegaCredits: number = 40;
    public cardType: CardType = CardType.CORPORATION;

    public play() {
      return undefined;
    }
    public initialAction(player: Player, game: Game) {
      game.increaseVenusScaleLevel(player, 2);
      return undefined;
    }

  // public metadata: CardMetadata = {
  //   cardNumber: 'R01',
  //   description: 'You start with 40 MC. As your first action, raise Venus Scale 2 steps.',
  //   renderData: CardRenderer.builder((b) => {
  //     b.br;
  //     b.megacredits(40).nbsp.venus(1).nbsp.venus(1);
  //     b.corpBox('effect', (ce) => {
  //       ce.effectBox((eb) => {
  //         eb.venus(1).any.startEffect.plants(2);
  //         eb.description('Effect: Whenever Venus is terraformed 1 step, you gain 2 plant.');
  //       });
  //     });
  //   }),
  // }
}
