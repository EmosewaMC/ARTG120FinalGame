const maxEnergy = 100;

function registerInputHandlers(scene) {
	scene.wKey = scene.input.keyboard.addKey('W');
	scene.aKey = scene.input.keyboard.addKey('A');
	scene.sKey = scene.input.keyboard.addKey('S');
	scene.dKey = scene.input.keyboard.addKey('D');
	scene.fKey = scene.input.keyboard.addKey('F');
}

function getLeftAlign(energy) {
	return 300 - (maxEnergy - energy) * 1.5;
}

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
			this.scene.start("Overworld", {
				energy: maxEnergy
			});
		});
	}
}

class Overworld extends Phaser.Scene {
	constructor() {
		super("Overworld");
	}

	init(data) {
		this.playerEnergy = data.energy;
	}

	preload() {
		this.load.image("Player", "assets/PlayerSprite.png");
	}

	create() {
		registerInputHandlers(this);
		this.maxVelocity = 300;
		this.player = this.physics.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, "Player")
			.setScale(0.5)
			.setCollideWorldBounds(true)
			.setMaxVelocity(this.maxVelocity, this.maxVelocity);
		this.interactables = [];
		this.interactables.push(this.physics.add.sprite(this.cameras.main.centerX + 100, this.cameras.main.centerY + 100, "Player")
			.setScale(0.5)
			.setImmovable(true));
		// push 5 more at random positions
		for (let i = 0; i < 5; i++) {
			this.interactables.push(this.physics.add.sprite(Math.random() * this.cameras.main.width, Math.random() * this.cameras.main.height, "Player")
				.setScale(0.5)
				.setImmovable(true));
		}
		// Fill a rectangle in the top left corner with a white border and green fill to represent the player's energy
		

		this.interactText = this.add.text(100, 100, "Press F to pay respects", {
			font: "100px Arial",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 5,
			align: "center"
		}).setAlpha(0);

		this.physics.add.overlap(this.player, this.interactables, () => {
			if (this.fKey.isDown) {
				this.scene.start("BattleScene", {
					energy: this.playerEnergy
				});
			}
		});

		this.energyBox = this.add.rectangle(getLeftAlign(this.playerEnergy), 100, this.playerEnergy * 3, 100, 0x00FF00, 1);
		this.outline = this.add.rectangle(300, 100, maxEnergy * 3, 100, 0x000000, 0).setStrokeStyle(5, 0xffffff, 1);
	}

	update(time, delta) {
		// Check if the player is intersecting with the interactables and if they are display a message to interact
		if (this.physics.overlap(this.player, this.interactables)) {
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

	init(data) {
		this.playerEnergy = data.energy;
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
			this.scene.start("Overworld", {
				energy: this.playerEnergy - 10
			});
		});

		this.runText = this.add.text(400, 925, "Run", {
			font: "75px Arial",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 5
		}).setInteractive().on("pointerdown", () => {
			this.scene.start("Overworld", {
				energy: this.playerEnergy
			});
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
