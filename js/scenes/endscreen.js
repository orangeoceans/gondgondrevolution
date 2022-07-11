class Endscreen extends Phaser.Scene {

	constructor() {
		super('endscreen');

		this.press_start;
		this.ggr_logo;
		this.score;
		this.score_text;

	}

	init (data) {
		this.score = data.score;
	}

	create() {

		game.events.on('blur', function () {
			this.scene.pause();
		}, this);

		game.events.on('focus', function () {
			this.scene.resume();
		}, this);
		
		this.press_start = this.add.image(WINDOW_WIDTH/2., WINDOW_HEIGHT*0.75, 'press_start');
		this.tweens.add({
			targets: this.press_start,
			scaleX: PRESS_START_ZOOM,
			scaleY: PRESS_START_ZOOM,
			ease: 'Sine.easeInOut',
			duration: PRESS_START_PERIOD,
			repeat: -1,
			yoyo: true
		});

		this.ggr_logo = this.add.image(WINDOW_WIDTH/2., WINDOW_HEIGHT/3., 'ggr_logo');

		this.input.keyboard.on('keydown_UP', this.restart_dance, this);

		this.score_text = this.add.text(WINDOW_WIDTH/2., WINDOW_HEIGHT - 40, `SCORE: ${this.score}`, {
				fontSize: FEEDBACK_FONTSIZE_DEFAULT,
				fill: FEEDBACK_COLOR_DEFAULT
		});
		this.score_text.setOrigin(0.5,0.5);

	}

	restart_dance() {
		function transition_to_gonddr() {
			this.ggr_logo.visible = false;
			this.press_start.visible = false;
			this.score_text.visible = false;

        	this.scene.transition({
				target: 'gonddr',
				duration: 1200,
				moveBelow: true
			});
		}
		do_checkerboard(this, transition_to_gonddr, this);
	}
}

PRESS_START_Y = 280;
PRESS_START_ZOOM = 0.8;
PRESS_START_PERIOD = 500;
