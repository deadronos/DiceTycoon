# D003 — Autoroll & Automation Design

## Overview

This design defines autoroll mechanics, upgrades, configuration, cooldowns, and UI interaction for automating roll actions.

## Requirements (EARS-style)

- WHEN autoroll is enabled, THE SYSTEM SHALL automatically execute roll actions at a configured cooldown interval (Acceptance: autoroll triggers queued rolls without UI blocking).
- WHEN autoroll is upgraded, THE SYSTEM SHALL decrease cooldown or increase batch size per upgrade rules (Acceptance: cooldown reduces and cost is deducted).
- WHEN autoroll is disabled, THE SYSTEM SHALL stop automatic roll scheduling immediately (Acceptance: no autoroll triggers occur after disabling).

## Autoroll Model

State:

{
  enabled: boolean,
  level: number,
  cooldown: Decimal, // seconds
  batchSize: number // how many roll actions to group per autoroll trigger (optional)
}

Default:

- enabled: false
- level: 0
- cooldown: Decimal(2.0)
- batchSize: 1

## Upgrade Path

- Each autoroll level reduces cooldown by a percent or reduces cooldown by additive seconds; use multiplicative reduction for diminishing returns e.g., cooldown = baseCooldown × (0.9 ^ level).
- Alternatively allow upgrades to increase batchSize for more efficient rolling.

## Implementation considerations

- Use a debounced scheduler and `setTimeout`/`setInterval` in a background loop but ensure UI updates are batched via requestAnimationFrame.
- Autoroll should be paused when the tab is inactive (use Page Visibility API) to avoid unwanted resource usage.
- Store cooldown as Decimal in state and use milliseconds for timers (convert safely).

## Performance and batching

- Batch multiple autoroll actions into single state updates to avoid UI churn and expensive Decimal calculations on every micro-roll.
- Provide a maximum autoroll batch size to cap computation per tick.

## Testing

- Unit tests for cooldown calculation and upgrade behavior.
- Integration test: enable autoroll and assert that rolls occur at expected intervals and that batching yields correct credit totals for a given simulated RNG.

## Acceptance tests

- Player enables autoroll, waits N seconds, and asserts credits increased according to expected autoroll triggers.
- Upgrading autoroll updates cooldown and results in increased credits per real-time second.

## Notes

- Consider autoroll energy/stamina costs in future to provide decisions for players instead of pure time-gating.
- Autoroll must respect player's explicit toggles and not re-enable after page reload unless player opted in.
