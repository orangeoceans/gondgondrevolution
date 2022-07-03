class Boot extends Phaser.Scene {

	constructor () {
		super('boot');
	}


	init () {
		let element = document.createElement('style');
		document.head.appendChild(element);
	}

	// Preload assets from disk
	preload () {
		this.load.spritesheet('arrows', 'assets/arrows.png', {frameWidth: ARROW_SIZE, frameHeight: ARROW_SIZE});
		this.load.spritesheet('hit_frame', 'assets/hit_frame.png', {frameWidth: ARROW_SIZE, frameHeight: ARROW_SIZE});
		this.load.spritesheet('gondola', 'assets/gondancin.png', {frameWidth: GONDOLA_WIDTH, frameHeight: GONDOLA_HEIGHT})
		this.load.json('testdance', 'testdance.json');
	}


	create () {
		let scene = this.scene;
		// Start the actual game!
		scene.start('gonddr');
	}

}

class GonDDR extends Phaser.Scene {

	constructor () {

		super('gonddr');

		this.hit_frame;   // Sprite of hit window
		this.arrows;      // Currently active arrows
		this.song_script; // Hash of strings; maps a tick to a string encoding the arrow(s) to create.
		this.gondola;     // TODO
		this.combo = 0;       // TODO
		this.score = 0;       // TODO
		this.score_text;

		this.bpm;       // Beats per minute TODO
		this.tps = 100; // Ticks per second.
						// A tick is the smallest time step in the song script, NOT a frame or Phaser loop.
						// Speed, position, and timing of arrows are measured in ticks.
						// Adjust this change the speed of the song.
		this.fall_ticks = 400.;
						// # of ticks for a standard arrow to fall from the top to bottom of the screen.
		this.hit_window_start = ARROW_HIT_Y - ARROW_SIZE;
		this.hit_window_end = ARROW_HIT_Y + ARROW_SIZE;
						// Margin in pixels that a player's button press registers as a hit

		this.arrow_keys = {};
						// Phaser keyboard key objects for the arrow keys/WASD?
		//TODO

	}

	create () {

		this.dance = this.cache.json.get('testdance');

		// Create game objects
		this.hit_frame = this.add.sprite(100, ARROW_HIT_Y, 'hit_frame', 0);
		this.arrows = [];

		this.gondola = this.add.sprite(GONDOLA_X, GONDOLA_Y, 'gondola', Gondola_Poses.Neutral);

		this.score_text = this.add.text(SCORE_X, SCORE_Y, '0', {
				fontSize: FEEDBACK_FONTSIZE_DEFAULT,
				fill: FEEDBACK_COLOR_DEFAULT,
				align: 'right'
		});
		this.score_text.setOrigin(1,1);

		// Create keyboard keys
		this.arrow_keys['Up'] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		this.arrow_keys['Right'] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		this.arrow_keys['Down'] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
		this.arrow_keys['Left'] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);

		// Create animations
		this.anims.create({
			key: 'hit_frame_flash',
			frames: this.anims.generateFrameNumbers('hit_frame', { frames: [ 1, 0 ] }),
			frameRate: 8,
			repeat: 0
		});

