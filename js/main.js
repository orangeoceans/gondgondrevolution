var config = {
    type: Phaser.AUTO,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    scene: [ Boot, Intro, GonDDR, Endscreen ]
};

var game = new Phaser.Game(config);
