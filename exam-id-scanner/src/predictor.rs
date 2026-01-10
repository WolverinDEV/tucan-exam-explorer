use crate::TucanExamId;

pub struct Window {
    pub backwards: u64,
    pub forwards: u64,
}

#[derive(PartialEq, Eq, Clone, Copy, Debug)]
pub enum Direction {
    Forwards,
    Backwards,
}

/// Predicts plausible future TUCaN exam ids based on a known exam id.
///
/// The predictor uses the observed structure and assumptions about
/// TUCaN exam ids (as documented in the "TUCaN exam ID structure" section)
/// to estimate a search window around a given ID and iterate through likely next ids.

pub struct IdPredictor {
    window: Window,
    direction: Direction,

    current_id: TucanExamId,

    window_start: TucanExamId,
    window_end: TucanExamId,

    start_id: TucanExamId,
    end_condition: TucanExamId,
}

impl IdPredictor {
    pub fn new(base_id: TucanExamId, end_condition: TucanExamId, window: Window) -> Self {
        assert_eq!(base_id % 2, 1);

        let start_id = base_id;
        let window_start = base_id - window.backwards;
        let window_end = base_id + window.forwards;

        let direction = if base_id > end_condition {
            Direction::Backwards
        } else {
            Direction::Forwards
        };

        Self {
            window,
            direction,

            current_id: start_id,

            window_start,
            window_end,

            start_id,
            end_condition,
        }
    }

    pub fn current_id(&self) -> TucanExamId {
        self.current_id
    }

    pub fn end_condition(&self) -> TucanExamId {
        self.end_condition
    }

    fn shift_window(&mut self) {
        match self.direction {
            Direction::Backwards => {
                self.window_start -= 1000;
                self.window_end -= 1000;
                self.current_id = self.window_end;
            }
            Direction::Forwards => {
                self.window_start += 1000;
                self.window_end += 1000;
                self.current_id = self.window_start;
            }
        }
    }

    pub fn next_id(&mut self) -> Option<TucanExamId> {
        match self.direction {
            Direction::Backwards => loop {
                let next_id = self.current_id;
                self.current_id -= 2;

                if next_id < self.window_start {
                    self.shift_window();
                    continue;
                } else if next_id < self.end_condition {
                    return None;
                }

                return Some(next_id);
            },
            Direction::Forwards => loop {
                let next_id = self.current_id;
                self.current_id += 2;

                if next_id > self.window_end {
                    self.shift_window();
                    continue;
                } else if next_id > self.end_condition {
                    return None;
                }

                return Some(next_id);
            },
        }
    }

    pub fn id_hit(&mut self, id: TucanExamId) {
        if self.window_start - 1000 > id || self.window_end + 1000 < id {
            log::error!(
                "ID hit outside of expected window: {id} - [{}; {}]",
                self.window_start,
                self.window_end
            );
            return;
        }

        self.window_start = id - self.window.backwards;
        self.window_end = id + self.window.forwards;
        self.shift_window();
    }

    pub fn progress(&self) -> f64 {
        match self.direction {
            Direction::Backwards => {
                if self.current_id < self.end_condition {
                    1.0
                } else {
                    1.0 - (self.current_id - self.end_condition) as f64
                        / (self.start_id - self.end_condition) as f64
                }
            }
            Direction::Forwards => {
                if self.current_id > self.end_condition {
                    1.0
                } else {
                    (self.current_id - self.start_id) as f64
                        / (self.end_condition - self.start_id) as f64
                }
            }
        }
    }
}

#[cfg(test)]
mod test {
    use super::{
        Direction,
        IdPredictor,
        Window,
    };

    #[test]
    fn test_generation() {
        const EXPECTED_IDS: &[u64] = &[
            386905127888735,
            386905127893747,
            386905127899767,
            386905127908797,
            386905127949851,
            386905127965847,
            386905127974791,
            386905127987803,
            386905128009907,
            386905128015867,
            386905128026901,
            386905128036877,
        ];

        let mut predictor = IdPredictor::new(
            386905127827719,
            386905128036888,
            Window {
                backwards: 150,
                forwards: 150,
            },
        );

        assert_eq!(predictor.direction, Direction::Forwards);

        for id in EXPECTED_IDS {
            println!("Waiting for {id}");
            loop {
                let next = predictor.next_id().unwrap();
                if next == *id {
                    println!(" -> hit");
                    predictor.id_hit(next);
                    break;
                } else if next > *id {
                    /* predictor should have predicted the ID from above */
                    assert!(false);
                }
            }
        }
    }
}

// 386905127827 719
