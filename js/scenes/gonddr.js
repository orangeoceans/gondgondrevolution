class GonDDR extends Phaser.Scene {

	/* =====================
	   Base methods
   	 ===================== */

	constructor () {
		super("gonddr");

		this.song;
		this.arrow_idx;
		this.action_idx;

		this.music;
		this.music_started;
		this.dance_ended;

		this.video;

		this.arrows;      // Currently active arrows
		this.arrow_beams = [];
		this.static_arrows = [];

		this.background = null;
		this.gondola;
		this.dance_pad;

		this.combo;
		this.max_combo;
		this.combo_container;
		this.combo_fade;

		this.score;
		this.score_text;
		this.score_number;
		this.high_score;

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

		this.gondola_pose_timer;
		this.gondola_hold_ticks = ms_to_tick(200, this.tps);

	}

	init (data) {
		this.high_score = data.high_score;
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

		this.score = 0;
		this.combo = 0;
		this.max_combo = 0;
		this.gondola_pose_timer = 0;

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

		//if (!this.background) {
			//this.background = new PurpleWave(this, 1000, beat_to_ms(this.bpb,this.bpm));
			//this.background = new LightBeams(this, beat_to_ms(this.bpb,this.bpm), true);
		//}

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

		this.gondola_pose_timer += delta_tick;
		this.update_gondola();

	}


	/* =====================
	   Initialization
   	 ===================== */

	// Load song data, set BPM and time signature
	init_song() {
		this.song = this.cache.json.get('wuwei');
		this.arrow_idx = 0;
		this.action_idx = 0;

		// Set starting BPM, beats per bar, and ticks per beat
		this.bpm = this.song.properties.starting_bpm;  // Beats per minute
		this.target_bpm = this.bpm;  // For BPM transitions
		this.bpm_change_per_beat = 0;  // For BPM transitions

		this.bpb = this.song.properties.beats_per_bar; // Beats per bar (determines fall time)
		//console.log("BPM: " + this.bpm + " Beats per bar: " + this.bpb);
	}

	// Create game objects
	init_game_objects() {

		// Create sprites
		this.gondola_bg = this.add_starting_visual( this.add.tileSprite( WINDOW_WIDTH/2., WINDOW_HEIGHT/2.,
																		 WINDOW_WIDTH, WINDOW_HEIGHT, 'gondola_bg' ) );
		this.gondola_bg.tileScaleX = 0.6;
		this.gondola_bg.tileScaleY = 0.6;
		this.gondola_bg.depth = -1
		this.tweens.add({
			targets: this.gondola_bg,
			tilePositionX: -4000,
			duration: 20000,
			onComplete: this.gondola_bg.destroy
		});
		this.dance_pad = this.add_starting_visual( this.add.sprite(GONDOLA_X-DANCE_PAD_OFFSET_X, GONDOLA_Y-DANCE_PAD_OFFSET_Y, 'dance_pad') );
		this.dance_pad.depth = -0.5

		this.gondola = this.add_starting_visual( this.add.sprite(GONDOLA_X, GONDOLA_Y + Gondola_Offsets.Neutral, 'gondola', Gondola_Poses.Neutral) );
		this.gondola.setOrigin(0.5,1);
		this.gondola.depth = -0.5
		this.gondola_start_bounce = this.tweens.add({
			targets: this.gondola,
			scaleX: 1.05,
			scaleY: 0.9,
			ease: 'Sine.easeInOut',
			duration: beat_to_ms(0.5, this.bpm),
			repeat: -1,
			yoyo: true
		});

		for(var i = 0; i < 4; i++) {
			this.arrow_beams.push( this.add.image(ARROW_X[i], WINDOW_HEIGHT/2., 'arrow_beam') );
			this.static_arrows.push( this.add_starting_visual( this.add.sprite(ARROW_X[i], -ARROW_SIZE, 'guide_arrows', i) ));
			if (i == 0 || i == 2) {
				this.arrow_beams[i].tint = 0x3892FF;
			} else {
				this.arrow_beams[i].tint = 0xFF38BD;
			}
			this.arrow_beams[i].alpha = 0;
		}

		// Draw score info
		this.score_number = this.add_starting_visual( this.add.bitmapText(SCORE_NUMBER_X, WINDOW_HEIGHT+50, 'scorefont', '0', SCORE_SIZE) );
		this.score_number.setOrigin(1,1);
		this.score_text = this.add_starting_visual( this.add.bitmapText(SCORE_TEXT_X,  WINDOW_HEIGHT+50, 'scorefont', 'SCORE: ', SCORE_SIZE) );
		this.score_text.setOrigin(0,1);

		this.combo_image = this.add.image(0, 0, 'combo');
		this.combo_image.scaleX = 0.8;
		this.combo_image.scaleY = 0.8;
		this.combo_text = this.add.bitmapText(10, 0, 'scorefont', `${this.combo}`, 52);
		this.combo_container = this.add.container(315, ARROW_HIT_Y, [ this.combo_image, this.combo_text ]);
		this.combo_container.alpha = 0;
		this.combo_bounce = this.tweens.add({ targets: this.combo_container, alpha: 0, duration: 1 });
		this.combo_fade = this.tweens.add({ targets: this.combo_container, alpha: 0, duration: 1 });
	}

	add_starting_visual(game_object, alpha=1) {
		game_object.alpha=0;
		this.tweens.add({ targets:game_object, alpha:alpha, duration:1, delay:10});
		return game_object;
	}

	create_title() {
		this.cheer.volume = 0
		this.cheer.play({seek: 0.5})
		this.tweens.add({
			targets: this.cheer, volume: 0.7, duration: 100,
			callbackScope: this,
			onComplete: function (tweens, targets) {
				this.tweens.add({
					targets: this.cheer, volume: 0, duration: 1000, delay:8000
				});
			}
		});


		this.title_top = this.add.image(-1760,0,'song_title_blue');
		this.title_top.setOrigin(0,0);
		this.title_top.y = -40;
		this.tweens.add({
			targets: this.title_top,
			y: 0, duration: 400, ease: 'Linear', delay: 500,
			yoyo: true, hold: 4500, callbackScope: this,
			onStart: function () {this.gondola.setFrame(Gondola_Poses.Happy);}
		});
		this.tweens.add({
			targets: this.title_top,
			x: 0, duration: 5300, ease: 'Linear', delay: 500,
			callbackScope: this, completeDelay: 100,
			onComplete: function (tweens, targets) {
				this.start_song();
			}
		});

		this.title_bot = this.add.image(0,WINDOW_HEIGHT,'song_title_pink');
		this.title_bot.setOrigin(0,1);
		this.title_bot.y = WINDOW_HEIGHT + 40;
		this.tweens.add({
			targets: this.title_bot,
			y: WINDOW_HEIGHT, duration: 400, ease: 'Linear', delay: 500,
			yoyo: true, hold: 4500
		});
		this.tweens.add({
			targets: this.title_bot,
			x: -1760, duration: 5300, ease: 'Linear', delay: 500
		});
	}

	start_song() {
		this.music.play();
		this.music_started = true;
		this.gondola.setFrame(Gondola_Poses.Neutral);
		this.gondola_start_bounce.stop();

		this.tweens.add({
			targets: this.static_arrows,
			y: ARROW_HIT_Y,
			duration: 1000,
			ease: 'Sine.easeInOut'
		});
		this.tweens.add({
			targets: [this.score_number, this.score_text],
			y: SCORE_Y,
			duration: 1000,
			ease: 'Sine.easeInOut'
		});
		this.tweens.add({
			targets: this.gondola_bg,
			alpha: 0,
			duration: 1500,
			onComplete: this.gondola_bg.destroy
		});
	}


	/* =====================
	   Beatmap processing
   	 ===================== */

	// Handle arrows and actions based on the beatmap
	handle_beat(delta_tick) {

		// Action and arrow indices are separate due to differeces in timing
		if (this.action_idx < this.song.beatmap.length) {

			let beat_action = this.song.beatmap[this.action_idx];

			// Effects occur on the beat
			if (this.beat >= beat_action.beat) {
				this.do_beat_action(beat_action);
				this.action_idx++;
			}
		}

		if (this.arrow_idx < this.song.beatmap.length) {

			let beat_arrows = this.song.beatmap[this.arrow_idx];

			// Arrows are drawn 1 bar in advance of hit time
			if (this.beat >= beat_arrows.beat - this.arrow_reach_hit_ticks / this.tpb) {
				this.add_arrows(beat_arrows);
				this.arrow_idx++;
			}
		}

	}

	// Add arrows to the game
	add_arrows(beat_arrows) {
		beat_arrows.arrows.forEach((arrow, i) => {
			this.arrows.push(new Arrow(this, ARROW_X[Directions[arrow.direction]], ARROW_START_Y, Directions[arrow.direction], 0)); // Push new arrow to array
			this.add.existing(this.arrows[this.arrows.length-1]);
		});
	}

	// Perform timed actions
	do_beat_action(beat_action) {

		// Nothing to do if there's no config
		if(beat_action.config == undefined) { return; }

		// Handle BPM changes, SFX, images, and background changes as needed
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
				case "background":
					this.change_background(beat_action.config[param]);
					break;
				case "video":
					this.play_video(beat_action.config[param]);
					break;
			}
		}

	}

	end_dance () {
		this.dance_ended = true;
		this.music.stop();
		function transition_to_endscreen() {
			this.gondola.destroy();
			this.dance_pad.destroy();
			this.score_text.destroy();
			this.score_number.destroy();
			this.combo_container.destroy();
			this.combo_text.destroy();
			this.combo_image.destroy();
			while (this.static_arrows.length > 0) {
				this.static_arrows.pop().destroy();
				this.arrow_beams.pop().destroy();
			}
			this.scene.transition({
				target: 'endscreen',
				duration: 1200,
				moveBelow: true,
				data: {score: this.score, high_score: this.high_score, max_combo: this.max_combo}
			});
		}

		this.background.end();
		this.background = null;
		this.time.delayedCall(500,
			function() {
				do_checkerboard(this, transition_to_endscreen, this);
			}, [], this
		);
	}


	/* =====================
	   BPM handlers
   	 ===================== */

	// Update the speed that arrows fall at based on current BPM
	set_arrow_speed() {
		this.tpb = this.tps/(this.bpm/60) // Ticks per beat
		this.arrow_move_speed_ppt = ARROW_DIST_TO_HIT / (this.tpb * this.bpb); // Fall speed of each arrow, in pixels per tick

		// # of ticks for a standard arrow to fall from the top to the hitbox.
		this.arrow_reach_hit_ticks = ARROW_DIST_TO_HIT / this.arrow_move_speed_ppt;

		// # of ticks for a standard arrow to fall from the top to bottom of the screen.
		this.arrow_reach_goal_ticks = ARROW_DIST_TOTAL / this.arrow_move_speed_ppt;
	}

	// Set the target BPM based on beatmap
	update_target_bpm(bpm_config) {

		if(bpm_config.duration == 0) {
			this.bpm = this.target_bpm = bpm_config.target;
			this.bpm_change_per_beat = 0;
		} else {
			this.target_bpm = bpm_config.target;
			this.bpm_change_per_beat = (this.target_bpm - this.bpm) / bpm_config.duration;
		}
		this.set_arrow_speed(); // TODO: SET function
	}

	// Increment or set the BPM based on target
	update_bpm(delta) {

		if((this.bpm > this.target_bpm && this.bpm_change_per_beat < 0) ||
			 (this.bpm < this.target_bpm && this.bpm_change_per_beat > 0)) {

			let elapsed_sec = delta / 1000.;
			let beat_duration_sec = this.bpm / 60.;

			this.bpm += (this.bpm_change_per_beat * beat_duration_sec) * elapsed_sec;
			this.set_arrow_speed();

		} else { // Stabilize at target BPM
			// Set BPM and reset rate of change
			this.bpm = this.target_bpm;
			this.bpm_change_per_beat = 0;

			// Update background and arrow speed
			this.background.period = beat_to_ms(this.bpb,this.bpm);
			this.set_arrow_speed();
		}
	}


	/* =====================
	   Input handlers
   	 ===================== */

	// Check if each pressed arrow key correctly hits an arrow
	check_input() {

		this.arrow_keys.forEach( (key, i) => {

			// Direction that was pressed
			let direction = Directions[i];

			// JustDown(key) returns true only once per key press
			if (Phaser.Input.Keyboard.JustDown(key)) {
				let key_hit = false;
				this.gondola_pose_timer = 0;

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

	// Check if user has input the secret code
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

 		// If there are no more arrows or actions, end the game
 		if (!this.dance_ended &&
 				 this.arrow_idx >= this.song.beatmap.length &&
 				 this.action_idx >= this.song.beatmap.length &&
 				 this.arrows.length == 0) {
 			this.end_dance();
 		}
 	}

	handle_hit (arrow) {
		arrow.has_hit = true;
		arrow.visible = false;
		this.arrow_beams[arrow.direction].alpha = 1;
		this.tweens.add({
			targets: this.arrow_beams[arrow.direction],
			alpha: 0,
			duration: 500,
		});

		this.combo++;
		if (this.combo > this.max_combo)
			this.max_combo = this.combo;
		if (this.combo >= 4)
			this.add_feedback_combo();

		var hit_distance = Math.abs(ARROW_HIT_Y - arrow.y);
		let rank = this.get_hit_rank(hit_distance);

		if (rank.Breaks_combo){
			if (this.combo >= 4){
				this.cameras.main.shake(100);
			}
			this.combo = 0;
			this.combo_fade.complete();
			this.combo_container.alpha = 0;
		}
		this.score += rank.Score * Math.pow(Math.ceil(this.combo/4), rank.Combo_power)
		this.score_number.text = `${this.score}`

		this.add_feedback_hit(rank.Text);
	}

	handle_miss (arrow = null) {
		if (this.combo >= 4) {
			this.cameras.main.shake(100);
		}
		this.combo = 0;
		this.combo_fade.complete();
		this.combo_container.alpha = 0;
		if (arrow === null) {
			this.add_feedback_error();
		} else {
			arrow.has_missed = true;
			this.add_feedback_error();
		}
	}

	// Check accuracy of hit
	get_hit_rank (hit_distance) {
 		for (const rank of Hit_Ranks) {
 			if (hit_distance <= rank.Distance) {
 				return rank;
 			}
 		}
 	}


	/* =====================
	   Feedback handlers
   	 ===================== */

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
		this.tweens.add({
			targets: feedback,
			alpha: 0,
			y: feedback.y - FEEDBACK_DISTANCE,
			duration: FEEDBACK_FADE_TIME,
			delay: FEEDBACK_FADE_DELAY,
			onComplete: feedback.destroy
		})

	}

	add_feedback_hit(text) {

		this.add_feedback_generic(FEEDBACK_HIT_X, FEEDBACK_HIT_Y, `hit_${text}`,
			FEEDBACK_JITTER_X, FEEDBACK_JITTER_Y, true);
	}

	add_feedback_error() {

		this.add_feedback_generic(FEEDBACK_HIT_X, FEEDBACK_HIT_Y, "hit_miss",
			FEEDBACK_JITTER_X, FEEDBACK_JITTER_Y, true);
	}

	add_feedback_combo() {

		this.combo_text.text = `${this.combo}`;
		this.combo_container.alpha = 1;
		this.combo_container.scaleX = 1;
		this.combo_container.scaleY = 1;

		//if (this.combo_bounce)
		this.combo_bounce.complete();
		this.combo_bounce = this.tweens.add({
			targets: this.combo_container,
			scaleX: 1.2,
			scaleY: 1.2,
			duration: 100,
			yoyo: true
		});
		//if (this.combo_fade)
		this.combo_fade.complete();
		this.combo_fade = this.tweens.add({
			targets: this.combo_container,
			alpha: 0.5,
			duration: 500,
			delay: 500
		});
	}

	/* =====================
	   Timed action handlers
   	 ===================== */

	// Play SFX
	play_timed_sound(sound_config) {
		let sound = sound_config.name;
		this.sfx[sound].play({volume: 1.5});
	}

	// Display splash graphic
	show_timed_image(image_config) {
		let timed_image = this.add.image(WINDOW_WIDTH/2., WINDOW_HEIGHT/2., image_config.name);
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

	// Update the background
	change_background(bg_config) {
		let bg_name = bg_config.name;
		let bg_period_beats = bg_config.beats;
		if (this.background) {
			this.background.end();
		}
		switch(bg_name) {
			case "purple_wave":
				this.background = new PurpleWave(this, 500, beat_to_ms(bg_period_beats,this.bpm));
				break;
			case "colored_circles":
				this.background = new ColoredCircles(this, beat_to_ms(bg_period_beats,this.bpm));
				break;
			case "light_beams_fade":
				this.background = new LightBeams(this, beat_to_ms(bg_period_beats,this.bpm), true);
				break;
			case "light_beams_flash":
				this.background = new LightBeams(this, beat_to_ms(bg_period_beats,this.bpm), false);
				break;
			case "checker_spin":
				this.background = new CheckerSpin(this, beat_to_ms(bg_period_beats,this.bpm));
				break;
		}
	}

	// Play a video
	play_video(vid_config) {
		this.video = this.add.video(WINDOW_WIDTH/2., WINDOW_HEIGHT/2., vid_config.name);
		this.video.depth = -0.4;
		if (vid_config.zoom) {
			this.video.setPlaybackRate(vid_config.rate)
			this.video.alpha = 0;
			this.video.scaleX = 0;
			this.video.scaleY = 0;
			this.tweens.add({
				targets: this.video,
				alpha: 1,
				scaleX: 0.67,
				scaleY: 0.67,
				duration: 250,
				callbackScope: this,
				onComplete: function (tween) {
					this.tweens.add({
						targets: this.video,
						scaleX: 1.3,
						scaleY: 1.3,
						duration: 12750
					});
				}
			});
			this.video.on('complete', function(video){
				this.tweens.add({
					targets: this.video,
					alpha: 0,
					scaleX: 4,
					scaleY: 4,
					duration: 100,
					onComplete: this.video.destroy
				})
			}, this);
		} else {
			if (this.background) {
				this.background.end();
			}
			this.video.setBlendMode(Phaser.BlendModes.SCREEN);
			this.tweens.add({
				targets: this.video,
				alpha: 0,
				duration: 1800,
				delay: 2000,
			});
			this.video.on('complete', this.video.destroy, this.video);
		}
		this.video.play();
		

	}



	/* =====================
	   Animation & sprite handlers
   	 ===================== */

	// Gondola reacts to button presses
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

 		if (!direction_pressed && this.gondola_pose_timer >= this.gondola_hold_ticks) {
 			direction_pressed = "Neutral";
 		}

 		if (direction_pressed) {
 			this.gondola.setFrame(Gondola_Poses[direction_pressed]);
 			this.gondola.y = GONDOLA_Y + Gondola_Offsets[direction_pressed];
 		}
 	}

	// Perform animations in time with beat
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
}


/* =====================
   Constants
 	 ===================== */

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

const SCORE_SIZE = 52;
const SCORE_NUMBER_X = WINDOW_WIDTH-SCORE_SIZE/2.;
const SCORE_TEXT_X = SCORE_SIZE/2.;
const SCORE_Y = WINDOW_HEIGHT-SCORE_SIZE/2.;
