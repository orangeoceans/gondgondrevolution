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
	}


	create () {
		let scene = this.scene;
		scene.start('gonddr');
	}

}

class GonDDR extends Phaser.Scene {

	constructor () {

		super('gonddr');

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
		this.hit_window;
						// Margin in ticks that a player's button press registers as a hit
		this.start_time;

		//TODO
	}


	preload () {
		
	}


	create () {

		this.start_time = Date.now();
		this.arrows = [];
		this.arrows.push(new Arrow(this, 100, ARROW_START, 0, Directions.Up, 0));
		this.add.existing(this.arrows[this.arrows.length-1]);

		//this.input.on('', function () {
		//}, this)

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
			this.arrows.push(new Arrow(this, 100, ARROW_START, this_tick, (this.arrows[this.arrows.length-1].direction+1)%4, 0));
			this.add.existing(this.arrows[this.arrows.length-1]);
			console.log(this.arrows.length);
		}

		for (var i = this.arrows.length-1; i >= 0; i--) {

			let elapsed_ticks = this_tick - this.arrows[i].start_tick;
			this.arrows[i].y = ARROW_START + ((elapsed_ticks/this.fall_ticks) * ARROW_DIST);

			if (this.arrows[i].y > ARROW_END) {
				let arrow_to_destroy = this.arrows.splice(i, 1);
				arrow_to_destroy[0].destroy();
			}
		}
		//update position of arrows

		//check if 
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

const ARROW_SIZE  = 50;
const ARROW_START = -ARROW_SIZE;
const ARROW_END   = config.height + ARROW_SIZE;
const ARROW_DIST  = ARROW_END - ARROW_START;


var game = new Phaser.Game(config);
