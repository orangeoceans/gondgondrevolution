class Boot extends Phaser.Scene {

	constructor () 
	{
		super('boot');
	}
	

	init ()
	{
		let element = document.createElement('style');
		document.head.appendChild(element);
	}


	preload ()
	{
		this.load.spritesheet('arrows','assets/arrows.png', {frameWidth: 50, frameHeight: 50});
	}


	create ()
	{
		let scene = this.scene;
		scene.start('gonddr');
	}

}

class GonDDR extends Phaser.Scene {

	constructor ()
	{
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
		this.fall_ticks = 400;
						// # of ticks for a standard arrow to fall from the top to bottom of the screen.
		this.hit_window;
						// Margin in ticks that a player's button press registers as a hit
		this.clock;

		//TODO
	}


	preload ()
	{
		
	}


	create ()
	{
		this.add.sprite(100, 100, 'arrows', 1);

		//this.input.on('', function () {
		//}, this)

	}


	//read_song_file: function()
	//{
		//TODO
	//},

	//update_arrows: function(this_tick)
	//{
		//if song_script[this_tick] == this_tick + fall_ticks
		//   create arrow(s)

		//update position of arrows

		//check if 
	//},

//arrow class fields: 	direction, type, hit_tick, has_hit
}

var config = {
    type: Phaser.AUTO,
    width: 640,
    height: 640,
    scene: [ Boot, GonDDR ]
};

var game = new Phaser.Game(config);