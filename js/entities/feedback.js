// Feedback class, with some extra info on top of sprite
class FeedbackText extends Phaser.GameObjects.Text {
	constructor(scene, x, y, text, params, jitter_x = 0, jitter_y = 0) {
		let text_offset_x = 0;
		if (jitter_x > 0) {
			text_offset_x = (Math.random() * jitter_x * 2.) - jitter_x;
		}

		let text_offset_y = 0
		if (jitter_y > 0) {
			text_offset_y = (Math.random() * jitter_y * 2.) - jitter_y;
		}

		super(scene, x + text_offset_x, y + text_offset_y, text, params);

		this.lifetime_ticks = 0;
	}
}

class FeedbackImage extends Phaser.GameObjects.Image {
	constructor(scene, x, y, img_key, jitter_x = 0, jitter_y = 0) {
		let img_offset_x = 0;
		if (jitter_x > 0) {
			img_offset_x = (Math.random() * jitter_x * 2.) - jitter_x;
		}

		let img_offset_y = 0
		if (jitter_y > 0) {
			img_offset_y = (Math.random() * jitter_y * 2.) - jitter_y;
		}

		super(scene, x + img_offset_x, y + img_offset_y, img_key);

		this.lifetime_ticks = 0;
	}
}

const FEEDBACK_COLOR_DEFAULT = "#0FF";
const FEEDBACK_FONTSIZE_DEFAULT = "32px";

const FEEDBACK_HIT_X = WINDOW_WIDTH/6.;
const FEEDBACK_HIT_Y = 3*WINDOW_HEIGHT/5.;
const FEEDBACK_COMBO_X = 2*WINDOW_WIDTH/6.;
const FEEDBACK_COMBO_Y = FEEDBACK_HIT_Y ;
const FEEDBACK_JITTER_X = 10;
const FEEDBACK_JITTER_Y = 10;

const FEEDBACK_LIFETIME = 100;
const FEEDBACK_RISE_SPEED = 1;
const FEEDBACK_FADE_START_TICK = 20;
const FEEDBACK_FADE_SPEED = 0.1;

const Hit_Ranks = [
	{Distance: 10,    Text: "perfect", Score: 10, Breaks_combo: false, Combo_power: 2},
	{Distance: 20,   Text: "great", Score: 8, Breaks_combo: false, Combo_power: 1},
	{Distance: 30,   Text: "ok", Score: 6, Breaks_combo: false, Combo_power: 1},
	{Distance: 40,   Text: "poor", Score: 4, Breaks_combo: true, Combo_power: 0},
	{Distance: 1000, Text: "bad", Score: 2, Breaks_combo: true, Combo_power: 0}
]
