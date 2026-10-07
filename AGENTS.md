# Agent Notes

- In this repo, the Chinese shorthand `合并规则` refers to `.agents/MERGE_RULES.md`.
- When the user asks to "add to merge rules" or "follow merge rules", interpret that as work involving `.agents/MERGE_RULES.md`.
- userId handling:
  - Server-side user identity comparisons must go through `normalizeUserId`; do not compare full login tokens directly or hand-roll token truncation with `startsWith`/`substring` at call sites.
  - Server API responses must not expose `userId`, `ownerId`, `player.userId`, or login-token-derived user identifiers to the client.
  - When the client needs current-user state such as ownership, room membership, or ready status, have the server return explicit view booleans such as `isOwner`, `isCurrentUserInRoom`, or `currentUserReady`; do not make the client derive those states from userId.
