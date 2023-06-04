const maxEnergy = 100;
const StartTime = 7; // 8am
const EndTime = 12; // 1pm

const LowTime = 0.25; // 15 minutes
const MediumTime = 0.5; // 30 minutes
const HighTime = 1; // 1 hour

const LowEnergy = 5;
const MediumEnergy = 10;
const HighEnergy = 15;

const Debug = false;

Seed = Math.random();

usedinteractables = {
	"Phone": false,
	"Backpack": false,
	"Closet": false,
	"Dog": false,
	"Medicine": false,
	"WaterCups": false
};

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
		this.preloadImage("Platform");
		this.preloadImage("ProtagonistBattleSprite");
		this.preloadImage("Sparkle");
		this.preloadImage("Dog");
		this.preloadImage("Phone");

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

function getLeftAlign(energy) {
	return maxEnergy * 3 - (maxEnergy - energy) * 1.5;
}

class Intro extends SceneLoader {
	constructor() {
		super("Intro");
	}

	create() {
		Seed = Math.random();
		this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "Opening").setScale(1.86);
		this.add.text(100, 100, "Mornings", {
			font: "100px Arial",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 5
		});
		this.add.text(225, this.cameras.main.centerY, "Press anything to start", {
			font: "100px Arial",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 5,
			align: "left"
		});
		this.input.once("pointerdown", () => {
			this.scene.start("Sleeping", {
				energy: maxEnergy,
				time: hoursToMinutes(StartTime)
			});
		});
		// if any key is pressed, start the game
		this.input.keyboard.on("keydown", () => {
			this.scene.start("Sleeping", {
				energy: maxEnergy,
				time: hoursToMinutes(StartTime)
			});
		});
	}
}

class Sleeping extends SceneLoader {
	constructor() {
		super("Sleeping");
	}

	init(data) {
		this.playerEnergy = data.energy;
		this.time = data.time;
	}

	create() {
		this.moveBox = this.add.rectangle(this.cameras.main.centerX, 975, 1390, 200, 0x000000, 0.5).setStrokeStyle(5, 0xFFFFFF, 1).setAlpha(1);
		this.activeText = this.add.text(40, 500, "You stayed up late last night watching random Yootoob videos and now you can barely open your eyes. You remember writing a list of things to do before you go to class… If you want to get to class on time, or even at all, you should get up now.", {
			font: "40px Arial",
			fill: "#FFFFFF",
			stroke: "#000000",
			strokeThickness: 5,
			align: "center"
		}).setWordWrapWidth(1300);
		// We only plan to have 2 actions to take
		this.leftAction = this.add.text(140, 950, "Wake up", {
			font: "75px Arial",
			fill: "#FFFFFF",
			stroke: "#000000",
			strokeThickness: 5,
			align: "center"
		});
		this.rightAction = this.add.text(740, 950, "Sleep more", {
			font: "75px Arial",
			fill: "#FFFFFF",
			stroke: "#000000",
			strokeThickness: 5,
			align: "center"
		}).setAlpha(0.5);
		this.usedTextItem = 1;
		this.registerInputHandlers();
		this.releasedKey = true;
	}

	registerInputHandlers() {
		this.aKey = this.input.keyboard.addKey('A');
		this.dKey = this.input.keyboard.addKey('D');
		this.fKey = this.input.keyboard.addKey('F');
	}

	update() {
		if ((this.aKey.isDown || this.dKey.isDown) && this.releasedKey) {
			this.releasedKey = false;
			this.usedTextItem++;
		}
		if (!(this.aKey.isDown || this.dKey.isDown || this.fKey.isDown)) {
			this.releasedKey = true;
		}
		if (this.usedTextItem % 2 == 1) {
			this.leftAction.setAlpha(1);
			this.rightAction.setAlpha(0.5);
		} else {
			this.leftAction.setAlpha(0.5);
			this.rightAction.setAlpha(1);
		}
		if (this.fKey.isDown && this.releasedKey) {
			this.releasedKey = false;
			if (this.usedTextItem % 2 == 1) {
				this.time += hoursToMinutes(LowTime);
				if (this.time >= hoursToMinutes(EndTime)) {
					console.log("You have lost");
					this.scene.start("Intro");
				}
			} else {
				this.scene.start("Overworld", {
					energy: this.playerEnergy,
					time: this.time,
					playerX: 158.25,
					playerY: 656.625
				});
			}
		}
	}
}
class Overworld extends SceneLoader {
	constructor() {
		super("Overworld");
	}

