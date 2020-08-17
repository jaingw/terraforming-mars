import { expect } from "chai";
import { MicrogravityHealthProblems } from "../../src/turmoil/globalEvents/MicrogravityHealthProblems";
import { Player } from "../../src/Player";
import { Color } from "../../src/Color";
import { Game } from '../../src/Game';
import { Turmoil } from '../../src/turmoil/Turmoil';
import { Kelvinists } from '../../src/turmoil/parties/Kelvinists';
import { Luna } from "../../src/colonies/Luna";
import { Triton } from "../../src/colonies/Triton";

describe("MicrogravityHealthProblems", function () {
    it("resolve play", function () {
        const card = new MicrogravityHealthProblems();
        const player = new Player("test", Color.BLUE, false);
        const player2 = new Player("test2", Color.RED, false);
        const game = new Game("foobar", [player,player2], player);
        const turmoil = new Turmoil(game);
        let colony1 = new Luna();
        let colony2 = new Triton();
        colony1.colonies.push(player);
        colony2.colonies.push(player);        
        colony1.colonies.push(player2);
        colony2.colonies.push(player2);
        game.colonies.push(colony1);
        game.colonies.push(colony2);
        turmoil.chairman = player2;
        turmoil.dominantParty = new Kelvinists();
        turmoil.dominantParty.partyLeader = player2;
        turmoil.dominantParty.delegates.push(player2);
        player.megaCredits = 20;
        player2.megaCredits = 20;
        card.resolve(game, turmoil);
        expect(player.megaCredits).to.eq(14);
        expect(player2.megaCredits).to.eq(20);
    });
});