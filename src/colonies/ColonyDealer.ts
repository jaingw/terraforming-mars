import {IColony} from './IColony';
import {ColonyName} from '../common/colonies/ColonyName';
import {SerializedColony} from '../SerializedColony';
import {Player} from '../Player';
import {Game} from '../Game';
import {Tags} from '../common/cards/Tags';
import {SerializedPlayerId} from '../SerializedPlayer';
import {Random} from '../Random';
import {ALL_COLONIES_TILES, BASE_COLONIES_TILES, COMMUNITY_COLONIES_TILES, COMMUNITY_COLONIES_TILES_REMOVED} from './ColonyManifest';

// TODO(kberg): Add ability to hard-code chosen colonies, separate from customColoniesList, so as to not be
// forced to rely on randomness.
// TODO(kberg): Add ability to disable initial action that removes a colony in the solo game. (Or come up with
// a simple line of code to deal with solo games.)

// Function to return a card object by its name
export function getColonyByName(colonyName: string): IColony | undefined {
  const colonyTiles = ALL_COLONIES_TILES.concat(COMMUNITY_COLONIES_TILES_REMOVED);
  const colonyFactory = colonyTiles.find((colonyFactory) => colonyFactory.colonyName === colonyName);
  if (colonyFactory !== undefined) {
    return new colonyFactory.Factory();
  }
  return undefined;
}

export function checkActivationVenus(game: Game): boolean {
  const players = game.getPlayers();
  for (let i =0; i<players.length; i++) {
    const player = players[i];
    if (player.corpCard !== undefined && player.corpCard.resourceType !== undefined && player.corpCard.tags.includes(Tags.VENUS) ) {
      return true;
    }
    if (player.corpCard2 !== undefined && player.corpCard2.resourceType !== undefined && player.corpCard2.tags.includes(Tags.VENUS)) {
      return true;
    }
    const resourceCard = player.playedCards.find((card) => card.resourceType !== undefined && card.tags.includes(Tags.VENUS));
    if (resourceCard !== undefined) return true;
    return false;
  }
  return false;
}

export function serializeColonies(colonies: Array<IColony>): Array<SerializedColony> {
  return colonies.map( (x) => {
    return {
      colonies: x.colonies.map( (p) => p.serializeId()),
      name: x.name,
      isActive: x.isActive,
      trackPosition: x.trackPosition,
      visitor: x.visitor?.serializeId(),
    } as SerializedColony;
  });
}
export function deserializeColonies(colonies: Array<SerializedColony>, players:Array<Player>): Array<IColony> {
  const result: Array<IColony> = [];
  for (const serialized of colonies) {
    if (serialized === undefined || serialized === null) {
      console.warn(`colony ${serialized} not found`);
      continue;
    }
    const colony = getColonyByName(serialized.name);
    if (colony !== undefined) {
      colony.isActive = serialized.isActive;
      // colony.visitor = serialized.visitor;
      colony.trackPosition = serialized.trackPosition;
      // colony.colonies = serialized.colonies;
      // colony.resourceType = serialized.resourceType;

      if (serialized.visitor) {
        const player = players.find((player) => player.id === serialized.visitor!.id);
        colony.visitor = player;
      }
      colony.colonies = [];
      serialized.colonies.forEach((element: SerializedPlayerId) => {
        const player = players.find((player) => player.id === element.id);
        if (player) {
          colony!.colonies.push(player);
        }
      });

      result.push(colony);
    } else {
      console.warn(`colony ${serialized.name} not found`);
    }
  }
  return result;
}

export class ColonyDealer {
  public discardedColonies: Array<IColony> = [];

  constructor(private rng: Random) {}

  private shuffle(cards: Array<IColony>): Array<IColony> {
    const deck: Array<IColony> = [];
    const copy = cards.slice();
    while (copy.length) {
      deck.push(copy.splice(Math.floor(this.rng.nextInt(copy.length)), 1)[0]);
    }
    return deck;
  }
  public drawColonies(players: number, allowList: Array<ColonyName> = [], venusNextExtension: boolean, turmoilExtension: boolean, addCommunityColonies: boolean = false): Array<IColony> {
    let colonyTiles = BASE_COLONIES_TILES;
    if (addCommunityColonies) colonyTiles = colonyTiles.concat(COMMUNITY_COLONIES_TILES);
    if (!venusNextExtension) colonyTiles = colonyTiles.filter((c) => c.colonyName !== ColonyName.VENUS);
    if (!turmoilExtension) colonyTiles = colonyTiles.filter((c) => c.colonyName !== ColonyName.PALLAS);
    const allowListEmpty : boolean = allowList.length === 0;
    if (allowListEmpty) {
      colonyTiles.forEach((e) => allowList.push(e.colonyName));
    }

    // Two-player games and solo games get one more colony.
    const count: number = (players + 2) + (players <= 2 ? 1 : 0);

    const tempDeck = this.shuffle(
      colonyTiles.filter(
        (el) => allowList.includes(el.colonyName),
      ).map(
        (cf) => new cf.Factory(),
      ),
    );
    const deck = [];
    for (let i = 0; i < count; i++) {
      deck.push(tempDeck.pop()!);
    }
    this.discardedColonies.push(...tempDeck);
    this.discardedColonies.sort((a, b) => (a.name > b.name) ? 1 : -1);
    deck.sort((a, b) => (a.name > b.name) ? 1 : -1);

    if (allowListEmpty) {
      allowList = [];
    }
    return deck;
  }
}
