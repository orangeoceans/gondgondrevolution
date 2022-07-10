class GonDDR extends Phaser.Scene {
	constructor () {
		super("gonddr");

		this.song;
		this.song_idx;
		this.music;
		this.music_started;
		this.dance_ended;

		this.arrows;      // Currently active arrows

		this.background;
		this.hit_frame;   // Sprite of hit window
		this.gondola;
		this.dance_pad;

		this.combo = 0;
		this.score = 0;
		this.score_text;

		this.secret_code = "LeftUpRightUpDownRightRight";
		this.secret_code_input = "";

		this.tps = 100;   // Ticks per second;

		/* A tick is the smallest time step in the song script, NOT a frame or Phaser loop.
		   Speed, position, and timing of arrows are measured in ticks. */

		// Margin in pixels that a player's button press registers as a hit
		this.hit_window_end = ARROW_HIT_Y - (1/2) * ARROW_SIZE - 10;
		this.hit_window_start = ARROW_HIT_Y + (1/2) * ARROW_SIZE + 10;

		// TODO: Phaser keyboard key objects for the arrow keys/WASD?
		this.arrow_keys = [];

	}


	create () {

		game.events.on('blur', function () {
			this.music.pause();
			this.scene.pause();
		}, this);

		game.events.on('focus', function () {
			this.music.resume();
			this.scene.resume();
		}, this);

		this.music = this.sound.add("wu_wei", 1)
		this.beat = 0;
		this.music_started = false;
		this.dance_ended = false;

		this.init_song();
		this.set_arrow_speed();
		this.init_game_objects();

		this.cheer = this.sound.add("cheer", 1);

		this.create_title();

		this.arrows = [];

		// Create keyboard keys
		this.arrow_keys[Directions.Up] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		this.arrow_keys[Directions.Right] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		this.arrow_keys[Directions.Down] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
		this.arrow_keys[Directions.Left] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);

		this.feedback_array = [];

		this.sfx = {
			"voice_ready": this.sound.add("voice_ready", 1),
			"voice_gondola": this.sound.add("voice_gondola", 1)
		}

	}

	// Main game loop
	update (time, delta) {

		if(!this.music_started) {
			let secret_code_entered = this.check_secret_code();
			if (secret_code_entered) {
				this.add_feedback_generic(WINDOW_WIDTH/2., WINDOW_HEIGHT/2., "SECRET CODE!");
			}
			return;
		}

		let delta_tick = ms_to_tick(delta, this.tps);

		if (!this.background) {
			//this.background = new PurpleWave(this, 1000, beat_to_ms(this.bpb,this.bpm));
			this.background = new LightBeams(this, beat_to_ms(this.bpb,this.bpm), false);
		}

		if(this.bpm != this.target_bpm) {
			this.update_bpm(delta);
		}

		let prev_beat = this.beat;
		this.beat = this.beat + ((delta / 1000.) * (this.bpm / 60.));
		if (Math.floor(this.beat) > Math.floor(prev_beat)) {
			this.do_on_beat();
		}

		this.handle_beat(delta_tick);

		this.update_arrows(delta_tick);
		this.check_input()

		this.update_feedback(delta_tick);
		this.update_gondola();

	}

	create_title() {
		this.cheer.volume = 0
		this.cheer.play({seek: 0.5})
		this.tweens.add({
			targets: this.cheer, volume: 0.7, duration: 100,
			callbackScope: this,
			onComplete: function (tweens, targets) {
				this.tweens.add({
					targets: this.cheer, volume: 0, duration: 1000, delay:9000
				});
			}
		});


		this.title_top = this.add.image(-1760,0,'song_title_blue');
		this.title_top.setOrigin(0,0);
		this.title_top.scaleY = 0;
		this.tweens.add({
			targets: this.title_top,
			scaleY: 1, duration: 400, ease: 'Linear', delay: 500,
			yoyo: true, hold: 4500, callbackScope: this,
			onStart: function () {this.gondola.setFrame(Gondola_Poses.Happy);}
		});
		this.tweens.add({
			targets: this.title_top,
			x: 0, duration: 5300, ease: 'Linear', delay: 500,
			callbackScope: this, completeDelay: 1000,
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
				this.music.play();
				this.music_started = true;
				this.gondola.setFrame(Gondola_Poses.Neutral);
				this.gondola_start_bounce.stop();
			}
		});

		this.title_bot = this.add.image(0,WINDOW_HEIGHT,'song_title_pink');
		this.title_bot.setOrigin(0,1);
		this.title_bot.scaleY = 0;
		this.tweens.add({
			targets: this.title_bot,
			scaleY: 1, duration: 400, ease: 'Linear', delay: 500,
			yoyo: true, hold: 4500
		});
		this.tweens.add({
			targets: this.title_bot,
			x: -1760, duration: 5300, ease: 'Linear', delay: 500
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

	set_arrow_speed() {
		this.tpb = this.tps/(this.bpm/60) // Ticks per beat
		//console.log("Updating arrows for BPM " + this.bpm + "\nTicks per beat: " + this.tpb);

		this.arrow_move_speed_ppt = ARROW_DIST_TO_HIT / (this.tpb * this.bpb); // Fall speed of each arrow, in pixels per tick
		//console.log("New fall speed: " + this.arrow_move_speed_ppt);

		// # of ticks for a standard arrow to fall from the top to the hitbox.
		this.arrow_reach_hit_ticks = ARROW_DIST_TO_HIT / this.arrow_move_speed_ppt;

		// # of ticks for a standard arrow to fall from the top to bottom of the screen.
		this.arrow_reach_goal_ticks = ARROW_DIST_TOTAL / this.arrow_move_speed_ppt;
	}

	// Create game objects
	init_game_objects() {

		// Create sprites
		this.hit_frame = this.add_starting_visual( this.add.sprite(WINDOW_WIDTH/2., ARROW_HIT_Y, 'hit_frame', 0) );

		this.dance_pad = this.add_starting_visual( this.add.sprite(GONDOLA_X-DANCE_PAD_OFFSET_X, GONDOLA_Y-DANCE_PAD_OFFSET_Y, 'dance_pad') );

		this.gondola = this.add_starting_visual( this.add.sprite(GONDOLA_X, GONDOLA_Y + Gondola_Offsets.Neutral, 'gondola', Gondola_Poses.Neutral) );
		this.gondola.setOrigin(0.5,1);
		this.gondola_start_bounce = this.tweens.add({
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

		this.static_arrows = []
		for(var i = 0; i < 4; i++) {
			this.static_arrows.push( this.add_starting_visual( this.add.existing(new Arrow(this, ARROW_X[i], 75, i, 0)), 0.5) );
			this.static_arrows[i].alpha = 0.5;
		}

	}

	add_starting_visual(game_object, alpha=1) {
		game_object.alpha=0;
		this.tweens.add({ targets:game_object, alpha:alpha, duration:1, delay:10});
		return game_object;
	}

	update_bpm(delta) {
		//console.log("Current BPM: " + this.bpm);
		//console.log("Target BPM: "  + this.target_bpm);
		//console.log("Change rate: "  + this.bpm_change_per_beat);

		if((this.bpm > this.target_bpm && this.bpm_change_per_beat < 0) ||
			 (this.bpm < this.target_bpm && this.bpm_change_per_beat > 0)) {

			let elapsed_sec = delta / 1000.;
			let beat_duration_sec = this.bpm / 60.;

			//console.log("Elapsed seconds: " + elapsed_sec);
			//console.log("Length of beat: "  + beat_duration_sec);

			this.bpm += (this.bpm_change_per_beat / beat_duration_sec) * elapsed_sec;

			//console.log("New BPM: " + this.bpm);

			this.set_arrow_speed(); // TODO: Make SET method

		} else { // Stabilize at target BPM
			console.log("BPM change rate is 0 or threshold reached; setting BPM to target");
			this.bpm = this.target_bpm;
			this.bpm_change_per_beat = 0;
			this.background.period = beat_to_ms(this.bpb,this.bpm);
			this.set_arrow_speed();
		}
	}

	update_feedback(delta_tick) {

		// Iterate through feedback text
		this.feedback_array = this.feedback_array.filter((item, i) => {
			var current_feedback = this.feedback_array[i];

			// Increment lifetime of the feedback text
			current_feedback.lifetime_ticks += delta_tick;

			// Destroy feedback that is too old
			if(current_feedback.lifetime_ticks > FEEDBACK_LIFETIME) {
				current_feedback.destroy();
				return false;
			}

			// Otherwise make the text rise
			else {
				current_feedback.y -= FEEDBACK_RISE_SPEED;
				if(current_feedback.lifetime_ticks > FEEDBACK_FADE_START_TICK && current_feedback.alpha > 0) {
					current_feedback.alpha -= FEEDBACK_FADE_SPEED;
				}
				return true;
			}
		});
	}


	add_feedback_generic(x, y, text, jitter_x = 0, jitter_y = 0, image = false, fill = "#00F", fontsize = "32px") {

		if (image) {
			var feedback = new FeedbackImage(this, x, y, text, jitter_x, jitter_y);
		} else {
			var feedback = new FeedbackText(this, x, y, text, {
					fontSize: fontsize,
					fill: fill
			}, jitter_x, jitter_y);
		}
		this.add.existing(feedback);
		this.feedback_array.push(feedback);

	}

	add_feedback_hit(text) {

		this.add_feedback_generic(FEEDBACK_HIT_X, FEEDBACK_HIT_Y, `hit_${text}`,
			FEEDBACK_JITTER_X, FEEDBACK_JITTER_Y, true);
	}

	add_feedback_error() {

		this.add_feedback_generic(FEEDBACK_HIT_X, FEEDBACK_HIT_Y, "hit_miss",
			FEEDBACK_JITTER_X, FEEDBACK_JITTER_Y, true);
	}

	add_feedback_combo(number) {

		this.add_feedback_generic(FEEDBACK_COMBO_X, FEEDBACK_COMBO_Y, "combo", 0, 0, true);
	}


	// Create, move, destroy, and register hits on arrows for this loop
	update_arrows (delta_tick) {

		this.arrows = this.arrows.filter( (arrow, i) => {

			// Update position
			arrow.lifetime_ticks += delta_tick;
			arrow.y = ARROW_START_Y - ((arrow.lifetime_ticks/this.arrow_reach_goal_ticks) * ARROW_DIST_TOTAL);

			// Destroy arrow if out of screen
			if (arrow.y < ARROW_END_Y) {
				arrow.destroy();
				return 0;
			}

			// If arrow has passed the hit window, mark as missed
			if (arrow.y < this.hit_window_end && !arrow.has_hit && !arrow.has_missed) {
				this.handle_miss(arrow);
			}

			return 1;

		}, this);

		// If there are no more arrows, end the game
		if (!this.dance_ended && this.song_idx >= this.song.beatmap.length && this.arrows.length == 0) {
			this.end_dance();
		}
	}

	// Check if each pressed arrow key correctly hits an arrow
	check_input() {

		this.arrow_keys.forEach( (key, i) => {

			// Direction that was pressed
			let direction = Directions[i];

			// JustDown(key) returns true only once per key press
			if (Phaser.Input.Keyboard.JustDown(key)) {
				let key_hit = false;

				// Loop through arrows
				for (var j = 0; j < this.arrows.length; j++) {
					let arrow = this.arrows[j];

					// Check if arrow matches direction, is in hit window, and is not hit
					if (arrow.matches(direction) && arrow.in_window(this.hit_window_end, this.hit_window_start) && !arrow.has_hit) {
						this.handle_hit(arrow);
						key_hit = true;
						break; // Each key press should hit only one arrow, so break
					}
				}
				if (!key_hit) { // If the key is pressed but had no matching arrow in the hit window, it's incorrect
					this.handle_miss();
				}
			}
		});
	}

	check_secret_code() {
		this.arrow_keys.forEach( (key, i) => {

			// Direction that was pressed
			let direction = Directions[i];

			// JustDown(key) returns true only once per key press
			if (Phaser.Input.Keyboard.JustDown(key)) {
				this.secret_code_input += direction;
			}
		});
		if (this.secret_code_input == this.secret_code) {
			return true;
		} else if (!this.secret_code.startsWith(this.secret_code_input)) {
			this.secret_code_input = ""
		}

		return false;
	}

	update_gondola () {
		let direction_pressed = ""

		for (var i = 0; i < this.arrow_keys.length; i++) {
			if (this.arrow_keys[i].isDown) {
				let direction = Directions[i];
				if (!direction_pressed) {
					direction_pressed += direction;
				} else {
					direction_pressed += direction;
					break;
				}
			}
		}

		if (!direction_pressed) {
			direction_pressed = "Neutral";
		}

		this.gondola.setFrame(Gondola_Poses[direction_pressed]);
		this.gondola.y = GONDOLA_Y + Gondola_Offsets[direction_pressed];
	}

	get_hit_rank (hit_distance) {
		//console.log(hit_distance);
		for (const rank of Hit_Ranks) {
			if (hit_distance <= rank.Distance) {
				return rank;
			}
		}
	}

	handle_beat(delta_tick) {

		if (this.song_idx < this.song.beatmap.length) {

			let beat_action = this.song.beatmap[this.song_idx];
			let idx_adjust = 0;

			// Arrows are generated at an offset
			if (beat_action.arrows.length > 0) {
				if (this.beat >= beat_action.beat - this.arrow_reach_hit_ticks / this.tpb) {

					console.log(beat_action.beat);
					console.log(this.beat);

					beat_action.arrows.forEach((arrow, i) => {
						console.log(arrow.direction);
						this.arrows.push(new Arrow(this, ARROW_X[Directions[arrow.direction]], ARROW_START_Y, Directions[arrow.direction], 0)); // Push new arrow to array
						this.add.existing(this.arrows[this.arrows.length-1]);
					});
					beat_action.arrows = [];

					if(beat_action.config == undefined) {
						idx_adjust = 1;
					}
				}
			}

			// Effects occur on the beat
			if (this.beat >= beat_action.beat) {
				if(beat_action.config != undefined) {

					console.log(beat_action.beat);
					console.log(this.beat);
					console.log(beat_action.config);

					idx_adjust = 1;

					for (const param in beat_action.config) {
						switch(param) {
							case "bpm":
								this.update_target_bpm(beat_action.config[param]);
								break;
							case "sound":
								this.play_timed_sound(beat_action.config[param]);
								break;
							case "image":
								this.show_timed_image(beat_action.config[param]);
								break;
						}
					}

					if(beat_action.arrows.length == 0) {
						idx_adjust = 1;
					}
				}
			}

			this.song_idx += idx_adjust;

		}
	}

	play_timed_sound(sound_config) {
		let sound = sound_config.name;
		this.sfx[sound].play({volume: 1.5});
		console.log("SFX triggered")
	}

	show_timed_image(image_config) {
		let timed_image = this.add.image(WINDOW_WIDTH/2., WINDOW_HEIGHT/2., image_config.key);
		timed_image.scaleX = 2;
		timed_image.scaleY = 0;

		this.tweens.add({
			targets: timed_image,
			scaleX: 1,
			scaleY: 1,
			duration: 100,
			yoyo: true,
			hold: image_config.duration,
			onComplete: timed_image.destroy
		})
	}

	do_on_beat() {
		for (var i = 0; i < this.arrows.length; i++) {
			this.tweens.add({
				targets: this.arrows[i],
				scaleX: 1.2,
				scaleY: 1.2,
				yoyo: true,
				duration: 50,
			});
		};

		this.static_arrows.forEach( (arrow, i) => {
			this.tweens.add({
				targets: arrow,
				scaleX: 1.2,
				scaleY: 1.2,
				yoyo: true,
				duration: 50,
			});
		})

		this.tweens.add({
			targets: this.gondola,
			scaleX: 1.05,
			scaleY: 0.9,
			ease: 'Sine.easeInOut',
			duration: beat_to_ms(0.5, this.bpm),
			yoyo: true
		});
	}

	update_target_bpm(bpm_config) {

		if(bpm_config.duration == 0) {
			this.bpm = this.target_bpm = bpm_config.target;
			this.bpm_change_per_beat = 0;
			console.log("BPM changed: " + this.bpm);
		} else {
			this.target_bpm = bpm_config.target;
			this.bpm_change_per_beat = (this.target_bpm - this.bpm) / bpm_config.duration;
			console.log("BPM target: " + this.target_bpm);
		}
		this.set_arrow_speed(); // TODO: SET function
	}

	handle_hit (arrow) {
		arrow.has_hit = true;
		arrow.visible = false;
		this.hit_frame.play('hit_frame_flash');

		this.combo++;
		if (this.combo >= 4) {
			this.add_feedback_combo(this.combo);
		}

		var hit_distance = Math.abs(ARROW_HIT_Y - arrow.y);
		let rank = this.get_hit_rank(hit_distance);

		if (rank.Breaks_combo){
			this.combo = 0;
		}
		this.score += rank.Score * Math.pow(Math.ceil(this.combo/4), rank.Combo_power)
		this.score_text.text = `${this.score}`

		this.add_feedback_hit(rank.Text);
	}

	handle_miss (arrow = null) {
		if (this.combo >= 4) {
			this.cameras.main.shake(100);
		}
		this.combo = 0;
		if (arrow === null) {
			this.add_feedback_error();
		} else {
			arrow.has_missed = true;
			this.add_feedback_error();
		}
	}

	end_dance () {
		console.log("Ending dance.")
		this.dance_ended = true;
		this.music.stop();
		function transition_to_endscreen() {
			this.gondola.destroy();
			this.dance_pad.destroy();
			this.hit_frame.destroy();
			this.score_text.destroy();
			for (var i = 0; i < this.static_arrows.length; i++) {
				this.static_arrows[i].destroy();
			}
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
	Neutral:   0,
	Left:      1,
	Right:     2,
	Down:      3,
	Up:        4,
	UpRight:   5,
	DownLeft:  6,
	UpLeft:    7,
	RightDown: 8,
	RightLeft: 9,
	UpDown:   10,
	Happy:    11
}

const Gondola_Offsets = {
	Neutral:   -88,
	Left:      -57,
	Right:     -59,
	Down:      -93,
	Up:        7,
	UpRight:   17,
	DownLeft:  -50,
	UpLeft:    5,
	RightDown: -60,
	RightLeft: -50,
	UpDown:    10,
	Happy:     -88
}

const GONDOLA_WIDTH  = 359;
const GONDOLA_HEIGHT = 367;
const GONDOLA_X 	 = 450;
const GONDOLA_Y      = 480;
const DANCE_PAD_OFFSET_X = -30;
const DANCE_PAD_OFFSET_Y = 40;

const SCORE_X = WINDOW_WIDTH - 10;
const SCORE_Y = WINDOW_HEIGHT - 10;
