
import {Tags} from '../../Tags';
import {Player} from '../../../Player';
import {Resources} from '../../../Resources';
import {CardName} from '../../../CardName';
import {IProjectCard} from '../../IProjectCard';
import {EcoLine} from '../../corporation/EcoLine';
import {CardMetadata} from '../../CardMetadata';
import {CardRenderer} from '../../render/CardRenderer';
import {Size} from '../../render/Size';
import {CorporationCard} from '../../corporation/CorporationCard';

export class _EcoLine_ extends EcoLine {
  public get name() {
    return CardName._ECOLINE_;
  }

  public get startingMegaCredits() : number {
    return 38;
  }

  public onCardPlayed(player: Player, card: IProjectCard) {
    if (player.corpName(this.name)) {
      for (const tag of card.tags) {
        if (tag === Tags.PLANT) {
          player.addResource(Resources.MEGACREDITS, 2);
        }
      }
    }
  }

  public onCorpCardPlayed(player: Player, card: CorporationCard) {
    return this.onCardPlayed(player, card as IProjectCard);
  }

  public get metadata(): CardMetadata {
    return {
      cardNumber: 'R17',
      description: 'You start with 2 plant production, 3 plants, and 36 M€.',
      renderData: CardRenderer.builder((b) => {
        b.br;
        b.production((pb) => pb.plants(2)).nbsp.megacredits(36).plants(3).digit;
        b.corpBox('effect', (ce) => {
          ce.effect(undefined, (eb) => {
            ce.vSpace(Size.LARGE);
            eb.plants(7).digit.startAction.greenery();
          });
          ce.effect('You may pay 7 plants to place greenery. When play a plant tag card, gain 2 M€.', (eb) => {
            eb.plants(1).played.startEffect.megacredits(2);
          });
        });
      }),
    };
  }
}


