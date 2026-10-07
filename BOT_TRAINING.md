# Terraforming Mars Bot Training Notes

## Goal

Train an offline bot that can play Terraforming Mars against humans or other bots without relying on the browser UI.

This is best approached in stages:

1. Build a headless game environment that the bot can call directly.
2. Implement simple baseline bots first.
3. Add training only after the environment and action model are stable.

## Recommended Overall Strategy

Do not start with a large model or end-to-end reinforcement learning.

A more realistic path is:

1. Expose the game engine as a simulator.
2. Build a random legal-action bot.
3. Build a heuristic bot.
4. Generate large volumes of self-play or scripted-play data.
5. Train a policy model with imitation learning.
6. Later, consider self-play reinforcement learning.

## Step 1: Build a Headless Simulator

The most important prerequisite is a stable, batch-runnable environment that does not depend on the frontend.

The environment should support:

- initialize a game
- read full current state
- compute legal actions for the current player
- apply one action
- advance to the next state
- detect terminal state
- compute reward / score / rank

Suggested interface:

```ts
type Env = {
  reset(seed?: number): State
  legalActions(state: State): Action[]
  step(state: State, action: Action): {
    nextState: State
    reward: number
    done: boolean
  }
}
```

Without this layer, training will be slow, fragile, and tightly coupled to UI concerns.

## Step 2: Build Baseline Bots First

Before training, create simple bots to validate the environment.

### 1. Random Bot

Purpose:

- verifies legal action generation
- verifies that a full game can complete
- reveals engine edge cases quickly

### 2. Heuristic Bot

Purpose:

- creates a meaningful baseline
- generates higher-quality training data than random play

Examples of heuristic priorities:

- prefer affordable, efficient cards
- prioritize production growth early
- value terraforming progress near thresholds
- score cards by cost, tags, VP, and synergy

### 3. Limited Search Bot

Purpose:

- improves move quality without requiring learned policy
- serves as a stronger evaluation baseline

Examples:

- shallow rollout search
- beam search over top candidate actions
- limited lookahead during current turn

## Step 3: Define the Action Representation

Terraforming Mars has a large and irregular action space. Training quality depends heavily on how actions are encoded.

Actions should be normalized into a serializable schema such as:

```ts
type Action =
  | {type: 'play_card', cardId: string, paymentPlan: unknown, targets?: unknown}
  | {type: 'standard_project', projectType: string, targets?: unknown}
  | {type: 'claim_milestone', milestoneId: string}
  | {type: 'fund_award', awardId: string}
  | {type: 'pass'}
  | {type: 'select_corporation', corporationId: string}
  | {type: 'select_preludes', preludeIds: string[]}
  | {type: 'select_cards_to_buy', cardIds: string[]}
```

Requirements:

- every legal move must map into this schema
- every encoded action must be executable by the engine
- actions must be stable enough for dataset generation and replay

## Step 4: Define the State Representation

Do not feed raw frontend view models directly into training.

Use structured features.

### Global Features

- generation
- temperature
- oxygen
- oceans
- map and expansion settings
- current phase
- milestones and awards state

### Current Player Features

- resources
- production
- TR
- cards in hand
- cards in play
- available action flags

### Opponent Summary Features

- resource summaries
- production summaries
- TR
- visible tags / engine type
- public board position

### Hidden Information Policy

Decide early whether training uses:

- only observable information
- or full information during training with deployment-time masking

For this game, it is safer to model only observable information plus the bot's own hand.

## Step 5: Training Path

### Phase A: Imitation Learning

Generate datasets from heuristic or search-based bots:

- state
- legal actions
- selected action
- final result

Train a policy model to imitate these choices.

Benefits:

- easier optimization
- faster convergence than pure RL
- teaches basic competence before self-play

### Phase B: Self-Play Reinforcement Learning

After behavior cloning is stable, move to self-play.

Possible approaches:

- PPO
- policy/value training with self-play
- AlphaZero-style search plus learned priors

Challenges:

- long episodes
- sparse rewards
- large branching factor
- partial observability

### Phase C: League / Population Training

Do not train against only one opponent version.

Maintain a pool such as:

- random bot
- heuristic bot
- search bot
- previous learned checkpoints

Benefits:

- less overfitting
- stronger generalization
- more robust strategy development

## Step 6: Reward Design

Pure terminal win/loss rewards are usually too sparse for a game like this.

Use layered rewards carefully.

### Primary Reward

- win/loss
- rank placement
- final VP difference

### Auxiliary Reward Candidates

- TR increase
- production increase
- valuable engine development
- efficient card use

Be conservative. Poor auxiliary shaping can teach the bot to optimize short-term proxies instead of winning.

## Step 7: Evaluation

Do not judge progress only by training loss.

Evaluate by actual gameplay outcomes:

- win rate vs random bot
- win rate vs heuristic bot
- win rate vs older learned checkpoints
- performance by player count
- performance by map
- performance by expansion set
- average action latency

This game is easy to overfit to narrow conditions, so evaluation must be bucketed.

## What Not To Do First

Avoid these as a starting point:

- training directly from browser DOM
- using a large language model as the first bot
- jumping into end-to-end RL before baseline bots exist
- optimizing for "strongest possible AI" before stability

The first target should be:

"a bot that can legally and consistently finish full games."

## Practical Roadmap For This Repository

Recommended order:

1. Extract a headless simulator from the current game engine.
2. Add a standard legal-action API.
3. Define a stable action schema.
4. Implement a random bot.
5. Implement a heuristic bot.
6. Run large bot-vs-bot batches and collect datasets.
7. Train a first imitation policy.
8. Add self-play only after the above is stable.

## Future Extensions

Once the offline bot is stable, possible next steps:

- difficulty tiers
- map-specific or expansion-specific bots
- training for 1P, 2P, and multiplayer separately
- AI replay analysis
- AI teaching assistant
- AI draft / opening recommendations

## Summary

For this project, the right order is:

1. simulator
2. baseline bots
3. action/state design
4. imitation learning
5. self-play RL

The simulator and action model are the foundation. If those are weak, training quality will be poor no matter which model is used.
