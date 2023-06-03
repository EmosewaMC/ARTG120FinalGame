const maxEnergy = 100;
const StartTime = 7; // 8am

class SceneLoader extends Phaser.Scene {
	preloadImage(image) {
		this.load.image(image, "assets/" + image + ".png");
	}

	preloadAnimation(image) {
		this.load.image(image, "assets/animations/" + image + ".png");
	}

	preload() {
		// cache all images
		this.preloadImage("BackIdle");
		this.preloadImage("Backpack");
		this.preloadImage("Door");
		this.preloadImage("FrontIdle");
		this.preloadImage("Opening");
		this.preloadImage("PlayerSprite");
		this.preloadImage("SideIdle");

		// cache all animations
		this.preloadAnimation("BackWalk1");
		this.preloadAnimation("BackWalk2");
		this.preloadAnimation("FrontWalk1");
		this.preloadAnimation("FrontWalk2");
		this.preloadAnimation("SideWalk1");
		this.preloadAnimation("SideWalk2");
	}
}

function hoursToMinutes(time) {
	return time * 60;
}

function timeToText(time) {
	time = Math.floor(time % (24 * 60)); // Normalize to 24 hours
	let hours = (Math.floor(time / 60) % 12) + 1;
	let minutes = Math.floor(time % 60);
	// Make sure there is zero apdding
	if (hours < 10) {
		hours = "0" + hours;
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	return hours + ":" + minutes + (Math.floor(time / 60) < 11 ? "am" : "pm");
}

function registerInputHandlers(scene) {
	scene.wKey = scene.input.keyboard.addKey('W');
	scene.aKey = scene.input.keyboard.addKey('A');
	scene.sKey = scene.input.keyboard.addKey('S');
	scene.dKey = scene.input.keyboard.addKey('D');
	scene.fKey = scene.input.keyboard.addKey('F');
}

function getLeftAlign(energy) {
	return maxEnergy * 3 - (maxEnergy - energy) * 1.5;
}

class Intro extends SceneLoader {
	constructor() {
		super("Intro");
	}

	create() {
		this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "Opening").setScale(1.86);
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
				energy: maxEnergy,
				time: hoursToMinutes(StartTime)
			});
		});
	}
}

class Overworld extends SceneLoader {
	constructor() {
		super("Overworld");
	}
	runTime(time, delta) {
		this.time += delta / 1000;
		this.timeText.setText("Time: " + timeToText(this.time));
		// Check if the player is intersecting with the interactables and if they are display a message to interact
		if (this.physics.overlap(this.player, this.interactables)) {
			this.interactText.setAlpha(1);
		} else {
			this.interactText.setAlpha(0);
		}
	}
	runInteractables(time, delta) {
		if (this.physics.overlap(this.player, this.interactables)) {
			if (!this.textActive && this.canReleaseText && this.fKey.isDown) {
				this.canReleaseText = false;
				this.textActive = true;
				this.playerEnergy -= 1;
				this.activeText = this.add.text(this.player.x, this.player.y, "You have interacted", {
					font: "50px Arial",
					fill: "#ff0000",
					stroke: "#000000",
					strokeThickness: 5,
					align: "center"
				});
			} else if (this.textActive && this.canReleaseText && this.fKey.isDown) {
				this.textActive = false;
				this.canReleaseText = false;
				if (this.activeText != undefined) {
					this.activeText.destroy();
				}
			}
		} else {
			this.textActive = false;
			if (this.activeText != undefined) {
				this.activeText.destroy();
			}
		}
		if (this.activeText != undefined) {
			this.activeText.x = this.player.x;
			this.activeText.y = this.player.y;
		}
	}

	runInput(time, delta) {
		let velocity = { x: 0, y: 0 };
		let movingAsset = "";
		let flip = false;
		if (this.wKey.isDown) { // Going up
			velocity.y -= this.maxVelocity;
			this.idleAsset = "BackIdle";
			movingAsset = "BackWalk";
		}
		if (this.aKey.isDown) { // Going left
			velocity.x -= this.maxVelocity;
			this.idleAsset = "SideIdle";
			movingAsset = "SideWalk";
			flip = true;
		}
		if (this.sKey.isDown) { // Going down
			velocity.y += this.maxVelocity;
			this.idleAsset = "FrontIdle";
			movingAsset = "FrontWalk";
		}
		if (this.dKey.isDown) { // Going right
			velocity.x += this.maxVelocity;
			this.idleAsset = "SideIdle";
			movingAsset = "SideWalk";
		}
		if (!this.fKey.isDown) {
			this.canReleaseText = true;
		}

		this.player.setVelocity(velocity.x, velocity.y);
		if (velocity.x != 0 || velocity.y != 0) {
			if (movingAsset != "" && this.framesWithPreviousAsset > 16) {
				if (this.movingFrames >= 4) this.movingFrames = 0;
				this.movingFrames++;
				if (this.movingFrames % 2 == 1) {
					movingAsset = this.idleAsset;
				} else {
					movingAsset = movingAsset + (this.movingFrames / 2);
				}
				this.player.setTexture(movingAsset);
				// flip the above texture if needed
				this.player.flipX = flip;
				this.framesWithPreviousAsset = 0;
			} else {
				this.framesWithPreviousAsset++;
			}
		} else {
			this.framesWithPreviousAsset = 0;
			this.movingFrames = 0;
			this.player.setTexture(this.idleAsset);
		}
	}

