class Endscreen extends Phaser.Scene {

	constructor() {
		super('endscreen');

		this.press_start;
		this.ggr_logo;
		this.score;
		this.high_score;
		this.score_text;
		this.score_number;
		this.high_score_text;
		this.high_score_number;
		this.max_combo;
		this.max_combo_text;
		this.max_combo_number;

	}

	init (data) {
		this.score = data.score;
		this.high_score = data.high_score;
		this.max_combo = data.max_combo;

		if (this.score > this.high_score) {
			this.high_score = this.score;
		}
	}

	create() {

		game.events.on('blur', function () {
			this.scene.pause();
		}, this);

		game.events.on('focus', function () {
			this.scene.resume();
		}, this);
		
		this.press_start = this.add_starting_visual(this.add.image(WINDOW_WIDTH/2., .82*WINDOW_HEIGHT, 'press_start'));
		this.press_start.setOrigin(0.5,1);
		this.tweens.add({
			targets: this.press_start,
			scaleX: PRESS_START_ZOOM,
			scaleY: PRESS_START_ZOOM,
			ease: 'Sine.easeInOut',
			duration: PRESS_START_PERIOD,
			repeat: -1,
			yoyo: true
		});

		this.ggr_logo = this.add_starting_visual(this.add.image(WINDOW_WIDTH/2., .3*WINDOW_HEIGHT, 'ggr_logo'));

		this.input.keyboard.on('keydown_UP', this.restart_dance, this);

		this.score_text = this.add_starting_visual( this.add.bitmapText(SCORE_SIZE, .55*WINDOW_HEIGHT, 'scorefont', 'SCORE:', SCORE_SIZE) );
		this.score_text.setOrigin(0,0.5);
		this.score_number = this.add_starting_visual( this.add.bitmapText(WINDOW_WIDTH-SCORE_SIZE, .55*WINDOW_HEIGHT, 
																		'scorefont', `${this.score}`, SCORE_SIZE) );
		this.score_number.setOrigin(1,0.5);

		this.high_score_text = this.add_starting_visual( this.add.bitmapText(SCORE_SIZE, .62*WINDOW_HEIGHT, 'scorefont', 'HI-SCORE:', SCORE_SIZE) );
		this.high_score_text.setOrigin(0,0.5);
		this.high_score_number = this.add_starting_visual( this.add.bitmapText(WINDOW_WIDTH-SCORE_SIZE, .62*WINDOW_HEIGHT, 
																		'scorefont', `${this.high_score}`, SCORE_SIZE) );
		this.high_score_number.setOrigin(1,0.5);

		//this.max_combo_text = this.add_starting_visual( this.add.bitmapText(SCORE_SIZE, .5*WINDOW_HEIGHT, 'scorefont', 'HI-SCORE:', SCORE_SIZE) );
		//this.max_combo_text.setOrigin(0,0.5);
		//this.max_combo_number = this.add_starting_visual( this.add.bitmapText(WINDOW_WIDTH-SCORE_SIZE, .5*WINDOW_HEIGHT, 
		//																'scorefont', `${this.max_combo}`, SCORE_SIZE) );
		//this.max_combo_number.setOrigin(1,0.5);
	}

	add_starting_visual(game_object, alpha=1) {
		game_object.alpha=0;
		this.tweens.add({ targets:game_object, alpha:alpha, duration:1, delay:10});
		return game_object;
	}

	restart_dance() {
		function transition_to_gonddr() {
			this.ggr_logo.destroy();
			this.press_start.destroy();
			this.score_text.destroy();
			this.high_score_text.destroy();
			this.score_number.destroy();
			this.high_score_number.destroy();

        	this.scene.transition({
				target: 'gonddr',
				duration: 1200,
				moveBelow: true,
				data: {high_score: this.high_score}
			});
		}
		do_checkerboard(this, transition_to_gonddr, this);
	}
}

PRESS_START_Y = 280;
PRESS_START_ZOOM = 0.8;
PRESS_START_PERIOD = 500;
END_SCORE_SIZE = 48;