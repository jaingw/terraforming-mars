import {IPlayer} from '../../../IPlayer';
import {CardRenderer} from '../../render/CardRenderer';
import {MorningStarInc} from '../../venusNext/MorningStarInc';
import {CardName} from '../../../../common/cards/CardName';
import {CardMetadata} from '../../../../common/cards/CardMetadata';
import {Size} from '../../../../common/cards/render/Size';
import {Tag} from '../../../../common/cards/Tag';
import {Resource} from '../../../../common/Resource';
import {SerializedCard} from '../../../SerializedCard';

export class _MorningStarInc_ extends MorningStarInc {
  public isUsed: boolean = false;
  public override get name() {
    return CardName._MORNING_STAR_INC_;
  }

  public override play() {
    return undefined;
  }
  public canAct(player: IPlayer): boolean {
    if (this.isUsed !== true && player.isCorporation(CardName._MORNING_STAR_INC_)) return true;
    return false;
  }
  public action(player: IPlayer) {
    player.production.add(Resource.MEGACREDITS, player.tags.count(Tag.VENUS));
    this.isUsed = true;
    return undefined;
  }
  public override get metadata(): CardMetadata {
    return {
      cardNumber: 'R06',
      description: 'You start with 50 M€. As your first action, reveal cards from the deck until you have revealed 3 Venus-tag cards. Take those into hand and discard the rest.',
      renderData: CardRenderer.builder((b) => {
        b.megacredits(50).nbsp.cards(3, {secondaryTag: Tag.VENUS});
        b.corpBox('effect', (ce) => {
          ce.effect(undefined, (eb) => {
            ce.vSpace(Size.MEDIUM);
            eb.venus(1).startEffect.text('+/- 2');
          });
          ce.effect('Your Venus requirements are +/- 2 steps, your choice in each case. Once per game, increase your M€ production 1 step for each Venus tag you have.', (eb) => {
            eb.empty().startAction.production((pb) => pb.megacredits(1).slash().tag(Tag.VENUS)).asterix();
          });
        });
      }),
    };
  }

  public serialize(serialized: SerializedCard) {
    serialized.isUsed = this.isUsed;
  }

  public deserialize(serialized: SerializedCard) {
    this.isUsed = Boolean(serialized.isUsed);
  }
}
