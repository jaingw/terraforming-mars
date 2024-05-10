import {CardRenderer} from '../../render/CardRenderer';
import {IPlayer} from '../../../IPlayer';
import {CardName} from '../../../../common/cards/CardName';
import {Size} from '../../../../common/cards/render/Size';
import {Tag} from '../../../../common/cards/Tag';
import {CorporationCard} from '../../corporation/CorporationCard';

export class SithOrganizations extends CorporationCard {
  constructor() {
    super({
      name: CardName.SITH_ORGANIZATIONS,
      tags: [Tag.VENUS, Tag.JOVIAN],
      startingMegaCredits: 41,

      metadata: {
        cardNumber: 'Q32',
        // description: 'You start with 41 M€. As your first action, transform all Neutral delegates to your delegates.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(41, {size: Size.TINY}).nbsp.nbsp.chairman().br;
          b.text('(You start with 41 M€. As your first action, transform all Neutral delegates to your delegates.)', Size.TINY, false, false);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.LARGE);
            ce.effect('Your delegates count as neutral delegates. If neutral delegate becomes chairman, you can decide: let all other player lose 1 TR, or ignore their ruling bonus.', (eb) => {
              eb.delegates(1).startEffect.delegates(1).nbsp.nbsp.chairman().asterix();
            });
          });
        }),
      },
    });
  }


  public initialAction(player: IPlayer) {
    const game = player.game;
    if (game.turmoil !== undefined) {
      const turmoil = game.turmoil;
      const parties = game.turmoil.parties;
      for (let i = 0; i < 6; i++) {
        turmoil.delegateReserve.add('NEUTRAL');
      }
      parties.forEach((party)=>{
        const neutral = party.delegates.get('NEUTRAL');
        for (let i=0; i<neutral; i++) {
          turmoil.removeDelegateFromParty('NEUTRAL', party.name, game);
          turmoil.delegateReserve.add(player);
          turmoil.sendDelegateToParty(player, party.name, game);
        }
      });
      turmoil.chairman = player;
      const index = turmoil.delegateReserve.get(player);
      if (index > 0) {
        turmoil.delegateReserve.remove(player);
      }
      game.log('All Neutral delegates count as ${0}', (b) => b.player(player));
      return undefined;
    }
    return undefined;
  }
}

