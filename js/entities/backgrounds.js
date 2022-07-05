class PurpleWave {
    constructor (context, duration, half_period) {
        this._this = context;

        this.half_period = this.half_period;
        this.num_steps = 22;

        this.start_color =  new Phaser.Display.Color(239, 85, 165);
        this.end_color =  new Phaser.Display.Color(88, 61, 205);

        this.rects = [];
        for (var i = 0; i < this.num_steps; i++) {
            this.rects[i] = this._this.add.image( -64, 0, 'pixel' );
            this.rects[i].scaleX = WINDOW_WIDTH/10;
            this.rects[i].scaleY = WINDOW_HEIGHT;
            this.rects[i].setOrigin(0,0);
            this.rects[i].tint = this.interpolate_color(i).color;
            //this.rects[i].alpha = 0;
            
            this._this.tweens.add({
                targets: this.rects[i],
                alpha: 1,
                duration: duration,
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

    interpolate_color (i) {
        let j = Math.abs(i - i/2.)
        let new_color = new Phaser.Display.Color(
            this.start_color.red + j*((this.end_color.red - this.start_color.red)/this.num_steps*2.),
            this.start_color.green + j*((this.end_color.green - this.start_color.green)/this.num_steps*2.),
            this.start_color.blue + j*((this.end_color.blue - this.start_color.blue)/this.num_steps*2.)
        );
        return new_color;
    }
}