class GonDDR extends Phaser.Scene {

	constructor () {

		super('gonddr');

		this.start_time;
		this.prev_tick_start;

		this.song;
		this.song_idx;

		this.arrows;      // Currently active arrows

		this.background;
		this.hit_frame;   // Sprite of hit window
		this.gondola;
		this.dance_pad;

		this.combo = 0;
		this.score = 0;
		this.score_text;

		this.tps = 100;   // Ticks per second;

		/* A tick is the smallest time step in the song script, NOT a frame or Phaser loop.
		   Speed, position, and timing of arrows are measured in ticks. */

		// Margin in pixels that a player's button press registers as a hit
		this.hit_window_start = ARROW_HIT_Y - ARROW_SIZE;
		this.hit_window_end = ARROW_HIT_Y + ARROW_SIZE;

		// TODO: Phaser keyboard key objects for the arrow keys/WASD?
		this.arrow_keys = {};

	}


	create () {

		this.prev_time_ms = Date.now()

		this.music = this.sound.add("wu_wei", 1)
		this.music_started = false;

		this.init_song();
		this.init_arrow_properties();

		this.create_title();

		this.arrows = [];

		// Create keyboard keys
		this.arrow_keys['Up'] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		this.arrow_keys['Right'] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		this.arrow_keys['Down'] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
		this.arrow_keys['Left'] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);

		this.feedback_array = [];

