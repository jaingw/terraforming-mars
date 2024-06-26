import {expect} from 'chai';
import {QuantumCommunications} from '../../../src/server/cards/colonies/QuantumCommunications';
import {Luna} from '../../../src/server/colonies/Luna';
import {Triton} from '../../../src/server/colonies/Triton';
import {Game} from '../../../src/server/Game';
import {TestPlayer} from '../../TestPlayer';
import {cast} from '../../TestingUtils';

describe('QuantumCommunications', function() {
  it('Should play', function() {
    const card = new QuantumCommunications();
    const player = TestPlayer.BLUE.newPlayer();
    const player2 = TestPlayer.RED.newPlayer();
    Game.newInstance('gameid', [player, player2], player);
    const colony1 = new Luna();
    const colony2 = new Triton();

    colony1.colonies.push(player);
    colony2.colonies.push(player);

    player.game.colonies.push(colony1);
    player.game.colonies.push(colony2);

    cast(card.play(player), undefined);
    expect(player.production.megacredits).to.eq(2);
    expect(card.getVictoryPoints(player)).to.eq(1);
  });
});