	registerInputHandlers() {
		this.wKey = this.input.keyboard.addKey('W');
		this.aKey = this.input.keyboard.addKey('A');
		this.sKey = this.input.keyboard.addKey('S');
		this.dKey = this.input.keyboard.addKey('D');
		this.fKey = this.input.keyboard.addKey('F');
		this.enterKey = this.input.keyboard.addKey('ENTER');
	}

	rerenderEnergy() {
		if (this.energyBox != undefined) {
			this.energyBox.destroy();
			this.energyBox = undefined;
		}
		if (this.outline != undefined) {
			this.outline.destroy();
			this.outline = undefined;
		}
		if (this.playerEnergy >= maxEnergy) this.playerEnergy = maxEnergy;
		if (this.playerEnergy < 0) {
			this.playerEnergy = 0;
			this.scene.start("Ending", {
				won: false,
				energy: true
			});
		}
		this.energyBox = this.add.rectangle(getLeftAlign(this.playerEnergy), 100, this.playerEnergy * 3, 100, 0x00FF00, 1);
		this.outline = this.add.rectangle(maxEnergy * 3, 100, maxEnergy * 3, 100, 0x000000, 0).setStrokeStyle(5, 0xffffff, 1);
	}

	runTime(time, delta) {
		if (Math.round(time / 1000) % 5 == 0) {
			if (!this.takenEnergyThisFrame) {
				this.takenEnergyThisFrame = true;
				this.playerEnergy -= 3;
				this.rerenderEnergy();
			}
		} else {
			this.takenEnergyThisFrame = false;
		}
		this.time += delta / 1000;
		this.timeText.setText("Time: " + timeToText(this.time));
		// Check if the player is intersecting with the interactables and if they are display a message to interact
		// log the size of interactables

		let interacting = undefined;
		for (let [objName, obj] of Object.entries(this.interactables)) {
			if (this.physics.overlap(this.player, obj) && obj.sparkles != undefined) {
				interacting = objName;
				break;
			}
		}
		// if all used interactables are used, add a callback to the Ending object that when intersecting with, the game goes to Intro
		let allUsed = true;
		for (let i = 0; i < Object.keys(usedinteractables).length; i++) {
			if (!usedinteractables[Object.keys(usedinteractables)[i]]) {
				allUsed = false;
				break;
			}
		}
		if (allUsed) {
			this.endingSparkles.setAlpha(0.7);
			this.interactText.setText("Press F to leave!");
			if (this.physics.overlap(this.player, this.ending)) {
				interacting = this.ending;
			}
		}
		if (interacting != undefined) {
			if (this.activeText == undefined) {
				this.interactText.setAlpha(1);
				this.moveBox.setAlpha(1);
			}
			else this.interactText.setAlpha(0);
		} else {
			if (this.activeText != undefined) {
				this.activeText.destroy();
				this.activeText = undefined;
			}
			this.interactText.setAlpha(0);
			this.moveBox.setAlpha(0);
		}
		if (this.time >= hoursToMinutes(EndTime)) {
			console.log("You have lost");
			this.scene.start("Ending", {
				won: false,
				time: true
			});
		}
	}