		this.sounds = {
			"voice_ready": this.sound.add("voice_ready", 1),
			"voice_gondola": this.sound.add("voice_gondola", 1)
		}

	}

	// Main game loop
	update () {

		if(!this.music_started) {
			return;
		}

		let time_ms = Date.now() - this.start_time;
		let this_tick = ms_to_tick(time_ms, this.tps);

		if (!this.background) {
			this.background = new PurpleWave(this, 1000, beat_to_ms(this.bpb,this.bpm));
		}

		if(this.bpm != this.target_bpm) {

			console.log("Current BPM: " + this.bpm);
			console.log("Target BPM: "  + this.target_bpm);
			console.log("Change rate: "  + this.bpm_change_per_beat);

			if((this.bpm > this.target_bpm && this.bpm_change_per_beat < 0) ||
			   (this.bpm < this.target_bpm && this.bpm_change_per_beat > 0)) {

				let elapsed_sec = (time_ms - this.prev_time_ms) / 1000;
				let beat_duration_sec = this.bpm / 60;

				console.log("Elapsed seconds: " + elapsed_sec);
				console.log("Length of beat: "  + beat_duration_sec);

				this.bpm += (this.bpm_change_per_beat / beat_duration_sec) * elapsed_sec;

				console.log("New BPM: " + this.bpm);

				this.init_arrow_properties(); // TODO: Make SET method

			} else { // Stabilize at target BPM
				console.log("Threshold reached; setting BPM to target");
				this.bpm = this.target_bpm;
				this.bpm_change_per_beat = 0;
				this.init_arrow_properties();
			}
		}

		this.beat += ((this_tick - this.prev_tick) / 1000) * (this.bpm / 60);
		console.log(this.beat)

		// TODO: Technically unsafe first loop!
		this.prev_time_ms = time_ms

		this.handle_beat(this_tick);
		this.update_arrows(this_tick);
		this.update_feedback(this_tick);
		this.update_gondola();

	}

	create_title() {

		this.title = this.add.text(WINDOW_WIDTH/2., WINDOW_HEIGHT/2., 'Lumic - Wu Wei (D.J. MAJiK mix)', {
				fontSize: 24,
				fill: FEEDBACK_COLOR_DEFAULT,
				stroke: "ffffff",
				strokeThickness: 2
		});
		this.title.setOrigin(0.5, 0.5);
		this.title.alpha = 0;
		this.title.scaleX = 3;

		this.title_fadein = this.tweens.add({ targets:
			this.title,
			alpha: 1,
			scaleX: 1,
			scaleY: 1,
			duration: 1000,
			delay: 250,
			ease: "Sine.easeInOut",
			callbackScope: this,
			completeDelay: 1000,
			onComplete: function (tweens, targets) {
				console.log("Fade in complete");
				this.title_fadeout.play();
			}
		});

		this.title_fadeout = this.tweens.add({
			targets: this.title,
			alpha: 0,
			scaleX: 3,
			scaleY: 1.5,
			duration: 1000,
			delay: 250,
			ease: "Sine.easeInOut",
			paused: true,
			callbackScope: this,
			completeDelay: 250,
			onStart: function (tween, targets) {
				console.log("Fade out start");
			},
			onComplete: function (tween, targets) {
				console.log("Fade out complete");
				this.init_game_objects();

				this.start_time = Date.now();

				this.music.play();
				this.music_started = true;
			}
		});

	}

	// Load song data, set BPM and time signature
	init_song() {
		this.song = this.cache.json.get('testdance');
		this.song_idx = 0;

		// Set starting BPM, beats per bar, and ticks per beat
		this.bpm = this.song.properties.starting_bpm;  // Beats per minute
		this.target_bpm = this.bpm;  // For BPM transitions
		this.bpm_change_per_beat = 0;  // For BPM transitions

		this.bpb = this.song.properties.beats_per_bar; // Beats per bar (determines fall time)

		console.log("BPM: " + this.bpm + " Beats per bar: " + this.bpb);
	}

	init_arrow_properties() {
		this.tpb = this.tps/(this.bpm/60) // Ticks per beat
		console.log("Updating arrows for BPM " + this.bpm + "\nTicks per beat: " + this.tpb);

		this.fall_speed_ppt = ARROW_DIST_TO_HIT / (this.tpb * this.bpb); // Fall speed of each arrow, in pixels per tick
		console.log("Fall speed: " + this.fall_speed_ppt);

		// # of ticks for a standard arrow to fall from the top to the hitbox.
		this.fall_to_hit_ticks = ARROW_DIST_TO_HIT / this.fall_speed_ppt;

		// # of ticks for a standard arrow to fall from the top to bottom of the screen.
		this.fall_to_bottom_ticks = ARROW_DIST_TOTAL / this.fall_speed_ppt;
	}

	// Create game objects
	init_game_objects() {

		// Create sprites
		this.hit_frame = this.add_starting_visual( this.add.sprite(100, ARROW_HIT_Y, 'hit_frame', 0) );

		this.dance_pad = this.add_starting_visual( this.add.sprite(GONDOLA_X, GONDOLA_Y-DANCE_PAD_OFFSET, 'dance_pad') );

		this.gondola = this.add_starting_visual( this.add.sprite(GONDOLA_X, GONDOLA_Y + Gondola_Offsets.Neutral, 'gondola', Gondola_Poses.Neutral) );
		this.gondola.setOrigin(0.5,1);
		this.tweens.add({
			targets: this.gondola,
			scaleX: 1.05,
			scaleY: 0.9,
			ease: 'Sine.easeInOut',
			duration: beat_to_ms(0.5, this.bpm),
			repeat: -1,
			yoyo: true
		});

		// Draw score info
		this.score_text = this.add_starting_visual( this.add.text(SCORE_X, SCORE_Y, '0', {
				fontSize: FEEDBACK_FONTSIZE_DEFAULT,
				fill: FEEDBACK_COLOR_DEFAULT,
				align: 'right'
		}) );
		this.score_text.setOrigin(1,1);

		// Create animations
		this.anims.create({
			key: 'hit_frame_flash',
			frames: this.anims.generateFrameNumbers('hit_frame', { frames: [ 1, 0 ] }),
			frameRate: 8,
			repeat: 0
		});

	}

	add_starting_visual(game_object, onComplete) {
		game_object.alpha=0;
		this.tweens.add({ targets:game_object, alpha:1, duration:1, delay:10, onComplete: onComplete});
		return game_object;
	}

	update_feedback(this_tick) {

		// Iterate through feedback text
		this.feedback_array = this.feedback_array.filter((item, i) => {
			var current_feedback = this.feedback_array[i];

			// Destroy feedback that is too old
			if(this_tick - current_feedback.start_tick > FEEDBACK_LIFETIME) {
				current_feedback.destroy();
				return false;
			}

			// Otherwise make the text rise
			else {
				current_feedback.y -= FEEDBACK_RISE_SPEED;
				if(this_tick - current_feedback.start_tick > FEEDBACK_FADE_START_TICK && current_feedback.alpha > 0) {
					current_feedback.alpha -= FEEDBACK_FADE_SPEED;
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

		// Move arrow, mark as missed when leaving hit window, destroy arrows when leaving screen
		for (var i = this.arrows.length-1; i >= 0; i--) {

			let elapsed_ticks = this_tick - this.arrows[i].start_tick;
			this.arrows[i].y = ARROW_START_Y + ((elapsed_ticks/this.fall_to_bottom_ticks) * ARROW_DIST_TOTAL);

			// Destroy arrow if out of screen
			if (this.arrows[i].y > ARROW_END_Y) {
				let arrow_to_destroy = this.arrows.splice(i, 1);
				arrow_to_destroy[0].destroy();

				if (this.song_idx >= this.song.beatmap.length && this.arrows.length == 0) {
					this.end_dance();
				}

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
				this.gondola.y = GONDOLA_Y + Gondola_Offsets[direction];
				arrow_key_down = true;
			}
		}
		if (!arrow_key_down) {
			this.gondola.setFrame(Gondola_Poses.Neutral);
			this.gondola.y = GONDOLA_Y + Gondola_Offsets.Neutral;
		}
	}

	get_hit_rank (hit_distance) {
		for (const rank of Hit_Ranks) {
			if (hit_distance <= rank.Distance) {
				return rank;
			}
		}
	}

	handle_beat(this_tick) {

		if (this.song_idx < this.song.beatmap.length) {
			let beat_action = this.song.beatmap[this.song_idx];

			if (this.beat >= beat_action.beat - this.fall_to_hit_ticks / this.tpb) {
				this.song_idx++;

				beat_action.arrows.forEach((arrow, i) => {
					this.arrows.push(new Arrow(this, ARROW_X[arrow.direction], ARROW_START_Y, this_tick, arrow.direction, 0)); // Push new arrow to array
					this.add.existing(this.arrows[this.arrows.length-1]);
				}); // Add new arrow to Phaser scene

				if(beat_action.config != undefined) {

					beat_action.config.foreach( (param, i) => {
						switch(param) {
							case "bpm":
								this.update_bpm(param);
							case "sound":
								this.play_timed_sound(param);

						}
					}, this);

				}

			}
		}
	}

	play_timed_sound(sound_config) {
		sound = sound_config.name;
		this.sounds[sound].play();
	}

  update_bpm(bpm_config) {

		if(bpm_config.duration == 0) {
			this.bpm = this.target_bpm = bpm_config.target;
			this.bpm_change_per_beat = 0;
			console.log("BPM changed: " + this.bpm);
		} else {
			this.target_bpm = bpm_config.target;
			this.bpm_change_per_beat = (this.target_bpm - this.bpm) / bpm_config.duration;
			console.log("BPM target: " + this.target_bpm);
		}
		this.init_arrow_properties(); // TODO: SET function
	}

	handle_hit (this_tick, arrow) {
		arrow.has_hit = true;
		arrow.visible = false;
		this.hit_frame.play('hit_frame_flash');

		this.combo++;
		if (this.combo >= 1) {
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
			this.add_feedback_error(this_tick);
		} else {
			arrow.has_missed = true;
			this.add_feedback_error(this_tick);
		}
	}

	end_dance () {
		function transition_to_endscreen() {
			this.gondola.destroy();
			this.dance_pad.destroy();
			this.hit_frame.destroy();
			this.score_text.destroy();
        	this.scene.transition({
				target: 'endscreen',
				duration: 1200,
				moveBelow: true,
				data: {score: this.score}
			});
		}

		this.background.end(100);
		this.time.delayedCall(500,
			function() {
				do_checkerboard(this, transition_to_endscreen, this);
			}, [], this
		);
	}
}

const Gondola_Poses = {
	Up:      0,
	Right:   1,
	Down:    2,
	Left:    3,
	Neutral: 4
}

const Gondola_Offsets = {
	Up:      0,
	Right:   -61,
	Down:    -90,
	Left:    -62,
	Neutral: -95
}

const GONDOLA_WIDTH  = 273;
const GONDOLA_HEIGHT = 362;
const GONDOLA_X 	 = 480;
const GONDOLA_Y      = 480;
const DANCE_PAD_OFFSET = 40;

const SCORE_X = WINDOW_WIDTH - 10;
const SCORE_Y = WINDOW_HEIGHT - 10;
