class Endscreen extends Phaser.Scene {

	constructor() {
		super('endscreen');

		this.press_start;
		this.ggr_logo;
		this.soundcloud_link;
		this.gondolaquest_link;
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
		
		this.press_start = this.add_starting_visual(this.add.image(WINDOW_WIDTH/2., .79*WINDOW_HEIGHT, 'press_restart'));
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
		this.press_start.setInteractive();
		this.press_start.on("pointerup", this.restart_dance, this);

		this.ggr_logo = this.add_starting_visual(this.add.image(WINDOW_WIDTH/2., .27*WINDOW_HEIGHT, 'ggr_logo'));

		this.score_text = this.add_starting_visual( this.add.bitmapText(SCORE_SIZE, .60*WINDOW_HEIGHT, 'scorefont', 'SCORE:', END_SCORE_SIZE) );
		this.score_text.setOrigin(0,0.5);
		this.score_number = this.add_starting_visual( this.add.bitmapText(WINDOW_WIDTH-SCORE_SIZE, .60*WINDOW_HEIGHT, 
																		'scorefont', `${this.score}`, END_SCORE_SIZE) );
		this.score_number.setOrigin(1,0.5);

		this.high_score_text = this.add_starting_visual( this.add.bitmapText(SCORE_SIZE, .67*WINDOW_HEIGHT, 'scorefont', 'HI-SCORE:', END_SCORE_SIZE) );
		this.high_score_text.setOrigin(0,0.5);
		this.high_score_number = this.add_starting_visual( this.add.bitmapText(WINDOW_WIDTH-SCORE_SIZE, .67*WINDOW_HEIGHT, 
																		'scorefont', `${this.high_score}`, END_SCORE_SIZE) );
		this.high_score_number.setOrigin(1,0.5);

		this.soundcloud_link = this.add_starting_visual(this.add.image(WINDOW_WIDTH/2., .47*WINDOW_HEIGHT, 'soundcloud')).setInteractive();
		this.soundcloud_link.on("pointerup", this.open_soundcloud, this);

		this.gondolaquest_link = this.add_starting_visual(this.add.image(WINDOW_WIDTH/2., .97*WINDOW_HEIGHT, 'read_gdlq')).setInteractive();
		this.gondolaquest_link.on("pointerup", this.open_gondolaquest, this);

		//this.max_combo_text = this.add_starting_visual( this.add.bitmapText(SCORE_SIZE, .5*WINDOW_HEIGHT, 'scorefont', 'HI-SCORE:', SCORE_SIZE) );
		//this.max_combo_text.setOrigin(0,0.5);
		//this.max_combo_number = this.add_starting_visual( this.add.bitmapText(WINDOW_WIDTH-SCORE_SIZE, .5*WINDOW_HEIGHT, 
		//																'scorefont', `${this.max_combo}`, SCORE_SIZE) );
		//this.max_combo_number.setOrigin(1,0.5);
	}

	open_gondolaquest() {
		var url = "https://forum.memestudies.org/t/gondolaquest/273";
		this.open_link(url);
	}
	open_soundcloud() {
		var url = "https://soundcloud.com/superlumic";
		this.open_link(url);
	}

	open_link(url) {
		var s = window.open(url, '_blank');
		if (s && s.focus) {
			s.focus();
		} else if (!s) {
			window.location.href = url;
		}
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
			this.soundcloud_link.destroy();
			this.gondolaquest_link.destroy();
			game.events.off('blur');
			game.events.off('focus');
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
END_SCORE_SIZE = 42;