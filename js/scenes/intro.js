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

		game.events.on('blur', function () {
			this.scene.pause();
		}, this);

		game.events.on('focus', function () {
		  this.scene.resume();
		}, this);

		this.init_sounds();

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
				delay: 500,
				ease: 'Linear',
				paused: true,
				callbackScope: this,
				onStart: function (tween, targets) {
					this.sounds.disc_buzz.play('', {"volume": 0.01});
				}
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

		this.transition_to_gonddr = function() {
			this.ggr_logo.visible = false;
        	this.scene.transition({
				target: 'gonddr',
				duration: 1200,
				moveBelow: true
			});
		}

		this.logo_fadein = this.tweens.add({
			targets: this.ggr_logo,
			alpha: 1,
			scaleX: 1,
			scaleY: 1,
			delay: 0,
			duration: 800,
			ease: 'Linear',
			paused: true,
			callbackScope: this,
			completeDelay: 2500,
			onStart: function (tween, targets) {
				this.sounds.voice_ggr.play();
			},
			onComplete: function (tween, targets) {
				do_checkerboard(this, this.transition_to_gonddr, this);
			}
		});

		this.input.keyboard.on('keydown_UP', function (event) {
			this.tweens.add({
				targets: this.press_start,
				alpha: 0,
				scaleX: 1.5,
				scaleY: 1.5,
				duration: 300,
				ease: 'Sine.easeInOut'
			});
			this.sounds.button_click.play();
		}, this);

	}

	init_sounds() {
		this.sounds = {
			"button_click": this.sound.add("button_click", 1),
			"disc_buzz": this.sound.add("disc_buzz", 1),
			"voice_ggr": this.sound.add("voice_ggr", 1)
		}
		this.sounds.button_click.on('ended', this.trigger_fadeout, this);
		this.sounds.disc_buzz.on('ended', this.trigger_fadein, this);
		this.sounds.voice_ggr.on('ended', this.trigger_checkerboard, this);
	}

	trigger_fadeout = () => {
		this.intro_fadeout.play();
	}

	trigger_fadein = () => {
		this.logo_fadein.play();
	}

	trigger_checkerboard = () => {
		//do_checkerboard(this, this.transition_to_gonddr, this);
	}
}

function do_checkerboard(_this, yoyo_func = null, yoyo_func_context = null) {

	var tiles = _this.add.group({ key: 'pink_tile', repeat: 99, setScale: { x: 0, y: 0 } });

    Phaser.Actions.GridAlign(tiles.getChildren(), {
        width: 10,
        cellWidth: 64,
        cellHeight: 64,
        x: 32,
        y: 32
    });

    var i = 0;
    var j = 0;

    tiles.children.iterate(function (child) {

    	let tween_params = {
            targets: child,
            scaleX: 1,
            scaleY: 1,
            //angle: 180,
            _ease: 'Sine.easeInOut',
            ease: 'Power2',
            duration: 500,
            delay: i * 50,
            repeat: 0,
            yoyo: true,
            hold: 300,
            onComplete: child.destroy
        }

        if (j==0) {

        	if (yoyo_func) {
	        	tween_params.onYoyo = yoyo_func;
	        	tween_params.onYoyoScope = yoyo_func_context;
        	}
        }

        let new_tween = _this.tweens.add(tween_params);

        i++;
        j++;
        if (i % 10 === 0) {i = 0;}
    })
}

PRESS_START_Y = 280;
PRESS_START_ZOOM = 0.8;
PRESS_START_PERIOD = 500;
