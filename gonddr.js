class Boot extends Phaser.Scene {

	constructor () {
		super('boot');
	}
	

	init () {
		let element = document.createElement('style');
		document.head.appendChild(element);
	}


	preload () {
		this.load.spritesheet('arrows','assets/arrows.png', {frameWidth: ARROW_SIZE, frameHeight: ARROW_SIZE});
		this.load.spritesheet('hit_frame', 'assets/hit_frame.png', {frameWidth: ARROW_SIZE, frameHeight: ARROW_SIZE});
	}


	create () {
		let scene = this.scene;
		scene.start('gonddr');
	}

}

class GonDDR extends Phaser.Scene {

	constructor () {

		super('gonddr');

		this.hit_frame;   // Sprite of hit window
		this.arrows;      // Currently active arrows
		this.song_script; // Hash of strings; maps a tick to a string encoding the arrow(s) to create.
		this.gondola;
		this.combo;
		this.score;

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

		//TODO
	}


	preload () {
		
	}


	create () {

		this.hit_frame = this.add.sprite(100, ARROW_HIT_Y, 'hit_frame', 0);
		this.arrows = [];
		this.arrows.push(new Arrow(this, 100, ARROW_START_Y, 0, Directions.Up, 0));
		this.add.existing(this.arrows[this.arrows.length-1]);

		this.arrow_keys['Up'] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		this.arrow_keys['Right'] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		this.arrow_keys['Down'] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
		this.arrow_keys['Left'] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);

		this.anims.create({
			key: 'hit_frame_flash',
			frames: this.anims.generateFrameNumbers('hit_frame', { frames: [ 0, 1, 0 ] }),
			frameRate: 8,
			repeat: 0
		});

	}

	update (time) {
		let this_tick = this.time_to_tick(time);
		this.update_arrows(this_tick);
	}


	//read_song_file: function()
	//{
		//TODO
	//},


	time_to_tick (ts_ms) {
		return Math.floor(this.tps * ts_ms / 1000.);
	}


	update_arrows (this_tick) {

		// console.log(this_tick - this.arrows[this.arrows.length-1].start_tick);

		//if song_script[this_tick] == this_tick + fall_ticks
		if (this_tick - this.arrows[this.arrows.length-1].start_tick >= 200) {
			this.arrows.push(new Arrow(this, 100, ARROW_START_Y, this_tick, (this.arrows[this.arrows.length-1].direction+1)%4, 0));
			this.add.existing(this.arrows[this.arrows.length-1]);
		}

		for (var i = this.arrows.length-1; i >= 0; i--) {

			let elapsed_ticks = this_tick - this.arrows[i].start_tick;
			this.arrows[i].y = ARROW_START_Y + ((elapsed_ticks/this.fall_ticks) * ARROW_DIST_TOTAL);

			if (this.arrows[i].y > ARROW_END_Y) {
				let arrow_to_destroy = this.arrows.splice(i, 1);
				arrow_to_destroy[0].destroy();
			}

			if (this.arrows[i].y > this.hit_window_end && !this.arrows[i].has_hit) {
				console.log('PENALTY MISSED ${this_tick}');
			}
		}

		for (const [direction, input_key] of Object.entries(this.arrow_keys)) {
			if (Phaser.Input.Keyboard.JustDown(input_key)) {

				let key_hit = false;
				for (var i = 0; i < this.arrows.length; i++) {
					if (Directions[direction] == this.arrows[i].direction) {
						if (this.hit_window_start < this.arrows[i].y && this.arrows[i].y < this.hit_window_end) {
							this.arrows[i].has_hit = true;
							key_hit = true;
							this.hit_frame.play('hit_frame_flash');
							break;
						}
					}
				}
				if (!key_hit) {
					console.log('PENALTY INCORRECT ${this_tick}');
				}

			}
		}
	}

	check_arrow_hit () {

	}

//arrow class fields: 	direction, type, hit_tick, has_hit
}


class Arrow extends Phaser.GameObjects.Sprite {
	constructor(scene, x, y, start_tick, direction, hit_tick) {
		super(scene, x, y, 'arrows', direction);

		this.start_tick = start_tick;
		this.direction = direction;
		this.hit_tick = hit_tick;
		this.has_hit = false;
	}
}

const Directions = {
	Up:    0,
	Right: 1,
	Down:  2,
	Left:  3
};

var config = {
    type: Phaser.AUTO,
    width: 640,
    height: 640,
    scene: [ Boot, GonDDR ]
};

const ARROW_SIZE    = 50;
const ARROW_START_Y = -ARROW_SIZE;
const ARROW_END_Y   = config.height + ARROW_SIZE;
const ARROW_HIT_Y   = config.height - 100

const ARROW_DIST_TOTAL  = ARROW_END_Y - ARROW_START_Y;
const ARROW_DIST_TO_HIT = ARROW_HIT_Y - ARROW_START_Y;


var game = new Phaser.Game(config);
