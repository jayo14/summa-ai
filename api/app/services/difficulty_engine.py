"""Difficulty Engine — adaptive difficulty calibration based on recent performance.

Provides:
- DifficultyEngine: compute suggested difficulty from rolling attempt history
- AdaptiveScaler: smooth difficulty transitions with momentum
"""

from typing import Any, Dict, List, Optional


DIFFICULTY_LEVELS = ["easy", "medium", "hard", "exam-level"]
DIFFICULTY_WEIGHTS = {
    "beginner": 0.6,
    "easy": 0.8,
    "medium": 1.0,
    "hard": 1.2,
    "exam-level": 1.4,
    "advanced": 1.5,
}


class DifficultyEngine:
    """Compute adaptive difficulty from recent attempt history."""

    def __init__(self, window: int = 8):
        self.window = window

    def compute_difficulty(
        self,
        recent_attempts: List[Dict[str, Any]],
        current_difficulty: str = "medium",
        streak_override: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Analyze recent attempts and suggest difficulty.

        Returns dict with:
            suggested: recommended difficulty level
            reasoning: explanation of why
            confidence: high/medium/low based on evidence
            metrics: breakdown stats
        """
        if not recent_attempts:
            return {
                "suggested": "medium",
                "reasoning": "No recent attempts — defaulting to medium.",
                "confidence": "low",
                "metrics": {"accuracy": 0, "streak": 0, "count": 0},
            }

        window = recent_attempts[-self.window:]
        total = len(window)
        correct = sum(1 for a in window if a.get("correct"))
        accuracy = round(correct / total, 2) if total > 0 else 0

        # Compute consecutive streak
        streak = 0
        streak_type = None
        for a in reversed(window):
            is_correct = a.get("correct")
            if streak_type is None:
                streak_type = is_correct
            if is_correct == streak_type:
                streak += 1
            else:
                break

        # Compute average response time
        times = [a.get("response_time_ms", 0) for a in window if a.get("response_time_ms")]
        avg_time = sum(times) / len(times) if times else 0

        # Compute average confidence
        confs = [a.get("confidence_rating", 0.5) for a in window if a.get("confidence_rating")]
        avg_confidence = sum(confs) / len(confs) if confs else 0.5

        # Decision logic
        suggested = current_difficulty
        reasoning = ""
        confidence = "medium"

        if streak_override:
            suggested = streak_override
            reasoning = f"Explicit difficulty override: {streak_override}"
            confidence = "high"
        elif accuracy >= 0.85 and streak >= 3:
            # Student is on a roll — increase difficulty
            idx = DIFFICULTY_LEVELS.index(current_difficulty) if current_difficulty in DIFFICULTY_LEVELS else 1
            suggested = DIFFICULTY_LEVELS[min(idx + 1, len(DIFFICULTY_LEVELS) - 1)]
            reasoning = f"Strong performance: {accuracy:.0%} accuracy over {total} attempts with {streak}-streak correct."
            confidence = "high"
        elif accuracy <= 0.4 and streak >= 2:
            # Student is struggling — decrease difficulty
            idx = DIFFICULTY_LEVELS.index(current_difficulty) if current_difficulty in DIFFICULTY_LEVELS else 1
            suggested = DIFFICULTY_LEVELS[max(idx - 1, 0)]
            reasoning = f"Weak performance: {accuracy:.0%} accuracy with {streak}-streak incorrect."
            confidence = "high"
        elif accuracy < 0.6:
            # Below threshold — ease slightly
            idx = DIFFICULTY_LEVELS.index(current_difficulty) if current_difficulty in DIFFICULTY_LEVELS else 1
            suggested = DIFFICULTY_LEVELS[max(idx - 1, 0)]
            reasoning = f"Below 60% accuracy ({accuracy:.0%}) — stepping down."
            confidence = "medium"
        elif accuracy > 0.8:
            # Above threshold — try harder
            idx = DIFFICULTY_LEVELS.index(current_difficulty) if current_difficulty in DIFFICULTY_LEVELS else 1
            suggested = DIFFICULTY_LEVELS[min(idx + 1, len(DIFFICULTY_LEVELS) - 1)]
            reasoning = f"Above 80% accuracy ({accuracy:.0%}) — stepping up."
            confidence = "medium"
        else:
            reasoning = f"Stable performance ({accuracy:.0%}) — maintaining {current_difficulty}."
            confidence = "medium"

        # Fast response + high accuracy = even more confident in step-up
        if avg_time > 0 and avg_time < 5000 and accuracy > 0.8:
            if suggested == current_difficulty:
                idx = DIFFICULTY_LEVELS.index(current_difficulty) if current_difficulty in DIFFICULTY_LEVELS else 1
                suggested = DIFFICULTY_LEVELS[min(idx + 1, len(DIFFICULTY_LEVELS) - 1)]
                reasoning += f" Fast response time ({avg_time/1000:.1f}s avg) supports promotion."

        return {
            "suggested": suggested,
            "reasoning": reasoning,
            "confidence": confidence,
            "metrics": {
                "accuracy": accuracy,
                "streak": streak,
                "streak_type": "correct" if streak_type else "incorrect",
                "count": total,
                "avg_response_time_ms": round(avg_time),
                "avg_confidence": round(avg_confidence, 2),
            },
        }


class AdaptiveScaler:
    """Smooth difficulty transitions to prevent oscillation."""

    def __init__(self, cooldown: int = 3):
        self.cooldown = cooldown
        self._history: List[str] = []

    def scale(self, suggested: str, current: str) -> str:
        """Apply cooldown — don't change more than once per N turns."""
        if not self._history:
            self._history.append(suggested)
            return suggested

        last = self._history[-1]
        same_count = sum(1 for h in reversed(self._history) if h == last)

        if suggested != current and same_count < self.cooldown:
            # Not enough evidence yet — keep current
            self._history.append(current)
            return current

        self._history.append(suggested)
        return suggested

    def reset(self):
        self._history.clear()
