import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Tag} from '../../../common/cards/Tag';
import {IGame} from '../../IGame';
import {TurmoilUtil} from '../../turmoil/TurmoilUtil';
import {Phase} from '../../../common/Phase';
import {ChooseRulingPartyDeferred} from '../../turmoil/ChooseRulingPartyDeferred';

export class TheNewSpaceRace extends PreludeCard implements IProjectCard {
  constructor() {
    super({
      name: CardName.THE_NEW_SPACE_RACE,
      tags: [Tag.SCIENCE, Tag.EARTH],

      behavior: {
        stock: {megacredits: 12},
      },

      metadata: {
        cardNumber: 'PfP14',
        renderData: CardRenderer.builder((b) => {
          b.firstPlayer().rulingParty().megacredits(12).br;
        }),
        description: 'REVEALED BEFORE ANY OTHER PRELUDE. You become starting player for the game. Choose and set a ruling policy for the first generation. Gain 12 M€.',
      },
    });
  }
  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    game.overrideFirstPlayer(player);
    TurmoilUtil.ifTurmoil((player.game), (turmoil) => {
      player.game.defer(new ChooseRulingPartyDeferred(player, turmoil));
    });

    return undefined;
  }

  public static potentiallyChangeFirstPlayer(game: IGame) {
    const [cardHolder, card] = game.getCardHolder(CardName.THE_NEW_SPACE_RACE);
    if (cardHolder !== undefined && card !== undefined) {
      game.phase = Phase.PRELUDES;
      game.log('${0} has ${1}, which is played before any other Prelude and makes them first player.', (b) => b.player(cardHolder).card(card));
      cardHolder.playCard(card);
    }
  }
}
