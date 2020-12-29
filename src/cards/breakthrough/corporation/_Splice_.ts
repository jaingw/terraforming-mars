import {Tags} from '../../Tags';
import {Player} from '../../../Player';
import {Game} from '../../../Game';
import {IProjectCard} from '../../IProjectCard';
import {CorporationCard} from '../../corporation/CorporationCard';
import {SelectOption} from '../../../inputs/SelectOption';
import {OrOptions} from '../../../inputs/OrOptions';
import {ResourceType} from '../../../ResourceType';
import {CardName} from '../../../CardName';
import {ICard} from '../../ICard';
import {CardType} from '../../CardType';

export class _Splice_ implements CorporationCard {
    public name: CardName = CardName._SPLICE_;
    public tags: Array<Tags> = [Tags.MICROBE];
    public startingMegaCredits: number = 48; // 44 + 4 as card resolution when played
    public cardType: CardType = CardType.CORPORATION;

    public initialAction(player: Player, game: Game) {
      const drawnCards = game.drawCardsByTag(Tags.MICROBE, 2);
      for (const foundCard of drawnCards) {
        player.cardsInHand.push(foundCard);
      }

      game.log('${0} drew ${1} and ${2}', (b) => b.player(player).card(drawnCards[0]).card(drawnCards[1]));

      return undefined;
    }

    public onCardPlayed(player: Player, game: Game, card: IProjectCard) {
      if (card.tags.indexOf(Tags.MICROBE) === -1) {
        return undefined;
      }

      const gainPerMicrobe = 2;
      const microbeTagsCount = card.tags.filter((tag) => tag === Tags.MICROBE).length;
      const megacreditsGain = microbeTagsCount * gainPerMicrobe;

      const addResource = new SelectOption('Add a microbe resource to this card', 'Add microbe', () => {
        player.addResourceTo(card);
        return undefined;
      });

      const getMegacredits = new SelectOption(`Gain ${megacreditsGain} MC`, 'Gain MC', () => {
        player.megaCredits += megacreditsGain;
        return undefined;
      });

      // Splice owner get 2MC per microbe tag
      game.getCardPlayer(this.name).megaCredits += megacreditsGain;

      // Card player choose between 2 MC and a microbe on card, if possible
      if (card.resourceType !== undefined && card.resourceType === ResourceType.MICROBE) {
        return new OrOptions(addResource, getMegacredits);
      } else {
        player.megaCredits += megacreditsGain;
        return undefined;
      }
    }

    public onCorpCardPlayed(player: Player, game: Game, card: CorporationCard): void {
      this.onCardPlayed(player, game, card as ICard as IProjectCard);
    }

    public play() {
      return undefined;
    }
}