	runInteractables(time, delta) {
		let interacting = undefined;
		let name = "";
		for (let [objName, obj] of Object.entries(this.interactables)) {
			if (this.physics.overlap(this.player, obj) && obj.sparkles != undefined) {
				interacting = obj;
				name = objName;
				break;
			}
		}
		if (interacting != undefined) {
			if (!this.textActive && this.canReleaseText && this.fKey.isDown) {
				this.canReleaseText = false;
				this.textActive = true;
				this.interactedObject = interacting;
				this.interactedObjectName = name;
				this.activeText = this.add.text(40, 885, interacting.interactText, {
					font: "50px Arial",
					fill: "#FFFFFF",
					stroke: "#000000",
					strokeThickness: 5,
					align: "center"
				});
				// We only plan to have 2 actions to take
				this.leftAction = this.add.text(140, 1000, interacting.interactActions.leftAction, {
					font: "50px Arial",
					fill: "#FFFFFF",
					stroke: "#000000",
					strokeThickness: 5,
					align: "center"
				});
				this.rightAction = this.add.text(740, 1000, interacting.interactActions.rightAction, {
					font: "50px Arial",
					fill: "#FFFFFF",
					stroke: "#000000",
					strokeThickness: 5,
					align: "center"
				}).setAlpha(0.5);
				this.moveBox.setAlpha(1);
				this.disablePlayerMovement = true;
				this.usedTextItem = 1;
			} else if (this.textActive && this.canReleaseText && this.fKey.isDown) {
				this.textActive = false;
				this.canReleaseText = false;
				if (this.activeText != undefined) {
					this.activeText.destroy();
					this.activeText = undefined;
				}
			}
		} else {
			this.textActive = false;
			if (this.activeText != undefined) {
				this.activeText.destroy();
				this.activeText = undefined;
			}
		}
	}

