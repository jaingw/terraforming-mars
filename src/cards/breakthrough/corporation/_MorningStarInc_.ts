import {Player} from '../../../Player';
import {CardRenderer} from '../../render/CardRenderer';
import {MorningStarInc} from '../../venusNext/MorningStarInc';
import {played} from '../../Options';
import {CardName} from '../../../common/cards/CardName';
import {ICardMetadata} from '../../../common/cards/ICardMetadata';
import {Size} from '../../../common/cards/render/Size';
import {Tags} from '../../../common/cards/Tags';
import {Resources} from '../../../common/Resources';

export class _MorningStarInc_ extends MorningStarInc {
  public isUsed: boolean = false;
  public override get name() {
    return CardName._MORNING_STAR_INC_;
  }

  public override play() {
    return undefined;
  }
  public canAct(): boolean {
    if (this.isUsed !== true) return true;
    return false;
  }
  public action(player: Player) {
    player.addProduction(Resources.MEGACREDITS, player.getTagCount(Tags.VENUS));
    this.isUsed = true;
    return undefined;
  }
  public override get metadata(): ICardMetadata {
    return {
      cardNumber: 'R06',
      description: 'You start with 50 M€. As your first action, reveal cards from the deck until you have revealed 3 Venus-tag cards. Take those into hand and discard the rest.',
      renderData: CardRenderer.builder((b) => {
        b.megacredits(50).nbsp.cards(3, {secondaryTag: Tags.VENUS});
        b.corpBox('effect', (ce) => {
          ce.effect(undefined, (eb) => {
            ce.vSpace(Size.MEDIUM);
            eb.venus(1).startEffect.text('+/- 2');
          });
          ce.effect('Your Venus requirements are +/- 2 steps, your choice in each case. Once per game, increase your M€ production 1 step for each Venus tag you have.', (eb) => {
            eb.empty().startAction.production((pb) => pb.megacredits(1).slash().venus(1, {played})).asterix();
          });
        });
      }),
    };
  }
}
