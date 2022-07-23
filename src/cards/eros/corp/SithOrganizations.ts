import {CardRenderer} from '../../render/CardRenderer';
import {Card} from '../../Card';
import {ICard} from '../../ICard';
import {Player} from '../../../Player';
// import {DeferredAction} from '../../../deferredActions/DeferredAction';
// import {OrOptions} from '../../../inputs/OrOptions';
// import {SelectOption} from '../../../inputs/SelectOption';
// import {SelectAmount} from '../../../inputs/SelectAmount';
// import {AndOptions} from '../../../inputs/AndOptions';
// import {all} from '../../Options';
import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Size} from '../../../common/cards/render/Size';
import {Tags} from '../../../common/cards/Tags';
import {ICorporationCard} from '../../corporation/ICorporationCard';
// import {SendDelegateToArea} from '../../../deferredActions/SendDelegateToArea';

export class SithOrganizations extends Card implements ICard, ICorporationCard {
  constructor() {
    super({
      name: CardName.SITH_ORGANIZATIONS,
      tags: [Tags.VENUS, Tags.JOVIAN],
      startingMegaCredits: 41,
      cardType: CardType.CORPORATION,

      metadata: {
        cardNumber: 'Q32',
        // description: 'You start with 41 M€. As your first action, transform all Neutral delegates to your delegates.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(41, {size: Size.TINY}).nbsp.nbsp.chairman().br;
          b.text('(You start with 41 M€. As your first action, transform all Neutral delegates to your delegates.)', Size.TINY, false, false);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.LARGE);
            // ce.action('Send a delegate to any party.', (eb) => {
            //   eb.empty().startAction.delegates(1).asterix();
            // });
            ce.effect('Your delegates count as neutral delegates. If neutral delegate becomes chairman, you can decide: let all other player lose 1 TR, or ignore their ruling bonus.', (eb) => {
              eb.delegates(1).startEffect.delegates(1).nbsp.nbsp.chairman().asterix();
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
    const game = player.game;
    if (game.turmoil !== undefined) {
      const turmoil = game.turmoil;
      const parties = game.turmoil.parties;
      for (let i = 0; i < 6; i++) {
        turmoil.delegateReserve.push('NEUTRAL');
      }
      parties.forEach((party)=>{
        const neutral = party.getDelegates('NEUTRAL');
        for (let i=0; i<neutral; i++) {
          turmoil.removeDelegateFromParty('NEUTRAL', party.name, game);
          turmoil.delegateReserve.push(player);
          turmoil.sendDelegateToParty(player, party.name, game, 'reserve');
        }
      });
      turmoil.chairman = player;
      const index = turmoil.delegateReserve.indexOf(player);
      if (index > -1) {
        turmoil.delegateReserve.splice(index, 1);
      }
      game.log('All Neutral delegates count as ${0}', (b) => b.player(player));
      return undefined;
    }
    return undefined;
  }

  // public action(player: Player) {
  //   if (player.game.turmoil) {
  //     player.game.defer(new SendDelegateToArea(player, 'Select where to send a delegate', {source: 'reserve'}));
  //   }
  //   return undefined;
  // }
  //
  // public canAct(): boolean {
  //   return true;
  // }
}