	runInput(time, delta) {
		// if all used interactables are used, add a callback to the Ending object that when intersecting with, the game goes to Intro
		let allUsed = true;
		for (let i = 0; i < Object.keys(usedinteractables).length; i++) {
			if (!usedinteractables[Object.keys(usedinteractables)[i]]) {
				allUsed = false;
				break;
			}
		}
		if (allUsed) {
			if (this.physics.overlap(this.player, this.ending) && this.fKey.isDown) {
				this.scene.start("Ending", {
					won: true
				});
				return;
			}
		}
		if (this.disablePlayerMovement) {
			if (this.player.body.velocity.y != 0 || this.player.body.velocity.x != 0) {
				this.player.setVelocity(0, 0);
				this.player.setTexture(this.idleAsset);
			}
			if ((this.aKey.isDown || this.dKey.isDown) && this.releasedKey) {
				this.releasedKey = false;
				this.usedTextItem++;
				if (this.usedTextItem % 2 == 0) {
					this.leftAction.setAlpha(0.5);
					this.rightAction.setAlpha(1);
				} else {
					this.leftAction.setAlpha(1);
					this.rightAction.setAlpha(0.5);
				}
			} else if (!(this.aKey.isDown || this.dKey.isDown || this.enterKey.isDown || this.fKey.isDown)) {
				this.releasedKey = true;
			}
			if ((this.enterKey.isDown || this.fKey.isDown) && this.releasedKey) {
				this.releasedKey = false;
				let selectedOption = this.usedTextItem % 2;
				if (selectedOption == 0) {
					// log the length of the interactions
					let length = this.interactedObject.interactions.size;
					let response = this.interactedObject.interactions.get(Math.round(Seed * length) % length);
					if (this.interactedObject.interactions.get(0) == "StartBattle") {
						usedinteractables[this.interactedObjectName] = true;
						this.scene.start("Battle", {
							battle: this.interactedObject.interactions.get(1),
							energy: this.playerEnergy,
							time: this.time,
							playerX: this.player.x,
							playerY: this.player.y
						});
						return;
					}
					this.activeText.setText(response.description);
					this.activeText.setPosition(40, 885);
					this.leftAction.destroy();
					this.rightAction.destroy();
					// add a one off callback that when a key is pressed it will destroy the text
					this.input.keyboard.once('keydown', function (event) {
						if (this.scene.activeText != undefined) {
							this.scene.playerEnergy -= response.cost.energy;
							this.scene.rerenderEnergy();
							this.scene.activeText.destroy();
							this.scene.time += response.cost.time;

							if (this.scene.interactedObject.sparkles != undefined && this.scene.interactedObjectName != "TaskBook") {
								this.scene.interactedObject.sparkles.destroy();
								this.scene.interactedObject.sparkles = undefined;
								usedinteractables[this.scene.interactedObjectName] = true;
							}
							this.scene.textActive = false;
							this.scene.activeText = undefined;
						}
						this.scene.disablePlayerMovement = false;
						this.scene.releasedKey = false;
						this.scene.input.keyboard.removeAllListeners();
					});
				} else {
					if (this.activeText != undefined) {
						this.activeText.destroy();
						this.textActive = false;
						this.activeText = undefined;
					}
					if (this.leftAction != undefined) {
						this.leftAction.destroy();
						this.leftAction = undefined;
					}
					if (this.rightAction != undefined) {
						this.rightAction.destroy();
						this.rightAction = undefined;
					}
					this.disablePlayerMovement = false;
				}
			}
			return;
		}
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
				if (this.movingFrames % 2 == 0) {
					movingAsset = this.idleAsset;
				} else {
					movingAsset = movingAsset + ((this.movingFrames + 1) / 2);
				}
				this.player.setTexture(movingAsset);
				// flip the above texture if needed
				this.player.flipX = flip;
				this.framesWithPreviousAsset = 0;
			} else {
				this.framesWithPreviousAsset++;
			}
		} else {
			this.framesWithPreviousAsset = 16;
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
		this.disablePlayerMovement = false;
		this.leftAction = undefined;
		this.rightAction = undefined;
		this.releasedKey = false;
		this.playerX = data.playerX;
		this.playerY = data.playerY;
		if (this.playerX == undefined) {
			this.playerX = 158.25;
		}
		if (this.playerY == undefined) {
			this.playerY = 656.625;
		}
	}

	addPhysicsWall(x, y) {
		let newPhysBounds = this.physics.add.sprite(x, y, "Platform").setScale(1.75).setImmovable(true).setAlpha(Debug);
		// add a callback for when the object is clicked to output its position
		newPhysBounds.setInteractive().on('pointerdown', () => {
			console.log(newPhysBounds.x, newPhysBounds.y);
		});
		this.physics.add.collider(
			newPhysBounds, this.player
		);
	}

	initializePhone(phone) {
		phone.interactText = "Your notifications are always silenced.";
		phone.interactions = new Map();
		phone.interactions.set(0,
			{
				description: "You have no new messages, and your friend posted cat pics.",
				cost: {
					energy: -MediumEnergy,
					time: hoursToMinutes(LowTime)
				}
			});
		phone.interactions.set(1,
			{
				description: "You have 173 unread emails and 3 new texts from your\nparents. Instead of checking any of these,\nyou just scroll through social media.",
				cost: {
					energy: LowEnergy,
					time: hoursToMinutes(HighTime)
				}
			});
		phone.interactActions = {
			leftAction: "Check phone",
			rightAction: "Put the phone down"
		};
		if (!usedinteractables["Phone"]) phone.sparkles = this.add.image(750, 220, "Sparkle").setScale(0.1).setAlpha(0.7);
	}

	initializeMedicine(medicine) {
		medicine.interactText = "According to your therapist, these tiny pills are supposed\nto make you feel better.";
		medicine.interactions = new Map();
		medicine.interactions.set(0,
			{
				description: "You took your medication today.",
				cost: {
					energy: LowEnergy,
					time: hoursToMinutes(LowTime)
				}
			});
		medicine.interactions.set(1, {
			description: "You took your medication today.",
			cost: {
				energy: LowEnergy,
				time: hoursToMinutes(LowTime)
			}
		});
		medicine.interactActions = {
			leftAction: "Take medication",
			rightAction: "Skip for today"
		};
		if (!usedinteractables["Medicine"]) medicine.sparkles = this.add.image(370, 350, "Sparkle").setScale(0.1).setAlpha(0.7);
	}

	initializeWaterCups(waterCups) {
		waterCups.interactText = "There are various cups on your desk, all with different amounts of water.";
		waterCups.interactions = new Map();
		waterCups.interactions.set(0,
			{
				description: "The cup you picked up has no water.",
				cost: {
					energy: 0,
					time: hoursToMinutes(LowTime)
				}
			});
		waterCups.interactions.set(1, {
			description: "The cup you picked up has half a sip of water left. You sip. Still thirsty. ",
			cost: {
				energy: -LowEnergy,
				time: hoursToMinutes(LowTime)
			}
		});
		waterCups.interactions.set(2, {
			description: "You enjoy a couple gulps of water. You feel refreshed.",
			cost: {
				energy: MediumEnergy,
				time: hoursToMinutes(LowTime)
			}
		});

		waterCups.interactActions = {
			leftAction: "Drink from a cup",
			rightAction: "Don't drink"
		};
		if (!usedinteractables["WaterCups"]) waterCups.sparkles = this.add.image(430, 945, "Sparkle").setScale(0.12).setAlpha(0.7);
	}

	initializeDog(dog) {
		dog.interactText = "It's your dog. He's a good boi. He looks up at you.";
		dog.interactions = new Map();
		dog.interactions.set(0,
			{
				description: "Yayyy doggy.",
				cost: {
					energy: -LowEnergy,
					time: hoursToMinutes(LowTime)
				}
			});
		dog.interactActions = {
			leftAction: "Pet dog",
			rightAction: "Don't pet"
		};
		if (!usedinteractables["Dog"]) dog.sparkles = this.add.image(880, 950, "Sparkle").setScale(0.2).setAlpha(0.7);
		// move dogs interaction box up and to the left
	}

	initializeBackpack(backpack) {
		backpack.interactText = "Inside are miscellaneous papers, but you also need\nyour laptop for class.";
		backpack.interactions = new Map();
		backpack.interactions.set(0, "StartBattle");
		backpack.interactions.set(1, "Backpack");
		backpack.interactActions = {
			leftAction: "Pack for school",
			rightAction: "Leave it"
		};
		if (!usedinteractables["Backpack"]) backpack.sparkles = this.add.image(1150, 890, "Sparkle").setScale(0.2).setAlpha(0.7);
	}

	initializeCloset(closet) {
		closet.interactText = "Maybe today you won't wear pajamas to class.";
		closet.interactions = new Map();
		closet.interactions.set(0, "StartBattle");
		closet.interactions.set(1, "Door");
		closet.interactActions = {
			leftAction: "Get changed",
			rightAction: "Stay in pajamas"
		};
		if (!usedinteractables["Closet"]) closet.sparkles = this.add.image(1050, 200, "Sparkle").setScale(0.2).setAlpha(0.7);
	}

	initializeTaskBook(taskBook) {
		taskBook.interactText = "It's a list of things you should do to get ready in the morning.\nHopefully you'll have enough energy today.";
		taskBook.interactions = new Map();
		taskBook.interactions.set(0,
			{
				description: "                    Wake up             Get changed                    \nTake medication           Pack for school\n      Leave by 1PM",
				cost: {
					energy: 0,
					time: 0
				}
			});
		taskBook.interactActions = {
			leftAction: "Check tasks",
			rightAction: "Leave"
		};
		taskBook.sparkles = this.add.image(100, 650, "Sparkle").setScale(0.1).setAlpha(0.7);
	}

	create() {
		// log the pointer position when it is in the game
		this.input.on('pointerdown', (pointer) => {
			console.log(pointer.x, pointer.y);
		});
		this.background = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "Opening").setScale(1.86);

		this.interactables = {
			"Phone": this.physics.add.sprite(750, 220, "Phone").setScale(1.5),
			"Medicine": this.physics.add.sprite(400, 350, "FrontIdle").setScale(0.5).setAlpha(0),
			"WaterCups": this.physics.add.sprite(440, 925, "FrontIdle").setScale(1.5).setAlpha(0),
			"Dog": this.physics.add.sprite(880, 950, "Dog").setScale(1.5),
			"Backpack": this.physics.add.sprite(1150, 800, "FrontIdle").setScale(2.0).setAlpha(0),
			"Closet": this.physics.add.sprite(1100, 200, "FrontIdle").setScale(2.0).setAlpha(0),
			"TaskBook": this.physics.add.sprite(100, 700, "FrontIdle").setScale(1.5).setAlpha(0)
		};
		this.ending = this.physics.add.sprite(1450, 600, "FrontIdle").setScale(1.5).setAlpha(1);
		this.endingSparkles = this.add.image(1400, 600, "Sparkle").setScale(0.2).setAlpha(0);
		// lets put medicine on the dresser
		// we'll put then water cups on the shelf to the right of the nightstand
		// dog will go at bottom, between dresser and desk
		this.initializePhone(this.interactables.Phone);
		this.initializeMedicine(this.interactables.Medicine);
		this.initializeWaterCups(this.interactables.WaterCups);
		this.initializeDog(this.interactables.Dog);
		this.initializeBackpack(this.interactables.Backpack);
		this.initializeCloset(this.interactables.Closet);
		this.initializeTaskBook(this.interactables.TaskBook);

		this.registerInputHandlers();
		this.maxVelocity = 300;
		this.player = this.physics.add.sprite(this.playerX, this.playerY, this.idleAsset)
			.setScale(2.25)
			.setCollideWorldBounds(true)
			.setMaxVelocity(this.maxVelocity, this.maxVelocity);
		this.player.body.setSize(50, 95);

		// YAY CRAPPY PHYSICS BOUNDS
		this.addPhysicsWall(900, 100);
		this.addPhysicsWall(-370, 225);
		this.addPhysicsWall(-590, 450);
		this.addPhysicsWall(1850, 910);
		this.addPhysicsWall(-536, 895);
		this.addPhysicsWall(-860, 795);
		this.addPhysicsWall(-400, 975);
		this.addPhysicsWall(1715, 1015);
		this.addPhysicsWall(900, 1125);
		this.addPhysicsWall(2250, 310);
		this.addPhysicsWall(2250, 785);
		this.addPhysicsWall(2100, 160);
		// Move the hitbox down a touch
		this.player.body.setOffset(20, 14);

		this.moveBox = this.add.rectangle(this.cameras.main.centerX, 975, 1390, 200, 0x000000, 0.5).setStrokeStyle(5, 0x000000, 1).setAlpha(0);
		this.interactText = this.add.text(40, 900, "Press F to interact", {
			font: "50px Arial",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 5,
			align: "center"
		}).setAlpha(0);

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
		this.rerenderEnergy();
	}

	update(time, delta) {
		this.runTime(time, delta);
		this.runInteractables(time, delta);
		this.runInput(time, delta);
	}
}

