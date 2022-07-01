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

		this.arrows;
		this.song_script;
		this.gondola;
		this.combo;
		this.score;

		this.tps = 100;
		this.fall_ticks = 400;
		this.hit_window 
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