		this.feedback_array = [];

	}

	// Main game loop
	update (time) {
		let this_tick = this.time_to_tick(time);
		this.update_arrows(this_tick);
		this.update_feedback(this_tick);
		this.update_gondola();
	}


	//read_song_file: function()
	//{
		//TODO
	//},


	// Convert time in milliseconds to ticks
	time_to_tick (ts_ms) {
		return Math.floor(this.tps * ts_ms / 1000.);
	}

	update_feedback(this_tick) {

		// Iterate through feedback text
		this.feedback_array = this.feedback_array.filter((item, i) => {
			var current_feedback = this.feedback_array[i];

			//console.log(current_feedback.start_tick);
			// Destroy feedback that is too old
			if(this_tick - current_feedback.start_tick > 75) {
				current_feedback.destroy();
				//console.log(this.feedback_array.length);
				return false;
			}

			// Otherwise make the text rise
			else {
				current_feedback.y -= 2;
				if(this_tick - current_feedback.start_tick > 25 && current_feedback.alpha > 0) {
					current_feedback.alpha -= 0.075;
				}
				return true;
			}
		});
	}


	add_feedback_generic(x, y, this_tick, text, jitter_x = 0, jitter_y = 0, fill = "#00F", fontsize = "32px") {

		let feedback = new Feedback(this, x, y, this_tick, text, {
				fontSize: fontsize,
				fill: fill
		}, jitter_x, jitter_y);
		this.add.existing(feedback);
		this.feedback_array.push(feedback);

	}

	add_feedback_hit(this_tick, text) {

		this.add_feedback_generic(FEEDBACK_HIT_X, FEEDBACK_HIT_Y, this_tick, text, 
			FEEDBACK_JITTER_X, FEEDBACK_JITTER_Y, FEEDBACK_COLOR_DEFAULT, FEEDBACK_FONTSIZE_DEFAULT);
	}

	add_feedback_error(this_tick) {

		this.add_feedback_generic(FEEDBACK_HIT_X, FEEDBACK_HIT_Y, this_tick, "MISS", 
			FEEDBACK_JITTER_X, FEEDBACK_JITTER_Y, "#F00", FEEDBACK_FONTSIZE_DEFAULT);
	}

	add_feedback_combo(this_tick, number) {

		this.add_feedback_generic(FEEDBACK_COMBO_X, FEEDBACK_COMBO_Y, this_tick, `COMBO ${number}`, 0, 0, "#0F0", "40px");
	}

	// Create, move, destroy, and register hits on arrows for this loop
	update_arrows (this_tick) {

		// Create new arrow
		//if song_script[this_tick] == this_tick + fall_ticks
		/*if (this_tick - this.arrows[this.arrows.length-1].start_tick >= 200) { // TEMPORARY: For now, generate arrows at regular intervals
			let new_direction = (this.arrows[this.arrows.length-1].direction+1)%4; // TEMPORARY
			let new_direction_text = Object.keys(Directions).find(key => Directions[key] === new_direction); // TEMPORARY (?)
			this.arrows.push(new Arrow(this, ARROW_X[new_direction_text], ARROW_START_Y, this_tick, new_direction, 0)); // Push new arrow to array
			this.add.existing(this.arrows[this.arrows.length-1]); // Add new arrow to Phaser scene
		}*/

		// Get next arrow
		if (this.dance["song"].length != 0) {
			var next_arrow = this.dance["song"][0];
			//console.log(next_arrow);
			if(this_tick > next_arrow["tick"] - 100) {

				//console.log(this_tick)
				this.dance["song"].shift();
				next_arrow["arrows"].forEach((arrow, i) => {
					console.log(arrow);
					let new_direction = arrow.direction;
					let new_direction_text = Object.keys(Directions).find(key => Directions[key] === new_direction); // TEMPORARY (?)
					this.arrows.push(new Arrow(this, ARROW_X[new_direction_text], ARROW_START_Y, this_tick, new_direction, 0)); // Push new arrow to array
					console.log(new_direction_text);
					console.log(arrow.direction);
					this.add.existing(this.arrows[this.arrows.length-1])
				}); // Add new arrow to Phaser scene
			}
		}

		// Move arrow, mark as missed when leaving hit window, destroy arrows when leaving screen
		for (var i = this.arrows.length-1; i >= 0; i--) {

			let elapsed_ticks = this_tick - this.arrows[i].start_tick;
			this.arrows[i].y = ARROW_START_Y + ((elapsed_ticks/this.fall_ticks) * ARROW_DIST_TOTAL);

			// Destroy arrow if out of screen
			if (this.arrows[i].y > ARROW_END_Y) {
				let arrow_to_destroy = this.arrows.splice(i, 1);
				arrow_to_destroy[0].destroy();
				continue;
			}

			// Mark arrow as missed
			if (this.arrows[i].y > this.hit_window_end && !this.arrows[i].has_hit && !this.arrows[i].has_missed) {
				this.handle_miss(this_tick, this.arrows[i]);
			}
		}

		// Check if each pressed arrow key correctly hits an arrow
		for (const [direction, arrow_key] of Object.entries(this.arrow_keys)) { // Loop through directions
			if (Phaser.Input.Keyboard.JustDown(arrow_key)) { // JustDown(key) returns true only once per key press

				let key_hit = false;
				for (var i = 0; i < this.arrows.length; i++) { // Loop through arrows
					if (Directions[direction] == this.arrows[i].direction) { // Check if arrow matches direction
						if (this.hit_window_start < this.arrows[i].y && this.arrows[i].y < this.hit_window_end) { // Check if arrow in hit window
							if (!this.arrows[i].has_hit) {
								this.handle_hit(this_tick, this.arrows[i]);
								key_hit = true;
								break; // Each key press should hit only one arrow, so break
							}
						}
					}
				}
				if (!key_hit) { // If the key is pressed but had no matching arrow in the hit window, it's incorrect
					this.handle_miss(this_tick);
				}
			}
		}
	}

	update_gondola () {
		let arrow_key_down = false;
		for (const [direction, arrow_key] of Object.entries(this.arrow_keys)) {
			if (arrow_key.isDown) {
				this.gondola.setFrame(Gondola_Poses[direction]);
				arrow_key_down = true;
			}
		}
		if (!arrow_key_down) {
			this.gondola.setFrame(Gondola_Poses.Neutral);
		}
	}

	get_hit_rank (hit_distance) {
		for (const rank of Hit_Ranks) {
			if (hit_distance <= rank.Distance) {
				return rank;
			}
		}
	}

	handle_hit (this_tick, arrow) {
		arrow.has_hit = true;
		arrow.visible = false;
		this.hit_frame.play('hit_frame_flash');		

		this.combo++;
		if (this.combo >= 1) {
			console.log(`COMBO ${this.combo}`);
			this.add_feedback_combo(this_tick, this.combo);
		}

		var hit_distance = Math.abs(ARROW_HIT_Y - arrow.y);
		let rank = this.get_hit_rank(hit_distance);

		if (rank.Breaks_combo){
			this.combo = 0;
		}
		this.score += rank.Score * Math.pow(Math.ceil(this.combo/4), rank.Combo_power)
		this.score_text.text = `${this.score}`

		this.add_feedback_hit(this_tick, rank.Text);
	}

	handle_miss (this_tick, arrow = null) {
		this.combo = 0;
		if (arrow === null) {
			console.log(`PENALTY INCORRECT ${this_tick}`);
			this.add_feedback_error(this_tick);
		} else {
			console.log(`PENALTY MISSED ${this_tick}`);
			arrow.has_missed = true;
			this.add_feedback_error(this_tick);
		}
	}
}



var config = {
    type: Phaser.AUTO,
    width: 640,
    height: 640,
    scene: [ Boot, GonDDR ]
};

const Gondola_Poses = {
	Up:      0,
	Right:   1,
	Down:    2,
	Left:    3,
	Neutral: 4
}

const GONDOLA_WIDTH  = 296;
const GONDOLA_HEIGHT = 395;
const GONDOLA_X 	 = 480;
const GONDOLA_Y      = 320;

const SCORE_X = config.width - 10;
const SCORE_Y = config.height - 10;

var game = new Phaser.Game(config);