class Battle extends SceneLoader {
	constructor() {
		super("Battle");
	}

	init(data) {
		this.battleType = data.battle;
		this.playerEnergy = data.energy;
		this.time = data.time;
		this.playerX = data.playerX;
		this.playerY = data.playerY;
	}

	registerInputHandlers() {
		this.wKey = this.input.keyboard.addKey('W');
		this.aKey = this.input.keyboard.addKey('A');
		this.sKey = this.input.keyboard.addKey('S');
		this.dKey = this.input.keyboard.addKey('D');
		this.fKey = this.input.keyboard.addKey('F');
		this.enterKey = this.input.keyboard.addKey('ENTER');
	}

	rerenderEnergy() {
		if (this.energyBox != undefined) {
			this.energyBox.destroy();
			this.energyBox = undefined;
		}
		if (this.outline != undefined) {
			this.outline.destroy();
			this.outline = undefined;
		}
		if (this.playerEnergy >= maxEnergy) this.playerEnergy = maxEnergy;
		if (this.playerEnergy < 0) {
			this.playerEnergy = 0;
			this.scene.start("Ending", {
				won: false,
				energy: true
			});
		}
		this.energyBox = this.add.rectangle(getLeftAlign(this.playerEnergy), 100, this.playerEnergy * 3, 100, 0x00FF00, 1);
		this.outline = this.add.rectangle(maxEnergy * 3, 100, maxEnergy * 3, 100, 0x000000, 0).setStrokeStyle(5, 0xffffff, 1);
	}

