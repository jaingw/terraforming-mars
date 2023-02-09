// import {CardType} from '../../../common/cards/CardType';
// import {CardName} from '../../../common/cards/CardName';
// import {CardRenderer} from '../render/CardRenderer';
// import {Card} from '../Card';
// import {Tag} from '../../../common/cards/Tag';
// import {played} from '../Options';
// import {ICorporationCard} from '../corporation/ICorporationCard';
// import {ResourceType} from '../../../common/ResourceType';
//
// export class SearingAsteroid extends Card implements ICorporationCard {
//   constructor() {
//     super({
//       cardType: CardType.CORPORATION,
//       name: CardName.SEARING_ASTEROID,
//       tags: [Tag.SPACE],
//       startingMegaCredits: 48,
//       resourceType: ResourceType.ASTEROID,
//
//       metadata: {
//         cardNumber: 'XB10',
//         renderData: CardRenderer.builder((b) => {
//           b.megacredits(48).asteroids(1).asteroids(1).br;
//           b.effect('When you increase a temperature, add 1 Asteroid resource to this card.', (eb) => {
//             eb.temperature(1).startEffect.asteroids(1);
//           }).br;
//           b.effect('When paying for a space card, or the STANDARD TEMPERATURE PROJECT, Asteroid here may be used as 3 M€ each.', (eb) => {
//             eb.titanium(1, {played}).slash().temperature(1).startEffect.asteroids(1).equals().megacredits(3);
//           }).br;
//         }),
//         description: 'You start with 48M€ and 2 Asteroid  on this card.',
//       },
//     });
//   }
//
//   public override resourceCount = 0;
//
//   public play() {
//     this.resourceCount += 2;
//     return undefined;
//   }
// }
//
