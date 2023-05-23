class Intro extends Phaser.Scene {
	constructor() {
		super("Intro");
	}

	preload() {
		this.load.image("Opening", "assets/Opening.png");
	}

	create() {
		this.add.image(960, 540, "Opening");
		this.input.once("pointerdown", () => {
			this.scene.start("Game");
		});
	}
}

const game = new Phaser.Game({
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 1920,
		height: 1080
	},
	physics: {
		default: 'arcade',
		arcade: {
			debug: true,
			gravity: {
				x: 0,
				y: 0
			}
		}
	},
	scene: [Intro],
	title: "Mornings",
});
