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
		this.load.spritesheet('intro_bg', 'assets/sprites/intro/intro_bg.png', {frameWidth: WINDOW_WIDTH, frameHeight: WINDOW_HEIGHT});

		this.load.spritesheet('arrows', 'assets/sprites/gonddr/arrows.png', {frameWidth: ARROW_SIZE, frameHeight: ARROW_SIZE});
		this.load.spritesheet('guide_arrows', 'assets/sprites/gonddr/guide_arrows.png', {frameWidth: ARROW_SIZE, frameHeight: ARROW_SIZE});
		this.load.spritesheet('hit_frame', 'assets/sprites/gonddr/hit_frame_long.png', {frameWidth: ARROW_SIZE*15, frameHeight: ARROW_SIZE});
		this.load.spritesheet('gondola', 'assets/sprites/gonddr/gondancin.png', {frameWidth: GONDOLA_WIDTH, frameHeight: GONDOLA_HEIGHT})

		this.load.image('press_start', 'assets/sprites/shared/press_start.png');
		this.load.image('press_restart', 'assets/sprites/shared/press_restart.png');
		this.load.image('ggr_logo', 'assets/sprites/shared/ggr_logo.png');

		this.load.image('soundcloud', 'assets/sprites/intro/soundcloud.png');
		this.load.image('read_gdlq', 'assets/sprites/intro/read_gdlq.png')

		this.load.image('dance_pad', 'assets/sprites/gonddr/dance_pad.png');
		this.load.image('arrow_beam', 'assets/sprites/gonddr/arrow_beam.png');
		this.load.image('song_title_blue', 'assets/sprites/gonddr/song_title.png');
		this.load.image('song_title_pink', 'assets/sprites/gonddr/song_title.png');
		this.load.image('ready', 'assets/sprites/gonddr/ready.png');
		this.load.image('gondola_go', 'assets/sprites/gonddr/gondola_go.png');
		this.load.image('gondola_bg', 'assets/sprites/gonddr/gondola_bg.png');

		this.load.image('pink_tile', 'assets/sprites/shared/pink_tile.png');
		this.load.image('blue_tile', 'assets/sprites/shared/blue_tile.png');
		this.load.image('black_bg', 'assets/sprites/shared/black_bg.png');
		this.load.image('pixel', 'assets/sprites/shared/pixel.png');

		this.load.image('circle', 'assets/sprites/gonddr/circle.png');
		this.load.image('beam', 'assets/sprites/gonddr/beam.png');

		this.load.image('hit_perfect', 'assets/sprites/gonddr/hit_perfect.png');
		this.load.image('hit_great', 'assets/sprites/gonddr/hit_great.png');
		this.load.image('hit_ok', 'assets/sprites/gonddr/hit_ok.png');
		this.load.image('hit_poor', 'assets/sprites/gonddr/hit_poor.png');
		this.load.image('hit_bad', 'assets/sprites/gonddr/hit_bad.png');
		this.load.image('hit_miss', 'assets/sprites/gonddr/hit_miss.png');
		this.load.image('combo', 'assets/sprites/gonddr/combo.png');

		this.load.audio('button_click', ['assets/sfx/button_click_002.mp3']);
		this.load.audio('disc_buzz', ['assets/sfx/disc_buzz_003.wav']);
		this.load.audio('voice_ggr', ['assets/sfx/voice_ggr_003.wav']);
		this.load.audio('voice_ready', ['assets/sfx/voice_ready_001.wav']);
		this.load.audio('voice_gondola', ['assets/sfx/voice_gondola_001.wav']);
		this.load.audio('cheer', ['assets/sfx/cheer.mp3']);

		this.load.bitmapFont('scorefont', 'assets/fonts/scorefont_0.png', 'assets/fonts/scorefont.xml');

		this.load.audio('wu_wei', ['assets/bgm/wu_wei.mp3']);

		this.load.video('crater', 'assets/video/crater.mp4');
		this.load.video('glitch', 'assets/video/glitch.mp4');

		this.load.json('wuwei', 'wuwei.json');
	}


	create () {
		let scene = this.scene;
		// Start the actual game!
		scene.start('intro');
	}

}
