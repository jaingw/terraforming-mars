import {Tags} from '../../Tags';
import {Player} from '../../../Player';
import {CorporationCard} from '../../corporation/CorporationCard';
import {ISpace} from '../../../boards/ISpace';
import {SpaceBonus} from '../../../SpaceBonus';
import {Resources} from '../../../Resources';
import {CardName} from '../../../CardName';
import {CardType} from '../../CardType';
import {CardMetadata} from '../../CardMetadata';
import {CardRenderer} from '../../render/CardRenderer';
import {CardRenderItemSize} from '../../render/CardRenderItemSize';
import {GainProduction} from '../../../deferredActions/GainProduction';
import {Phase} from '../../../Phase';

export class _MiningGuild_ implements CorporationCard {
    public name: CardName = CardName._MINING_GUILD_;
    public tags: Array<Tags> = [Tags.BUILDING, Tags.BUILDING];
    public startingMegaCredits: number = 30;
    public cardType: CardType = CardType.CORPORATION;

    public onTilePlaced(cardOwner: Player, activePlayer: Player, space: ISpace) {
      if (cardOwner.id !== activePlayer.id || cardOwner.game.phase === Phase.SOLAR) {
        return;
      }
      if (space.bonus.some((bonus) => bonus === SpaceBonus.STEEL || bonus === SpaceBonus.TITANIUM)) {
        cardOwner.game.defer(new GainProduction(cardOwner, Resources.STEEL));
      }
    }


    public play(player: Player) {
      player.steel = 5;
      player.addProduction(Resources.STEEL);
      return undefined;
    }
    public metadata: CardMetadata = {
      cardNumber: 'B02',
      // description: 'You start with 30 MC, 5 steel and 1 steel production.',
      renderData: CardRenderer.builder((b) => {
        b.megacredits(30).steel(5).digit.nbsp.production((pb) => pb.steel(1));
        b.text('(You start with 30 MC, 5 steel and 1 steel production.)', CardRenderItemSize.TINY, false, false);
        b.corpBox('effect', (ce) => {
          ce.vSpace(CardRenderItemSize.LARGE);
          ce.effect(undefined, (eb) => {
            eb.steel(1).slash().titanium(1).startEffect.production((pb) => pb.steel(1));
          });
          ce.effect('Each time you get steel/titanium as placement bonus, increase 1 steel prod.You can use 4 steel to trade or pay for city standard project.', (eb) => {
            eb.steel(4).digit.startAction.trade().city(CardRenderItemSize.SMALL).steel(1).brackets;
          });
        });
      }),
    }
}
