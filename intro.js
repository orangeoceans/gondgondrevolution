class Intro extends Phaser.Scene {

	constructor() {
		super('intro');

		this.black_bg;
		this.intro_bg;
		this.ggr_logo;
		this.press_start;
		this.intro_fadeout;
		this.logo_fadein;
	}


	create() {
		this.intro_bg = this.add.sprite(WINDOW_WIDTH/2., WINDOW_HEIGHT/2., 'intro_bg', 0);
		this.anims.create({
			key: 'gondola_blink',
			frames: this.anims.generateFrameNumbers('intro_bg', { frames: [ 1, 0, 1, 0 ] }),
			frameRate: 10,
			repeat: -1,
			repeatDelay: 3000
		});
		this.intro_bg.play('gondola_blink');
		this.intro_fadeout = this.tweens.add({
				targets: this.intro_bg,
				alpha: 0,
				scaleX: 1.5,
				scaleY: 1.5,
				duration: 800,
				delay: 100,
				ease: 'Linear',
				paused: true
		});

		this.press_start = this.add.image(WINDOW_WIDTH/2., PRESS_START_Y, 'press_start');
		this.tweens.add({
			targets: this.press_start,
			scaleX: PRESS_START_ZOOM,
			scaleY: PRESS_START_ZOOM,
			ease: 'Sine.easeInOut',
			duration: PRESS_START_PERIOD,
			repeat: -1,
			yoyo: true
		});

		this.ggr_logo = this.add.image(WINDOW_WIDTH/2., WINDOW_HEIGHT/2., 'ggr_logo');
		this.ggr_logo.alpha = 0;
		this.ggr_logo.scaleX = 3;
		this.ggr_logo.scaleY = 0;
		this.logo_fadein = this.tweens.add({
				targets: this.ggr_logo,
				alpha: 1,
				scaleX: 1,
				scaleY: 1,
				delay: 350,
				duration: 800,
				ease: 'Linear',
				paused: true,
				callbackScope: this,
				completeDelay: 2000,
				onComplete: function (tween, targets) { this.do_checkerboard(); }
		});
		
		this.input.keyboard.on('keydown_UP', function (event) {
			this.tweens.add({
				targets: this.press_start,
				alpha: 0,
				scaleX: 1.5,
				scaleY: 1.5,
				duration: 300,
				ease: 'Linear'
			});
			this.intro_fadeout.play();
			this.logo_fadein.play();
		}, this);

	}

	do_checkerboard() {
		var tiles = this.add.group({ key: 'pink_tile', repeat: 99, setScale: { x: 0, y: 0 } });

	    Phaser.Actions.GridAlign(tiles.getChildren(), {
	        width: 10,
	        cellWidth: 64,
	        cellHeight: 64,
	        x: 32,
	        y: 32
	    });

	    var _this = this;
	    var i = 0;
	    var j = 0;

	    tiles.children.iterate(function (child) {

	    	let tween_params = {
	            targets: child,
	            scaleX: 1,
	            scaleY: 1,
	            angle: 180,
	            _ease: 'Sine.easeInOut',
	            ease: 'Power2',
	            duration: 500,
	            delay: i * 50,
	            repeat: 0,
	            yoyo: true,
	            hold: 300,
	        }

	        if (j==0) {
	        	console.log(j);
	        	tween_params.onYoyo = function (tween, targets) {
	            	_this.ggr_logo.visible = false;
	            	_this.scene.transition({
						target: 'gonddr',
						duration: 1200,					
						moveBelow: true
					});
	            }
	        }

	        let new_tween = _this.tweens.add(tween_params);

	        i++;
	        j++;
	        if (i % 10 === 0) {i = 0;}
	    })
	}
}

PRESS_START_Y = 280;
PRESS_START_ZOOM = 0.8;
PRESS_START_PERIOD = 500;