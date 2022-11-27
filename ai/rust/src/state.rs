#[derive(Clone)]
pub struct State {
    h_remaining: u32,
    v_remaining: u32,
    h_lines: Vec<Vec<u8>>,
    v_lines: Vec<Vec<u8>>,
    p1_turn: bool,
    score: Score,
    depth: u32,
    alpha: i32,
    beta: i32,
}

#[derive(Clone, Copy)]
pub struct Score {
    pub value: i32,
    pub row: usize,
    pub column: usize,
    pub vertical: bool,
}

impl State {
    pub fn start_minimax(h_lines: Vec<Vec<u8>>, v_lines: Vec<Vec<u8>>) -> Score {
        let mut h_remaining = 0;
        for column in &h_lines {
            for &line in column {
                if line == 0 {
                    h_remaining += 1;
                }
            }
        }

        let mut v_remaining = 0;
        for column in &v_lines {
            for &line in column {
                if line == 0 {
                    v_remaining += 1;
                }
            }
        }

        let start_state = State {
            h_remaining,
            v_remaining,
            h_lines,
            v_lines,
            p1_turn: true,
            score: Score {
                value: 0,
                row: 0,
                column: 0,
                vertical: false,
            },
            depth: 0,
            alpha: i32::MIN,
            beta: i32::MAX,
        };

        start_state.minimax()
    }

    fn minimax(mut self) -> Score {
        if self.depth >= 9 || self.h_remaining + self.v_remaining == 0 {
            return self.score;
        }

        // maximising player
        if self.p1_turn {
            let mut new_max_score = Score {
                value: i32::MIN,
                row: 0,
                column: 0,
                vertical: false,
            };

            let mut dominated = false;
            // vertical lines
            'outer: for row in 0..self.v_lines.len() {
                for column in 0..self.v_lines[0].len() {
                    if self.v_lines[row][column] == 0 {
                        let new_state = self.game_step_vertical(row, column);
                        let new_score = new_state.minimax();
                        if new_score.value > new_max_score.value {
                            new_max_score.value = new_score.value;
                            new_max_score.row = row;
                            new_max_score.column = column;
                            new_max_score.vertical = true;
                        }
                        if new_max_score.value >= self.beta {
                            dominated = true;
                            break 'outer;
                        }
                        self.alpha = self.alpha.max(new_max_score.value);
                    }
                }
            }

            if !dominated {
                // horizontal lines
                'outer: for row in 0..self.h_lines.len() {
                    for column in 0..self.h_lines[0].len() {
                        // Check if line is available
                        if self.h_lines[row][column] == 0 {
                            let new_state = self.game_step_horizontal(row, column);
                            let new_score = new_state.minimax();
                            if new_score.value > new_max_score.value {
                                new_max_score.value = new_score.value;
                                new_max_score.row = row;
                                new_max_score.column = column;
                                new_max_score.vertical = false;
                            }
                            if new_max_score.value >= self.beta {
                                break 'outer;
                            }
                            self.alpha = self.alpha.max(new_max_score.value);
                        }
                    }
                }
            }

            new_max_score
        } else {
            // minimizing player
            let mut new_min_score = Score {
                value: i32::MAX,
                row: 0,
                column: 0,
                vertical: false,
            };

            let mut dominated = false;
            // vertical lines
            'outer: for row in 0..self.v_lines.len() {
                for column in 0..self.v_lines[0].len() {
                    if self.v_lines[row][column] == 0 {
                        let new_state = self.game_step_vertical(row, column);
                        let new_score = new_state.minimax();
                        if new_score.value < new_min_score.value {
                            new_min_score.value = new_score.value;
                            new_min_score.row = row;
                            new_min_score.column = column;
                            new_min_score.vertical = true;
                        }
                        if new_min_score.value <= self.alpha {
                            dominated = true;
                            break 'outer;
                        }
                        self.beta = self.beta.min(new_min_score.value);
                    }
                }
            }

            // horizontal lines
            if !dominated {
                'outer: for row in 0..self.h_lines.len() {
                    for column in 0..self.h_lines[0].len() {
                        // Check if line is available
                        if self.h_lines[row][column] == 0 {
                            let new_state = self.game_step_horizontal(row, column);
                            let new_score = new_state.minimax();
                            if new_score.value < new_min_score.value {
                                new_min_score.value = new_score.value;
                                new_min_score.row = row;
                                new_min_score.column = column;
                                new_min_score.vertical = false;
                            }
                            if new_min_score.value <= self.alpha {
                                break 'outer;
                            }
                            self.beta = self.beta.min(new_min_score.value);
                        }
                    }
                }
            }

            new_min_score
        }
    }

    fn game_step_vertical(&self, row: usize, column: usize) -> State {
        // Create new board
        let mut new_state = self.clone();
        new_state.depth += 1;
        new_state.p1_turn = !self.p1_turn;

        new_state.v_lines[row][column] = 1;
        new_state.v_remaining -= 1;

        // check for square left
        if column != 0 // not left edge
        && new_state.v_lines[row][column - 1] != 0 // Left line
        && new_state.h_lines[row][column - 1] != 0 // Top line
        && new_state.h_lines[row + 1][column - 1] != 0
        // bottom line
        {
            // Bottom line
            new_state.score.value += match self.p1_turn {
                true => 1,
                false => -1,
            };
            new_state.p1_turn = self.p1_turn;
        }

        // check for square right
        if column < new_state.v_lines[0].len() - 1
        && new_state.v_lines[row][column + 1] != 0 // right line
        && new_state.h_lines[row][column] != 0 // top line
        && new_state.h_lines[row + 1][column] != 0
        // bottom line
        {
            // bottom line
            new_state.score.value += match self.p1_turn {
                true => 1,
                false => -1,
            };
            new_state.p1_turn = self.p1_turn;
        }

        new_state
    }

    fn game_step_horizontal(&self, row: usize, column: usize) -> State {
        // Create new board
        let mut new_state = self.clone();
        new_state.depth += 1;
        new_state.p1_turn = !self.p1_turn;

        new_state.h_lines[row][column] = 1;
        new_state.h_remaining -= 1;

        // check for square up
        if row != 0 // not left edge
        && self.h_lines[row - 1][column] != 0 // top line
        && self.v_lines[row - 1][column] != 0 // left line
        && self.v_lines[row - 1][column + 1] != 0
        // right line
        {
            // right line
            new_state.score.value += match self.p1_turn {
                true => 1,
                false => -1,
            };
            new_state.p1_turn = self.p1_turn;
        }

        // check for square down
        if row < self.h_lines.len() - 1
        && self.h_lines[row + 1][column] != 0 // bottom line
        && self.v_lines[row][column] != 0 // left line
        && self.v_lines[row][column + 1] != 0
        // right line
        {
            // right line
            new_state.score.value += match self.p1_turn {
                true => 1,
                false => -1,
            };
            new_state.p1_turn = self.p1_turn;
        }

        new_state
    }
}
