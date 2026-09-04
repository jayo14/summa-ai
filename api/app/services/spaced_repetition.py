"""Spaced Repetition Engine — SM-2 scheduling algorithm implementation."""

from datetime import datetime, timedelta, timezone
from typing import Literal, Tuple


RatingType = Literal["again", "hard", "good", "easy"]


def next_review(
    rating: RatingType,
    ease_factor: float = 2.5,
    interval_days: int = 0,
    repetitions: int = 0,
) -> Tuple[float, int, int]:
    """Computes SM-2 spaced repetition state based on performance rating.

    Ratings mapping:
    - "again": quality 0 -> reset reps, interval 1 day, decrease ease
    - "hard": quality 3 -> interval * 1.2, slight ease decrease
    - "good": quality 4 -> interval * ease_factor
    - "easy": quality 5 -> interval * ease_factor * 1.3, increase ease
    """
    quality_map = {"again": 0, "hard": 3, "good": 4, "easy": 5}
    q = quality_map[rating]

    # SM-2 ease factor formula adjustment
    new_ease = ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    new_ease = max(1.3, round(new_ease, 2))

    if q < 3:
        new_reps = 0
        new_interval = 1
    else:
        new_reps = repetitions + 1
        if new_reps == 1:
            new_interval = 1
        elif new_reps == 2:
            new_interval = 6
        else:
            if rating == "hard":
                new_interval = max(int(interval_days * 1.2), interval_days + 1)
            elif rating == "easy":
                new_interval = max(int(interval_days * new_ease * 1.3), interval_days + 2)
            else:
                new_interval = max(int(interval_days * new_ease), interval_days + 1)

    return new_ease, new_interval, new_reps
