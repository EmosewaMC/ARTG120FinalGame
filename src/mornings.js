class Intro extends Phaser.Scene {
	constructor() {
		super("Intro");
	}

	preload() { }

	create() {
		this.add.text(960, 540, "Loading game...", {
			font: "bold 100px Arial",
			fill: "#fff",
			align: "center"
		}).setOrigin(0.5);

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
