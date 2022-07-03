// Arrow class, with some extra info on top of sprite
class Arrow extends Phaser.GameObjects.Sprite {
	constructor(scene, x, y, start_tick, direction, hit_tick) {
		super(scene, x, y, 'arrows', direction);

		this.start_tick = start_tick;
		this.direction = direction;
		this.hit_tick = hit_tick;
		this.has_hit = false;
		this.has_missed = false;
	}
}

const Directions = {
	Up:    0,
	Right: 1,
	Down:  2,
	Left:  3,
	0:     "Up",
	1:     "Right",
	2:     "Down", 
	3:     "Left"
};

const ARROW_X = {
	3: 75,
	2: 125,
	0: 175,
	1: 225
}

const ARROW_SIZE    = 50;
const ARROW_START_Y = -ARROW_SIZE;
const ARROW_END_Y   = WINDOW_HEIGHT + ARROW_SIZE;
const ARROW_HIT_Y   = WINDOW_HEIGHT - 100

const ARROW_DIST_TOTAL  = ARROW_END_Y - ARROW_START_Y;
const ARROW_DIST_TO_HIT = ARROW_HIT_Y - ARROW_START_Y;
