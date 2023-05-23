class Intro extends Phaser.Scene {
	constructor() {
		super("Intro");
	}

	preload() {
		this.load.image("Opening", "assets/Opening.png");
	}

	create() {
		this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "Opening").setScale(2.70);
		this.add.text(100, 100, "Mornings", {
			font: "100px Arial",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 5
		});
		this.add.text(425, this.cameras.main.centerY, "Click to start", {
			font: "100px Arial",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 5,
			align: "left"
			});
		this.input.once("pointerdown", () => {
			this.scene.start("Overworld");
		});
	}
}

class Overworld extends Phaser.Scene {
	constructor() {
		super("Overworld");
	}

	preload() {
		this.load.image("Player", "assets/PlayerSprite.png");
	}

	create() {
		this.maxVelocity = 300;
		this.player = this.physics.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, "Player").setScale(0.5).setCollideWorldBounds(true).setMaxVelocity(this.maxVelocity, this.maxVelocity);
		// add listeners for w a s d keys
		this.wKey = this.input.keyboard.addKey('W');
		this.aKey = this.input.keyboard.addKey('A');
		this.sKey = this.input.keyboard.addKey('S');
		this.dKey = this.input.keyboard.addKey('D');
	}

	update(time, delta) {
		let velocity = {x: 0, y: 0};
		if (this.wKey.isDown) {
			velocity.y -= this.maxVelocity;
		}
		if (this.aKey.isDown) {
			velocity.x -= this.maxVelocity;
		}
		if (this.sKey.isDown) {
			velocity.y += this.maxVelocity;
		}
		if (this.dKey.isDown) {
			velocity.x += this.maxVelocity;
		}
		this.player.setVelocity(velocity.x, velocity.y);
		if (velocity.x != 0 || velocity.y != 0) {
			this.player.setAngle(Math.atan2(velocity.y, velocity.x) * 180 / Math.PI);
		}
	}
}

const game = new Phaser.Game({
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 1400,
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
	scene: [Intro, Overworld],
	title: "Mornings",
});
