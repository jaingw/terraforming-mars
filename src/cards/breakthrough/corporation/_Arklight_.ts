import {Player} from '../../../Player';
import {Tags} from '../../Tags';
import {IProjectCard} from '../../IProjectCard';
import {CardName} from '../../../CardName';
import {Arklight} from '../../colonies/Arklight';
import {CardRenderer} from '../../render/CardRenderer';
import {CardRenderDynamicVictoryPoints} from '../../render/CardRenderDynamicVictoryPoints';

export class _Arklight_ extends Arklight {
  public get name() {
    return CardName._ARKLIGHT_;
  }

  public onCardPlayed(player: Player, card: IProjectCard): void {
    if (player.isCorporation(CardName._ARKLIGHT_)) {
      const count = card.tags.filter((cardTag) => cardTag === Tags.ANIMAL || cardTag === Tags.PLANT).length;
      if (count > 0 ) {
        player.addResourceTo(this, count);
      }
    }
  }

  public get metadata() {
    return {
      cardNumber: 'R04',
      description: 'You start with 45 M€. Increase your M€ production 2 steps. 1 VP per 2 animals on this card.',
      renderData: CardRenderer.builder((b) => {
        b.megacredits(45).nbsp.production((pb) => pb.megacredits(2));
        b.corpBox('effect', (ce) => {
          ce.vSpace();
          ce.effect(undefined, (eb) => {
            eb.animals(1).played.slash().plants(1).played.startEffect.animals(1);
          });
          ce.vSpace();
          ce.effect('When you play an animal or plant tag, including this, add 1 animal to this card. When you gain an animal to ANY CARD, gain 1 M€.', (eb) => {
            eb.animals(1).asterix().startEffect.megacredits(1);
          });
          ce.vSpace(); // to offset the description to the top a bit so it can be readable
        });
      }),
      victoryPoints: CardRenderDynamicVictoryPoints.animals(1, 2),
    };
  }
}
