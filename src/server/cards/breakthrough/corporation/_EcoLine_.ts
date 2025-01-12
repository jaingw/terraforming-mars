
import {IPlayer} from '../../../IPlayer';
import {IProjectCard} from '../../IProjectCard';
import {EcoLine} from '../../corporation/EcoLine';
import {CardRenderer} from '../../render/CardRenderer';
import {digit} from '../../Options';
import {CardName} from '../../../../common/cards/CardName';
import {CardMetadata} from '../../../../common/cards/CardMetadata';
import {Size} from '../../../../common/cards/render/Size';
import {Tag} from '../../../../common/cards/Tag';
import {Resource} from '../../../../common/Resource';
import {ICorporationCard} from '../../corporation/ICorporationCard';
import {PlayerInput} from '../../../PlayerInput';

export class _EcoLine_ extends EcoLine {
  public override get name() {
    return CardName._ECOLINE_;
  }

  public override get startingMegaCredits() : number {
    return 38;
  }

  public onCardPlayed(player: IPlayer, card: IProjectCard) {
    if (player.isCorporation(this.name)) {
      for (const tag of card.tags) {
        if (tag === Tag.PLANT) {
          player.stock.add(Resource.MEGACREDITS, 2);
        }
      }
    }
  }

  public onCorpCardPlayed(player: IPlayer, card: ICorporationCard) :PlayerInput | undefined {
    this.onCardPlayed(player, card as unknown as IProjectCard);
    return undefined;
  }

  public override get metadata(): CardMetadata {
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
            eb.tag(Tag.PLANT).startEffect.megacredits(2);
          });
        });
      }),
    };
  }
}


