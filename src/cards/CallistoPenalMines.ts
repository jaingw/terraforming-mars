
import {IProjectCard} from './IProjectCard';
import {Tags} from './Tags';
import {CardType} from './CardType';
import {Player} from '../Player';

export class CallistoPenalMines implements IProjectCard {
    public cost: number = 24;
    public tags: Array<Tags> = [Tags.JOVIAN, Tags.SPACE];
    public name: string = 'Callisto Penal Mines';
    public cardType: CardType = CardType.AUTOMATED;
    public canPlay(): boolean {
      return true;
    }
    public play(player: Player) {
      player.megaCreditProduction += 3;
      return undefined;
    }
    public getVictoryPoints() {
      return 2;
    }
}
