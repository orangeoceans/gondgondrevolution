// Feedback class, with some extra info on top of sprite
class Feedback extends Phaser.GameObjects.Text {
	constructor(scene, x, y, start_tick, text, params, jitter_x = 0, jitter_y = 0) {
		let text_offset_x = 0;
		if (jitter_x > 0) {
			text_offset_x = (Math.random() * jitter_x * 2.) - jitter_x;
		}

		let text_offset_y = 0
		if (jitter_y > 0) {
			text_offset_y = (Math.random() * jitter_y * 2.) - jitter_y;
		}

		super(scene, x + text_offset_x, y + text_offset_y, text, params);

		this.start_tick = start_tick;
	}
}

const FEEDBACK_COLOR_DEFAULT = "#0FF";
const FEEDBACK_FONTSIZE_DEFAULT = "32px";

const FEEDBACK_HIT_X = 425;
const FEEDBACK_HIT_Y = 75;
const FEEDBACK_COMBO_X = 200;
const FEEDBACK_COMBO_Y = 280;
const FEEDBACK_JITTER_X = 50;
const FEEDBACK_JITTER_Y = 50;

const Hit_Ranks = [
	{Distance: 5,    Text: "Perfect", Score: 1000, Breaks_combo: false, Combo_power: 2},
	{Distance: 10,   Text: "Great", Score: 800, Breaks_combo: false, Combo_power: 1},
	{Distance: 15,   Text: "OK", Score: 600, Breaks_combo: false, Combo_power: 1},
	{Distance: 20,   Text: "Poor", Score: 400, Breaks_combo: false, Combo_power: 0},
	{Distance: 1000, Text: "Bad", Score: 200, Breaks_combo: false, Combo_power: 0}
]