	createInteractable(x, y, asset) {
		this.interactables.push(this.physics.add.sprite(x, y, asset)
			.setScale(0.5)
			.setImmovable(true));
	}

	init(data) {
		this.playerEnergy = data.energy;
		this.time = data.time;
		this.textActive = false;
		this.canReleaseText = true;
		this.activeText = undefined;
		this.framesWithPreviousAsset = 0;
		this.idleAsset = "FrontIdle";
		this.movingFrames = 0;
	}

	create() {
		this.background = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "Opening").setScale(1.86);
		registerInputHandlers(this);
		this.maxVelocity = 300;
		this.player = this.physics.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, this.idleAsset)
			.setScale(2.0)
			.setCollideWorldBounds(true)
			.setMaxVelocity(this.maxVelocity, this.maxVelocity);
		this.interactables = [];
		this.interactables.push(this.physics.add.sprite(this.cameras.main.centerX + 100, this.cameras.main.centerY + 100, "FrontIdle")
			.setScale(0.75)
			.setImmovable(true));
		this.interactables = [];
		// push 5 more at random positions
		for (let i = 0; i < 5; i++) {
			this.interactables.push(this.physics.add.sprite(Math.random() * this.cameras.main.width, Math.random() * this.cameras.main.height, "FrontIdle")
				.setScale(0.5)
				.setImmovable(true));
		}
		// Fill a rectangle in the top left corner with a white border and green fill to represent the player's energy


		this.interactText = this.add.text(100, 900, "Press F to pay respects", {
			font: "100px Arial",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 5,
			align: "center"
		}).setAlpha(0);

		this.physics.add.overlap(this.player, this.interactables, () => {
			if (this.fKey.isDown) {
				this.scene.start("BattleScene", {
					energy: this.playerEnergy,
					time: this.time
				});
			}
		});

		this.energyBox = this.add.rectangle(getLeftAlign(this.playerEnergy), 100, this.playerEnergy * 3, 100, 0x00FF00, 1);
		this.outline = this.add.rectangle(maxEnergy * 3, 100, maxEnergy * 3, 100, 0x000000, 0).setStrokeStyle(5, 0xffffff, 1);
		this.timeText = this.add.text(125, 175, "Time:         " + this.time, {
			font: "50px Arial",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 5,
			align: "left"
		});
		this.physics.add.collider(this.player, this.physics.add.existing(this.outline, true));
		this.physics.add.collider(this.player, this.physics.add.existing(this.timeText, true));
	}

	update(time, delta) {
		this.runTime(time, delta);
		this.runInteractables(time, delta);
		this.runInput(time, delta);
	}
}

class BattleScene extends SceneLoader {
	constructor() {
		super("BattleScene");
	}

	init(data) {
		this.playerEnergy = data.energy;
		this.time = data.time;
	}

	create() {
		this.showingNoEnergy = false;
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
			if (this.playerEnergy >= 10) {
				this.scene.start("Overworld", {
					energy: this.playerEnergy - 10,
					time: this.time
				});
			} else {
				if (!this.showingNoEnergy) {
					this.showingNoEnergy = true;
					this.playText.setText("Not enough energy");
					// Add a timer to change the text back after 1 second
					this.tweens.add({
						targets: this.playText,
						alpha: 1,
						duration: 1000,
						ease: "Linear",
						repeat: 0,
						yoyo: false,
						onComplete: () => {
							this.playText.setText("Pick a move");
							this.showingNoEnergy = false;
						}
					});
				}
			}
		});

		this.runText = this.add.text(400, 925, "Run", {
			font: "75px Arial",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 5
		}).setInteractive().on("pointerdown", () => {
			this.scene.start("Overworld", {
				energy: this.playerEnergy,
				time: this.time
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
			gravity: {
				x: 0,
				y: 0
			}
		}
	},
	scene: [Intro, Overworld, BattleScene],
	title: "Mornings",
});
