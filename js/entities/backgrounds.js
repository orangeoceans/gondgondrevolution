class PurpleWave {
    constructor (context, startup_duration, half_period) {
        this._this = context;

        this.half_period = this.half_period;
        this.num_steps = 22;

        this.start_color =  new Phaser.Display.Color(239, 85, 165);
        this.end_color =  new Phaser.Display.Color(88, 61, 205);

        this.rects = [];

        this.do_background();
    }
    
    do_background() {
        for (var i = 0; i < this.num_steps; i++) {
            this.rects[i] = this._this.add.image( -64, 0, 'pixel' );
            this.rects[i].scaleX = WINDOW_WIDTH/10 + 2; // Add margin of 2 to make sure rectangles properly overlap
            this.rects[i].scaleY = WINDOW_HEIGHT;
            this.rects[i].setOrigin(0,0);
            this.rects[i].tint = this.interpolate_color(i).color;
            this.rects[i].depth = -1;
            
            this._this.tweens.add({
                targets: this.rects[i],
                alpha: 1,
                duration: startup_duration,
                onComplete: this.rects[i].destroy
            })

            this._this.tweens.add({
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
            this._this.tweens.add({
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
        this._this = context;
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

        var circle = this._this.add.image(WINDOW_WIDTH/2.,
                                          WINDOW_HEIGHT/2.,'circle');
        circle.scaleX = 0.1;
        circle.scaleY = 0.1;
        circle.tint = this.interpolate_color(i).color;
        circle.depth = -1;

        this._this.tweens.add({
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
                this._this.tweens.add({
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
        this._this = context;
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
        this._this.tweens.add({
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
    }

    make_beam(color, x) {
        let beam = this._this.add.image(x, -50,'beam');
        beam.tint = color;
        beam.setOrigin(undefined, 0);
        beam.alpha = 0.8;
        return beam;
    }

    end() {
        this.ongoing = false;
    }
}