	getBattleData() {
		this.battleOptions = [];
		if (this.battleType == "Backpack") {
			this.battleOptions.push(
				{
					name: "Pack laptop",
					description: "As you place your laptop in the bag, the corner of it bumps against the ground a little too hard. You wince",
					energy: LowEnergy,
					disabled: false
				});
			this.battleOptions.push(
				{
					name: "Pack charger",
					description: "you crawl under your desk and unplug your charger from the wall, it's all tangled up...",
					energy: MediumEnergy,
					disabled: false
				});
			this.battleOptions.push(
				{
					name: "Zip up",
					description: "As you zip up the bag, the zipper gets stuck. You jiggle it a bit until eventually it closes completely",
					energy: LowEnergy,
					disabled: false
				});
			this.conclusion = {
				description: "Battle cleared!",
				energy: LowEnergy,
				time: LowTime
			}
		} else if (this.battleType == "Door") {
			this.battleOptions.push(
				{
					name: "Take off clothes",
					description: "As you undress, the cold air hits your body. You curl inwards and shiver. Better get changed fast!",
					energy: MediumEnergy,
					disabled: false
				});
			this.battleOptions.push(
				{
					name: "Put together an outfit",
					description: "You think about what you want to wear. There's that new shirt your mom got you. I'd go pretty well with your comfy pants and jacket.",
					energy: LowEnergy,
					disabled: false
				});
			this.battleOptions.push(
				{
					name: "Put on a new shirt",
					description: "You put on the new shirt. It's a bit itchy and it smells weird. You take it off quickly.",
					energy: MediumEnergy,
					disabled: false
				});
			this.battleOptions.push(
				{
					name: "Put on old shirt",
					description: "You decide to choose your old shirt. It's soft and comfy, and smells like nothing. Which is perfect.",
					energy: 0,
					disabled: false
				});
			this.battleOptions.push(
				{
					name: "Put on pants",
					description: "They're slightly too tight. The price we pay for fashion I guess. You wriggle into your pants, and you're a little ashamed that it makes you a bit breathless.",
					energy: MediumEnergy,
					disabled: false
				});
			this.battleOptions.push(
				{
					name: "Put on jacket",
					description: "You put on your jacket and then look at the mirror. It compliments your outfit nicely.",
					energy: -LowEnergy,
					disabled: false
				});
			this.conclusion = {
				description: "Battle cleared!",
				energy: LowEnergy,
				time: LowTime
			}
		}
	}

