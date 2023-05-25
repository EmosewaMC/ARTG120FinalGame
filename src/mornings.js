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
		this.player = this.physics.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, "Player")
			.setScale(0.5)
			.setCollideWorldBounds(true)
			.setMaxVelocity(this.maxVelocity, this.maxVelocity);
		this.interactable = this.physics.add.sprite(this.cameras.main.centerX + 100, this.cameras.main.centerY + 100, "Player")
			.setScale(0.5)
			.setImmovable(true);

		this.interactText = this.add.text(100, 100, "Press F to pay respects", {
			font: "100px Arial",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 5,
			align: "center"
		}).setAlpha(0);

		this.physics.add.overlap(this.player, this.interactable, () => {
			if (this.fKey.isDown) {
				this.scene.start("BattleScene");
			}
		});

		this.wKey = this.input.keyboard.addKey('W');
		this.aKey = this.input.keyboard.addKey('A');
		this.sKey = this.input.keyboard.addKey('S');
		this.dKey = this.input.keyboard.addKey('D');
		this.fKey = this.input.keyboard.addKey('F');
	}

	update(time, delta) {
		// Check if the player is intersecting with the interactable
		if (this.physics.overlap(this.player, this.interactable)) {
			this.interactText.setAlpha(1);
		} else {
			this.interactText.setAlpha(0);
		}
		let velocity = { x: 0, y: 0 };
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

class BattleScene extends Phaser.Scene {
	constructor() {
		super("BattleScene");
	}

	preload() { }

	create() {
		this.add.text(100, 100, "Battle Scene", {
			font: "100px Arial",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 5
		});
		this.topRightGoon = this.physics.add.sprite(this.cameras.main.centerX + 200, this.cameras.main.centerY - 200, "Player")
			.setImmovable(true)
			.setScale(2.5)
			.setFlipX(true);

		this.middleLeftGoon = this.physics.add.sprite(this.cameras.main.centerX - 400, this.cameras.main.centerY + 100, "Player")
			.setImmovable(true)
			.setScale(2.5);

		this.playText = this.add.text(100, 800, "Pick a move", {
			font: "100px Arial",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 5
		});

		this.punchText = this.add.text(100, 925, "Punch", {
			font: "75px Arial",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 5
		}).setInteractive().on("pointerdown", () => {
			this.scene.start("Overworld");
		});

		this.runText = this.add.text(400, 925, "Run", {
			font: "75px Arial",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 5
		});

		this.moveBox = this.add.rectangle(this.cameras.main.centerX, 925, 1390, 300, 0x000000, 0)
			.setStrokeStyle(5, 0xffffff, 1);
	}

	update(time, delta) { }
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
	scene: [Intro, Overworld, BattleScene],
	title: "Mornings",
});
