class PurpleWave {
    constructor (context, startup_duration, half_period) {
        this.context = context;

        this.half_period = this.half_period;
        this.num_steps = 22;

        this.start_color =  new Phaser.Display.Color(239, 85, 165);
        this.end_color =  new Phaser.Display.Color(88, 61, 205);

        this.rects = [];

        this.do_background();
    }
    
    do_background() {
        for (var i = 0; i < this.num_steps; i++) {
            this.rects[i] = this.context.add.image( -64, 0, 'pixel' );
            this.rects[i].scaleX = WINDOW_WIDTH/10 + 2; // Add margin of 2 to make sure rectangles properly overlap
            this.rects[i].scaleY = WINDOW_HEIGHT;
            this.rects[i].setOrigin(0,0);
            this.rects[i].tint = this.interpolate_color(i).color;
            this.rects[i].depth = -1;
            
            this.context.tweens.add({
                targets: this.rects[i],
                alpha: 1,
                duration: startup_duration,
                onComplete: this.rects[i].destroy
            })

            this.context.tweens.add({
                targets: this.rects[i],
                x: WINDOW_WIDTH,
                duration: half_period,
                delay: i*half_period/11.,
                yoyo: true,
                repeat: -1,
                ease: 'Linear'
            })
        }
    }

    interpolate_color (i) {
        let j = Math.abs(i - i/2.)
        let new_color = new Phaser.Display.Color(
            this.start_color.red + j*((this.end_color.red - this.start_color.red)/this.num_steps*2.),
            this.start_color.green + j*((this.end_color.green - this.start_color.green)/this.num_steps*2.),
            this.start_color.blue + j*((this.end_color.blue - this.start_color.blue)/this.num_steps*2.)
        );
        return new_color;
    }

    end (duration) {
        for (var i = 0; i < this.num_steps; i++) {
            this.context.tweens.add({
                targets: this.rects[i],
                alpha: 0,
                duration: duration,
                onComplete: this.rects[i].destroy
            })
        }
    }
}

class ColoredCircles {
    constructor (context, period) {
        this.context = context;
        this.period = period;
        this.num_steps = 4;

        this.start_color =  new Phaser.Display.Color(0, 234, 255);
        this.end_color =  new Phaser.Display.Color(255, 228, 0);
        
        this.ongoing = true;

        this.do_background();
    }

    do_background () {
        this.make_circle(0);
    }

    make_circle (idx) {
        let i = idx;
        if (i >= this.num_steps) {
            i = i%this.num_steps;
        }

        var circle = this.context.add.image(WINDOW_WIDTH/2.,
                                          WINDOW_HEIGHT/2.,'circle');
        circle.scaleX = 0.1;
        circle.scaleY = 0.1;
        circle.tint = this.interpolate_color(i).color;
        circle.depth = -1;

        this.context.tweens.add({
            targets: circle,
            scaleX: 3,
            scaleY: 3,
            alpha: 0.5,
            duration: this.period,
            callbackScope: this,
            onComplete: function () {
                if (this.ongoing) {
                    this.make_circle (i + 1);
                    circle.depth = -2;
                }
                this.context.tweens.add({
                    targets: circle,
                    scaleX: 6,
                    scaleY: 6,
                    alpha: 0,
                    duration: this.period,
                    onComplete: circle.destroy
                })
            }
        })
    }

    interpolate_color (i) {
        let new_color = new Phaser.Display.Color(
            this.start_color.red + i*((this.end_color.red - this.start_color.red)/(this.num_steps-1)),
            this.start_color.green + i*((this.end_color.green - this.start_color.green)/(this.num_steps-1)),
            this.start_color.blue + i*((this.end_color.blue - this.start_color.blue)/(this.num_steps-1))
        );
        return new_color;
    }

    end() {
        this.ongoing = false;
    }
}

class LightBeams {
    constructor (context, period, fade = true) {
        this.context = context;
        this.period = period;
        this.fade = fade;

        this.red = 0xFF0000;
        this.green = 0x00FF00;
        this.blue = 0x0000FF;

        this.red_beam;
        this.green_beam;
        this.blue_beam;

        this.ongoing = true;

        this.do_background();
    }

    do_background() {
        this.red_beam = this.make_beam(this.red, WINDOW_WIDTH/4.);
        this.red_beam.depth = -1;
        this.show_beam(this.red_beam);
        this.green_beam = this.make_beam(this.green, 2*WINDOW_WIDTH/4.);
        this.green_beam.depth = -1;
        this.show_beam(this.green_beam);
        this.blue_beam = this.make_beam(this.blue, 3*WINDOW_WIDTH/4.);
        this.blue_beam.depth = -1;
        this.show_beam(this.blue_beam);
    }

    show_beam(beam) {
        beam.angle = 30*Math.random() - 15;
        beam.alpha = 1;
        if (this.fade) {
            this.context.tweens.add({
                targets: beam,
                duration: this.period,
                alpha: 0,
                callbackScope: this,
                onComplete: function () {
                    if (this.ongoing) {
                        this.show_beam(beam);
                    }
                }
            });
        } else {
            this.context.tweens.add({
                targets: beam,
                duration: 1,
                alpha: 0,
                delay: this.period/2.,
                callbackScope: this,
                completeDelay: this.period/2.,
                onComplete: function () {
                    if (this.ongoing) {
                        this.show_beam(beam);
                    }
                }
            })
        }
    }

    make_beam(color, x) {
        let beam = this.context.add.image(x, -50,'beam');
        beam.tint = color;
        beam.setOrigin(undefined, 0);
        beam.alpha = 0.8;
        return beam;
    }

    end() {
        this.ongoing = false;
    }
}

class CheckerSpin {
    constructor (context, period) {
        this.context = context;
        this.period = period;
        this.bg = this.context.add.image(WINDOW_WIDTH/2., WINDOW_HEIGHT/2.,'blue_tile');
        this.bg.scaleX = 10;
        this.bg.scaleY = 10;
        this.bg.tint = 0x990099;
        this.bg.alpha = 0;
        this.bg.depth = -1;

        this.tiles = this.context.add.group({ key: 'blue_tile', repeat: 255, setScale: { x: 0, y: 0 } });
        Phaser.Actions.GridAlign(this.tiles.getChildren(), {
            width: 16,
            cellWidth: 40,
            cellHeight: 40,
            x: 0,
            y: 0
        });

        this.do_background();
    }

    do_background () {
        this.context.tweens.add({
            targets: this.bg,
            alpha: 1,
            duration: 500
        });

        var i = 0;
        var _this = this;
        this.tiles.children.iterate(function (child) {
            child.depth = -1;
            child.alpha = 0.6;
            _this.context.tweens.add({
                targets: child,
                scaleX: .45,
                scaleY: .45,
                angle: 90,
                duration: _this.period/3.2,
                delay: i * _this.period/16.,
                ease: 'Sine.easeInOut',
                repeat: -1,
                yoyo: true
            });
            i++;
            if (i % 14 === 0) {i = 0;}
        });
    }

    end () {
        let _this = this;
        this.tiles.children.iterate(function (child) {
            _this.context.tweens.add({
                targets: child,
                alpha: 0,
                duration: 500,
                onComplete: child.destroy
            })
        });
        this.context.tweens.add({
            targets: this.bg,
            alpha: 0,
            duration: 500,
            onComplete: this.bg.destroy
        });
    }
}