	create() {
		this.time += hoursToMinutes(HighTime);
		this.disabledInputs = 0;
		this.selectedOption = 0;
		this.ignoreInput = false;
		this.releasedKey = true;
		this.getBattleData();
		this.registerInputHandlers();
		this.rerenderEnergy();
		// for each option in battleOptions, set a flag for wasUsed to 

		this.topRightGoon = this.physics.add.sprite(this.cameras.main.centerX + 400, this.cameras.main.centerY - 200, this.battleType)
			.setImmovable(true)
			.setScale(2.5)
			.setFlipX(true);

		this.middleLeftGoon = this.physics.add.sprite(this.cameras.main.centerX - 400, this.cameras.main.centerY + 100, "ProtagonistBattleSprite")
			.setImmovable(true)
			.setScale(2.5);

		this.moveBox = this.add.rectangle(this.cameras.main.centerX, 925, 1390, 300, 0x000000, 0.75)
			.setStrokeStyle(5, 0xffffff, 1);

		// create the text for the battle options
		this.battlePrompt = this.add.text(50, 800, "Choose an action", {
			font: "50px Arial",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 5
		}).setWordWrapWidth(1300, true);
		// there will only be a max of 6 options so imma hard code it
		this.battleOptionsText = [];
		this.battleOptionsText.push(this.add.text(50, 900, this.battleOptions[0].name, {
			font: "50px Arial",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 5
		}));
		this.battleOptionsText.push(this.add.text(445, 900, this.battleOptions[1].name, {
			font: "50px Arial",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 5
		}));
		this.battleOptionsText.push(this.add.text(950, 900, this.battleOptions[2].name, {
			font: "50px Arial",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 5
		}));
		if (this.battleOptions.length >= 4) {
			this.battleOptionsText.push(this.add.text(50, 1000, this.battleOptions[3].name, {
				font: "50px Arial",
				fill: "#ffffff",
				stroke: "#000000",
				strokeThickness: 5
			}));
			this.battleOptionsText.push(this.add.text(425, 1000, this.battleOptions[4].name, {
				font: "50px Arial",
				fill: "#ffffff",
				stroke: "#000000",
				strokeThickness: 5
			}));
			this.battleOptionsText.push(this.add.text(800, 1000, this.battleOptions[5].name, {
				font: "50px Arial",
				fill: "#ffffff",
				stroke: "#000000",
				strokeThickness: 5
			}));
		}
		this.wKey.on("down", () => {
			if (this.ignoreInput || this.battleOptions.length < 2) return;
			this.selectedOption += 3;
		});
		this.sKey.on("down", () => {
			if (this.ignoreInput || this.battleOptions.length < 2) return;
			this.selectedOption -= 3;
		});
		this.aKey.on("down", () => {
			if (this.ignoreInput || this.battleOptions.length < 2) return;
			this.selectedOption--;
			this.verifyOptionBounds();
			while (this.battleOptions[this.selectedOption % this.battleOptions.length].disabled) {
				this.selectedOption--;
				this.verifyOptionBounds();
			}
		});
		this.dKey.on("down", () => {
			if (this.ignoreInput || this.battleOptions.length < 2) return;
			this.selectedOption++;
			this.verifyOptionBounds();
			while (this.battleOptions[this.selectedOption % this.battleOptions.length].disabled) {
				this.selectedOption++;
				this.verifyOptionBounds();
			}
		});
	}

