class Boot extends Phaser.Scene {

	constructor () {
		super('boot');
	}

	init ()
	{
		Let element = document.createElement('style')

		document.head.appendChild(element);

		element.sheet.insertRule() //TODO
	}

	preload ()
	{
		//TODO
	}

	create ()
	{

		Let scene = this.scene;

		WebFont.load({
			custom: {
				families: [ 'bebas' ]
			},
			active: function ()
			{
				scene.start('gonddr')
			}
		})

	}

}

class GonDDR extends Phaser.Scene {

	constructor ()
	{
		super('game');

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

	init ()
	{

	}

	preload: function()
	{
		//TODO
	},


	create: function()
	{

		this.input.on('', function () {


		}, this)


	},


	read_song_file: function()
	{
		//TODO
	},

	update_arrows: function(this_tick)
	{
		//if song_script[this_tick] == this_tick + fall_ticks
		//   create arrow(s)

		//update position of arrows

		//check if 
	},




//arrow class fields: 	direction, type, hit_tick, has_hit



}