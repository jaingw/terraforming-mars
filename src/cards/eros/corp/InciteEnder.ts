import {CorporationCard} from '../../corporation/CorporationCard';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';
import {CardRenderer} from '../../render/CardRenderer';
import {Tags} from '../../Tags';
import {Card} from '../../Card';
import {ICard} from '../../ICard';
import {Player} from '../../../Player';
import {SendDelegateToArea} from '../../../deferredActions/SendDelegateToArea';
import {IGlobalEvent} from '../../../turmoil/globalEvents/IGlobalEvent';
import {DeferredAction} from '../../../deferredActions/DeferredAction';
import {SelectGlobalCard} from '../../../inputs/SelectGlobalCard';

export class InciteEnder extends Card implements ICard, CorporationCard {
  constructor() {
    super({
      name: CardName.INCITE_ENDER,
      tags: [Tags.SCIENCE],
      startingMegaCredits: 48,
      cardType: CardType.CORPORATION,

      metadata: {
        cardNumber: 'Q24',
        description: `You start with 48 MC. As your first action, place two delegates in one party.`,
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(48).nbsp.delegates(2);
          b.corpBox('action', (ce) => {
            ce.vSpace();
            ce.action('Look at the top 3 cards of global events deck and discard any of them.', (eb) => {
              eb.empty().startAction.text('3').globalCards(1).asterix();
            });
            ce.effect('Get 1 influence per leader of the Non-dominant party.', (eb) => {
              eb.startEffect.plus().influence(1).slash().partyLeaders().empty().asterix();
            });
          });
        }),
      },
    });
  }

  public play() {
    return undefined;
  }

  public initialAction(player: Player) {
    if (player.game.turmoil) {
      const title = 'Incite first action - Select where to send two delegates';
      player.game.defer(new SendDelegateToArea(player, title, {count: 2, source: 'reserve'}));
    }

    return undefined;
  }

  public canAct(): boolean {
    return true;
  }

  public action(player: Player) {
    if (!player.game.turmoil) {
      return undefined;
    }

    const cards: Array<IGlobalEvent> = [];
    const globalEventDealer = player.game.turmoil.globalEventDealer;
    cards.unshift(globalEventDealer.draw()!);
    cards.unshift(globalEventDealer.draw()!);
    cards.unshift(globalEventDealer.draw()!);

    const cb = (selected: Array<IGlobalEvent>) => {
      const cards2 = cards.filter((x) => !selected.includes(x));
      while (cards2.length > 0) {
        globalEventDealer.putback(cards2.shift());
      }
      return undefined;
    };
    player.game.defer(new DeferredAction(
      player,
      () => new SelectGlobalCard(
        'Select card(s) to discard',
        'Discard',
        cards,
        cb,
        3,
        0,
      ),
    ));
    return undefined;
  }
}