	verifyOptionBounds() {
		if (this.selectedOption < 0) {
			this.selectedOption += this.battleOptions.length;
		}
		if (this.selectedOption >= this.battleOptions.length) {
			this.selectedOption -= this.battleOptions.length;
		}
	}

	update(time, delta) {
		if (this.fKey.isUp) this.releasedKey = true;
		if (this.ignoreInput) return;
		this.verifyOptionBounds();
		let selectedOption = this.selectedOption % this.battleOptions.length;
		if (this.battleOptions.length > 1) {
			while (this.battleOptions[selectedOption].disabled) {
				this.selectedOption++;
				selectedOption = this.selectedOption % this.battleOptions.length;
			}
		}
		this.battleOptionsText.forEach((option, index) => {
			if (index == selectedOption) {
				option.setAlpha(0.55);
			} else if (!this.battleOptions[index].disabled) {
				option.setAlpha(1);
			} else {
				option.setAlpha(0);
			}
		});
		if (this.fKey.isDown && this.releasedKey) {
			this.releasedKey = false;
			this.playerEnergy -= this.battleOptions[selectedOption].energy;
			this.battlePrompt.setText(this.battleOptions[selectedOption].description);
			this.ignoreInput = true;
			this.battleOptionsText.forEach((option, index) => {
				option.setAlpha(0);
			});
			this.fKey.on("up", () => {
				if (!this.releasedKey) return;
				this.battlePrompt.setText("Choose an action");
				this.fKey.removeAllListeners();
				this.ignoreInput = false;
				this.rerenderEnergy();
				this.battleOptions[selectedOption].disabled = true;
				this.disabledInputs++;
				if (this.disabledInputs >= this.battleOptions.length) {
					this.battleOptionsText.forEach((option, index) => {
						option.setAlpha(0);
					});
					this.ignoreInput = true;
					this.battleOptionsText.push(this.add.text(540, 925, "Battle won!", {
						font: "75px Arial",
						fill: "#FFFFFF",
						stroke: "#000000",
						strokeThickness: 5
					}).setAlpha(0.55));
					// when the f key is pressed start the overworld
					this.fKey.on("down", () => {
						this.scene.start("Overworld", {
							energy: this.playerEnergy,
							time: this.time,
							playerX: this.playerX,
							playerY: this.playerY,
						});
					});
				}
			});
		}
	}
}

class Ending extends SceneLoader {
	constructor() {
		super("Ending");
	}

	init(data) {
		this.won = data.won
		this.energy = data.energy
		this.time = data.time
	}

	create() {
		let text = "";
		if (this.won) {
			text = "You made it to school on time after fully preparing!";
		} else {
			if (this.energy) {
				text = "Oh no! You ran out of energy and fell back asleep!";
			} else if (this.time) {
				text = "Oh no! You ran out of time and were late!";
			} else {
				text = "Oh no! You ran out of energy or time!";
			}
		}
		this.background = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "Opening").setScale(1.86);
		this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, text + "\n\nProgramming\nDave Markowitz\n\nArt\nAdrian Cheng\nEmily Wen\nMicah Kiang ", {
			font: "75px Arial",
			fill: "#FFFFFF",
			stroke: "#000000",
			strokeThickness: 5,
			align: "center"
		}).setWordWrapWidth(1300).setOrigin(0.5);
		this.input.on("pointerdown", () => {
			this.scene.start("Intro");
		});
		this.input.keyboard.on("keydown", () => {
			this.scene.start("Intro");
		});
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
			debug: Debug,
			gravity: {
				x: 0,
				y: 0
			}
		}
	},
	scene: [Intro, Sleeping, Overworld, Battle, Ending],
	title: "Mornings",
});
