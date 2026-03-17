import {expect} from 'chai';
import {Prism} from '../../../../src/server/cards/eros/corp/Prism';
import {testGame} from '../../../TestingUtils';
import {TestPlayer} from '../../../TestPlayer';
import {PowerPlant} from '../../../../src/server/cards/base/PowerPlant';
import {Lichen} from '../../../../src/server/cards/base/Lichen';
import {Steelworks} from '../../../../src/server/cards/base/Steelworks';
import {ResearchCoordination} from '../../../../src/server/cards/prelude/ResearchCoordination';
import {OlympusConference} from '../../../../src/server/cards/base/OlympusConference';
import {AdaptedLichen} from '../../../../src/server/cards/base/AdaptedLichen';
import {ResearchNetwork} from '../../../../src/server/cards/prelude/ResearchNetwork';
import {MediaGroup} from '../../../../src/server/cards/base/MediaGroup';
import {HiTechLab} from '../../../../src/server/cards/promo/HiTechLab';
import {CarbonNanosystems} from '../../../../src/server/cards/promo/CarbonNanosystems';
import {BusinessNetwork} from '../../../../src/server/cards/base/BusinessNetwork';
import {Grass} from '../../../../src/server/cards/base/Grass';
import {DeepWellHeating} from '../../../../src/server/cards/base/DeepWellHeating';
import {GeothermalPower} from '../../../../src/server/cards/base/GeothermalPower';

describe('Prism', () => {
  let card: Prism;
  let player: TestPlayer;


  beforeEach(() => {
    card = new Prism();
    const [_game, _player] = testGame(1, {skipInitialShuffling: true});
    player = _player;
    player.playCorporationCard(card);
  });


  it('单tag（PLANT）不足3无折扣，3个获得1折扣', () => {
    player.playCard(new Lichen());
    const baseCost = new Lichen().cost;
    expect(baseCost - player.getCardCost(new Lichen())).to.eq(0);
    player.playCard(new AdaptedLichen());
    expect(baseCost - player.getCardCost(new Lichen())).to.eq(1);
  });

  it('多tag卡牌各自计数', () => {
    // PowerPlant有BUILDING/POWER
    const baseCost = new PowerPlant().cost;
    player.playCard(new GeothermalPower());
    player.playCard(new DeepWellHeating());
    expect(baseCost - player.getCardCost(new PowerPlant())).to.eq(1); // BUILDING/POWER各1 + 1 wild（prism
    player.playCard(new PowerPlant());
    expect(baseCost - player.getCardCost(new PowerPlant())).to.eq(2); // BUILDING/POWER各2
  });

  it('多tag混合计数', () => {
    // OlympusConference有SCIENCE/EARTH/BUILDING
    const baseCost = new OlympusConference().cost;
    player.playCard(new MediaGroup());
    player.playCard(new HiTechLab());
    player.playCard(new CarbonNanosystems());
    player.playCard(new BusinessNetwork());
    // 打出两套 科标地球建筑标
    expect(baseCost - player.getCardCost(new OlympusConference())).to.eq(1);
    // 打出三套 科标地球建筑标
    player.playCard(new OlympusConference());
    expect(baseCost - player.getCardCost(new OlympusConference())).to.eq(3);
  });

  it('wild tag补足不足3的tag', () => {
    player.playCard(new Steelworks());
    player.playCard(new ResearchCoordination()); // wild tag
    const baseCost = new Steelworks().cost;
    expect(baseCost - player.getCardCost(new Steelworks())).to.eq(1);
  });

  it('wild tag多余时可补多个tag', () => {
    player.playCard(new Lichen());
    player.playCard(new AdaptedLichen());
    player.playCard(new ResearchCoordination());
    player.playCard(new ResearchNetwork());
    const baseCost = new Lichen().cost;
    expect(baseCost - player.getCardCost(new Lichen())).to.eq(1);
    player.playCard(new Grass());
    expect(baseCost - player.getCardCost(new Lichen())).to.eq(2);
  });
});
