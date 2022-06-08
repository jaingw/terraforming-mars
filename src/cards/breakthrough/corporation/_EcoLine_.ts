
import {Player} from '../../../Player';
import {IProjectCard} from '../../IProjectCard';
import {EcoLine} from '../../corporation/EcoLine';
import {CardRenderer} from '../../render/CardRenderer';
import {digit, played} from '../../Options';
import {CardName} from '../../../common/cards/CardName';
import {ICardMetadata} from '../../../common/cards/ICardMetadata';
import {Size} from '../../../common/cards/render/Size';
import {Tags} from '../../../common/cards/Tags';
import {Resources} from '../../../common/Resources';
import {ICorporationCard} from '../../corporation/ICorporationCard';

export class _EcoLine_ extends EcoLine {
  public override get name() {
    return CardName._ECOLINE_;
  }

  public override get startingMegaCredits() : number {
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

  public onCorpCardPlayed(player: Player, card: ICorporationCard) {
    return this.onCardPlayed(player, card as unknown as IProjectCard);
  }

  public override get metadata(): ICardMetadata {
    return {
      cardNumber: 'R17',
      description: 'You start with 2 plant production, 3 plants, and 36 M€.',
      renderData: CardRenderer.builder((b) => {
        b.br;
        b.production((pb) => pb.plants(2)).nbsp.megacredits(36).plants(3, {digit});
        b.corpBox('effect', (ce) => {
          ce.effect(undefined, (eb) => {
            ce.vSpace(Size.LARGE);
            eb.plants(7, {digit}).startAction.greenery();
          });
          ce.effect('You may pay 7 plants to place greenery. When play a plant tag card, gain 2 M€.', (eb) => {
            eb.plants(1, {played}).startEffect.megacredits(2);
          });
        });
      }),
    };
  }
}


