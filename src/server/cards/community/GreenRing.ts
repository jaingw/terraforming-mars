import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICard} from '../ICard';
import { Size } from '../../../common/cards/render/Size';
import { IPlayer } from '../../IPlayer';
import { Tag } from '../../../common/cards/Tag';
import { IProjectCard, PlayableCard } from '../IProjectCard';
import { CardType } from '../../../common/cards/CardType';
import { isSpecialTile } from '../../boards/Board';
import { AltSecondaryTag } from '../../../common/cards/render/AltSecondaryTag';
import { SelectProjectCardToPlay } from '../../inputs/SelectProjectCardToPlay';
import { TileType } from '../../../common/TileType';

export class GreenRing extends CorporationCard implements ICard {
  constructor() {
    super({
      name: CardName.GREENRING,
      tags: [Tag.SPACE],
      startingMegaCredits: 40,
      // 請問今天能開發這公司嗎? 綠環公司(Green Ring), 40MC,1鈦標, 行動:回收一张你已打出的绿卡或蓝卡到你手上(但不能已特殊板块或回手牌),之後付費打出,之後棄掉此卡,可以將重播公司
      // 行動:回收一张已打出的绿卡或蓝卡到你手上(但不能已特殊板块或回手牌),之後付費打出,之後棄掉此卡,可以將重播公司
      metadata: {
        cardNumber: 'XB19',
        description: 'You start with 40 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.action("付费重新打出一张你已打出的蓝卡或绿卡,不能是放置特殊版块或者回手牌的卡,执行完效果后移除游戏", (eb) => {
              eb.megacredits(1, {text: '?'}).startAction;
              eb.text('replay', Size.SMALL, true);
              eb.nbsp.cards(1,{secondaryTag: AltSecondaryTag.BLUE}).text('OR').cards(1,{secondaryTag: AltSecondaryTag.GREEN});
            });
          });
        }),
      },
    });
  }
  
  public canAct(player: IPlayer): boolean {
    return this.getCards(player).length > 0;
  }

  private specialTiles : Array<string> = [
    CardName.CAPITAL,
    CardName.COMMERCIAL_DISTRICT,
    CardName.ECOLOGICAL_ZONE,
    CardName.INDUSTRIAL_CENTER,
    CardName.LAVA_FLOWS, // 7
    CardName.MINING_AREA, // 8
    CardName.MINING_RIGHTS, // 9
    CardName.MOHOLE_AREA, // 10
    CardName.NATURAL_PRESERVE, // 11
    CardName.NUCLEAR_ZONE, // 12
    CardName.RESTRICTED_AREA, // 13

    CardName.DEIMOS_DOWN, // 14
    CardName.GREAT_DAM, // 15
    CardName.MAGNETIC_FIELD_GENERATORS, // 16
    CardName.DEIMOS_DOWN_PROMO, // 14
    CardName.GREAT_DAM_PROMO, // 15
    CardName.MAGNETIC_FIELD_GENERATORS_PROMO, // 16

    CardName.BIOFERTILIZER_FACILITY, // 17
    CardName.METALLIC_ASTEROID, // 18
    CardName.SOLAR_FARM, // 19
    CardName.OCEAN_CITY, // 20, Also used in Pathfinders
    CardName.OCEAN_FARM, // 21
    CardName.OCEAN_SANCTUARY, // 22
    CardName.MINING_RIGHTS_ARES,
    CardName.MINING_AREA_ARES, 
    CardName.MARS_HOT_SPRING,

    // The Moon
    CardName.LUNA_TRADE_STATION, // 32
    CardName.LUNA_MINING_HUB, // 33
    CardName.LUNA_TRAIN_STATION, // 34
    CardName.LUNAR_MINE_URBANIZATION, // 35

    // Pathfinders
    CardName.WETLANDS, // 36
    CardName.RED_CITY, // 37
    CardName.MARTIAN_NATURE_WONDERS, // 38
    CardName.CRASHLANDING, // 39

    CardName.MARS_NOMADS, // 40
    CardName.REY_SKYWALKER, // 41

    // Underworld
    CardName.MAN_MADE_VOLCANO, // 42

    CardName.WASTE_INCINERATOR,
  ];
  private getCards(player: IPlayer): ReadonlyArray<IProjectCard> {
    return player.playedCards.filter((card) => {
      if (card.type !== CardType.AUTOMATED && card.type !== CardType.ACTIVE) {
        return false;
      }
      if (card.name === CardName.ASTRA_MECHANICA) {
        return false;
      }
      if (card.tilesBuilt.some(isSpecialTile)) {
        return false;
      }
      if( this.specialTiles.includes(card.name)){
        return false;
      }
      const  tileType = card.behavior?.tile?.type;
      if(tileType !== undefined && tileType !== TileType.GREENERY 
        && tileType !== TileType.OCEAN && tileType !== TileType.CITY){
          return false; 
      }

      const canPlay = player.canPlay(card);
      if (!canPlay) {
        return false;
      }

      const canAffordOptions = player.affordOptionsForCard(card);
      return player.canAfford(canAffordOptions) && card.canPlay(player, canAffordOptions);
    });
  }

  
  public action(player: IPlayer) {
    const candidates = this.getCards(player);
    if (candidates.length === 0) {
      player.game.log('${0} had no collectable green or blue project cards', (b) => b.player(player));
      return undefined;
    }
    
    const playableCards: Array<PlayableCard> = [];
    for (const card of candidates) {
      card.warnings.clear();

      playableCards.push({
        card,
        details: true,
      });
    }
    
    return new SelectProjectCardToPlay(player, playableCards).andThen((selectedCard) => {
      // SelectProjectCardToPlay会先打出卡牌, 再执行andThen, 这里应该先回收的
      // 先回收
      player.playedCards = player.playedCards.filter((c) => c.name !== selectedCard.name);
      selectedCard.onDiscard?.(player);
      
      //再重新打出
      // player.playCard(selectedCard, undefined, 'nothing'); // Play the card but don't add it to played cards
      return undefined;
    });
    
  }
 
}
