class Boot extends Phaser.Scene {

	constructor () {
		super('boot');
	}


	init () {
		let element = document.createElement('style');
		document.head.appendChild(element);
	}

	// Preload assets from disk
	preload () {
		this.load.spritesheet('intro_bg', 'assets/intro_bg.png', {frameWidth: WINDOW_WIDTH, frameHeight: WINDOW_HEIGHT});

		this.load.spritesheet('arrows', 'assets/arrows.png', {frameWidth: ARROW_SIZE, frameHeight: ARROW_SIZE});
		this.load.spritesheet('hit_frame', 'assets/hit_frame.png', {frameWidth: ARROW_SIZE, frameHeight: ARROW_SIZE});
		this.load.spritesheet('gondola', 'assets/gondancin.png', {frameWidth: GONDOLA_WIDTH, frameHeight: GONDOLA_HEIGHT})

		this.load.image('press_start', 'assets/press_start.png');
		this.load.image('ggr_logo', 'assets/ggr_logo.png');
		this.load.image('pink_tile', 'assets/pink_tile.png');
		this.load.image('black_bg', 'assets/black_bg.png');
		this.load.image('dance_pad', 'assets/dance_pad.png');
		this.load.image('pixel', 'assets/pixel.png');
		this.load.image('song_title_blue', 'assets/song_title_blue.png');
		this.load.image('song_title_pink', 'assets/song_title_pink.png');
		this.load.image('ready', 'assets/ready.png');
		this.load.image('gondola_go', 'assets/gondola_go.png');

		this.load.image('hit_perfect', 'assets/hit_perfect.png');
		this.load.image('hit_great', 'assets/hit_great.png');
		this.load.image('hit_ok', 'assets/hit_ok.png');
		this.load.image('hit_poor', 'assets/hit_poor.png');
		this.load.image('hit_bad', 'assets/hit_bad.png');
		this.load.image('hit_miss', 'assets/hit_miss.png');
		this.load.image('combo', 'assets/combo.png');

		this.load.audio('button_click', ['assets/sfx/button_click_001.wav']);
		this.load.audio('disc_buzz', ['assets/sfx/disc_buzz_002.wav']);
		this.load.audio('voice_ggr', ['assets/sfx/voice_ggr_003.wav']);
		this.load.audio('voice_ready', ['assets/sfx/voice_ready_001.wav']);
		this.load.audio('voice_gondola', ['assets/sfx/voice_gondola_001.wav']);
		this.load.audio('cheer', ['assets/sfx/cheer.mp3']);
		
		this.load.audio('wu_wei', ['assets/bgm/wu_wei.mp3']);

		this.load.json('testdance', 'testdance.json');
	}


	create () {
		let scene = this.scene;
		// Start the actual game!
		scene.start('intro');
	}

}
