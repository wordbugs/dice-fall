//⚀⚁⚃⚄⚅♠♥♦♣♤♡♢♧⛀⛁⛂⛃//

const STATE_INTACT = 0;
const STATE_WEAK = 1;
const STATE_COLLAPSED = 2;

// https://stackoverflow.com/a/2450976
function shuffle(array) {
	let currentIndex = array.length;

	// While there remain elements to shuffle...
	while (currentIndex != 0) {
		// Pick a remaining element...
		let randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex],
		];
	}
}


const tiles = {
	0: {
		value: 0,
		pips: [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0],
		],
	},
	1: {
		value: 1,
		pips: [
			[0, 0, 0],
			[0, 1, 0],
			[0, 0, 0],
		],
	},
	2: {
		value: 2,
		pips: [
			[0, 0, 1],
			[0, 0, 0],
			[2, 0, 0],
		],
	},
	3: {
		value: 3,
		pips: [
			[1, 0, 0],
			[0, 2, 0],
			[0, 0, 3],
		],
	},
	4: {
		value: 4,
		pips: [
			[1, 0, 2],
			[0, 0, 0],
			[4, 0, 3],
		],
	},
	5: {
		value: 5,
		pips: [
			[2, 0, 3],
			[0, 1, 0],
			[5, 0, 4],
		],
	},
	6: {
		value: 6,
		pips: [
			[6, 0, 1],
			[5, 0, 2],
			[4, 0, 3],
		],
	},
	7: {
		value: 7,
		pips: [
			[2, 3, 4],
			[0, 1, 0],
			[7, 6, 5],
		],
	},
	8: {
		value: 8,
		pips: [
			[1, 2, 3],
			[8, 0, 4],
			[7, 6, 5],
		],
	},
	9: {
		value: 9,
		pips: [
			[1, 2, 3],
			[8, 9, 4],
			[7, 6, 5],
		],
	},
};

const CONTROLLER_PLAYER_MOUSE_ONLY = "player: mouse only";
const CONTROLLER_PLAYER_MOUSE_AND_ARROW_KEYS = "player: mouse & arrows";
const CONTROLLER_PLAYER_MOUSE_AND_WASD = "player: mouse & wasd";
const CONTROLLER_BOT_RANDOM = "bot: random";

const { createApp, ref } = Vue;

const app = createApp({
	data() {
		return {
			helping: true,
			ready: false,
			pause: false,
			timeoutId: 0,
			tabNames: ["game", "about", "settings"],
			modifiers: [
				"home",
				"fallen",
				"fragile",
				"portal",
				"haven",
				"lookout",
				"floating",
				"hazard",
				"spades",
				"hearts",
				"diamonds",
				"clubs",
				//'bomb',
				//'shovel',
				//'tunnel',
			],
			goalOptions: [
				{
					value: "last_one_standing",
					text: "last one standing wins",
				},
				//{
				//	value: 'max_movement',
				//	text: 'whoever moves the most wins',
				//},
				{
					value: "collapse_all",
					text: "collapse the entire board",
				},
			],
			suitNames: new Set(["spades", "hearts", "diamonds", "clubs"]),
			controllers: [
				CONTROLLER_PLAYER_MOUSE_ONLY,
				CONTROLLER_PLAYER_MOUSE_AND_ARROW_KEYS,
				CONTROLLER_PLAYER_MOUSE_AND_WASD,
				CONTROLLER_BOT_RANDOM,
			],
			suits: [
				{
					name: "spades",
					symbol: "♠",
				},
				{
					name: "hearts",
					symbol: "♥",
				},
				{
					name: "diamonds",
					symbol: "♦",
				},
				{
					name: "clubs",
					symbol: "♣",
				},
			],
			currentTab: "game",

			intendedSettings: {
				rows: 4,
				columns: 4,
				goal: "collapse_all",
				randomPlacement: true,
				suitModifiers: {
					spades: new Set(),
					hearts: new Set(),
					diamonds: new Set(),
					clubs: new Set(),
				},
				playerTemplates: [
					{
						name: "red",
						color: "var(--red)",
						controller: CONTROLLER_BOT_RANDOM,
						drafted: false,
					},
					{
						name: "blue",
						color: "var(--blue)",
						controller: CONTROLLER_BOT_RANDOM,
						drafted: false,
					},
					{
						name: "green",
						color: "var(--green)",
						controller: CONTROLLER_BOT_RANDOM,
						drafted: false,
					},
					{
						name: "pink",
						color: "var(--pink)",
						controller: CONTROLLER_BOT_RANDOM,
						drafted: false,
					},
					{
						name: "yellow",
						color: "var(--yellow)",
						controller: CONTROLLER_BOT_RANDOM,
						drafted: false,
					},
					{
						name: "cyan",
						color: "var(--cyan)",
						controller: CONTROLLER_BOT_RANDOM,
						drafted: false,
					},
					{
						name: "grey",
						color: "var(--grey)",
						controller: CONTROLLER_BOT_RANDOM,
						drafted: false,
					},
					{
						name: "orange",
						color: "var(--orange)",
						controller: CONTROLLER_BOT_RANDOM,
						drafted: false,
					},
					{
						name: "lilac",
						color: "var(--lilac)",
						controller: CONTROLLER_BOT_RANDOM,
						drafted: false,
					},
				],

				randomizeTurnOrder: true,
				diceTypes: [
					{
						amount: 2,
						setSuit: false,
						suitIsInherited: true,
						faces: [{ value: 4, modifiers: new Set(["lookout", "home"]) }],
					},
					{
						amount: 4,
						setSuit: false,
						suitIsInherited: true,
						faces: [{ value: 1, modifiers: new Set() }],
					},
					{
						amount: 4,
						setSuit: false,
						suitIsInherited: true,
						faces: [{ value: 2, modifiers: new Set() }],
					},
					{
						amount: 4,
						setSuit: false,
						suitIsInherited: true,
						faces: [{ value: 3, modifiers: new Set() }],
					},
					{
						amount: 2,
						setSuit: false,
						suitIsInherited: true,
						faces: [{ value: 4, modifiers: new Set() }],
					},
				],
				dice: [],
			},
			players: [],
			currentSettings: null,
			dice: null,
			legalMoves: [],
			activePlayerId: 0,
			gameState: null,
			howOver: 0,
			turn: 0,
		};
	},
	computed: {
		activePlayer() {
			return this.players[this.activePlayerId];
		},
		remainingPlayers() {
			return this.players.filter((p) => !p.fallen);
		},
		nextPlayerId() {
			if (this.turn === 0) return 0;
			for (let i = this.activePlayerId + 1; i < this.players.length; i++) {
				if (!this.players[i].fallen) return i;
			}
			for (let i = 0; i < this.activePlayerId; i++) {
				if (!this.players[i].fallen) return i;
			}
			return this.activePlayerId;
		},
		size() {
			return this.currentSettings.columns * this.currentSettings.rows;
		},
		intendedSize() {
			return this.intendedSettings.columns * this.intendedSettings.rows;
		},
		columns() {
			return this.currentSettings.columns;
		},
		rows() {
			return this.currentSettings.rows;
		},
		deck() {
			let deck = [];
			for (const tile of this.intendedSettings.diceTypes) {
				for (let i = 0; i < tile.amount; i++) {
					const suit = this.suits[i % 4];
					let tileCopy = {
						state: STATE_INTACT,
						faceIndex: 0,
						faces: tile.faces.map((face) => {
							return {
								...face,
								modifiers: new Set(
									tile.setSuit
										? [...face.modifiers, suit.name]
										: [...face.modifiers],
								),
							};
						}),
					};
					deck.push(tileCopy);
				}
				//if (tile.setSuit) {
				//	let tileCopy = {...tile, faces: []}
				//	const suit = this.suits[i % 4]
				//	for (const face of tile.faces) {
				//		let mods = face.modifiers
				//		mods.add(suit.name)
				//		tileCopy.faces.push({
				//			...face,
				//			modifiers: mods
				//		})
				//	}
				//	deck.push(tileCopy)
				//} else {
				//	deck.push(tile)
				//}
			}

			const n = this.intendedPlayers.length;

			if (deck.length !== this.size) {
				shuffle(deck);
			}

			const len = deck.length;
			for (let i = 0; i < this.size - len; i++) {
				deck.push(this.cloneDie(deck[i]));
			}

			for (let i = deck.length; i > this.size; i--) {
				deck.pop();
			}

			let homeCandidates = []

			for (const die of deck) {
				if (die.faces[0].modifiers.has('home')) {
					homeCandidates.push(die)
				}
			}

			if (homeCandidates.length < n) {
				homeCandidates = deck
			}

			shuffle(homeCandidates)

			if (this.intendedSettings.randomPlacement) {
				for (let i = 0; i < n; i++) {
					homeCandidates[i].playerStart = i
				}
			}

			//for (let i = 0; i < n; i++) {
			//	const tile = this.intendedSettings.homeDiceType;
			//	const suit = this.suits[i % 4];
			//	let tileCopy = {
			//		state: STATE_INTACT,
			//		faceIndex: 0,
			//		playerStart: i, // TODO: place it elsewhere?
			//		faces: tile.faces.map((face) => {
			//			return {
			//				...face,
			//				modifiers: new Set(
			//					tile.setSuit
			//						? [...face.modifiers, suit.name]
			//						: [...face.modifiers],
			//				),
			//			};
			//		}),
			//	};
			//	for (const mod of this.homeModifiers) {
			//		tileCopy.faces[0].modifiers.add(mod);
			//	}
			//	deck.push(tileCopy);
			//}

			for (const suit of this.suitNames) {
				const mods = this.intendedSettings.suitModifiers[suit];
				if (mods.size > 0) {
					for (const tile of deck) {
						if (tile.faces[0].modifiers.has(suit)) {
							for (const mod of mods) {
								tile.faces[0].modifiers.add(mod);
							}
						}
					}
				}
			}

			return deck;
		},
		deckSize() {
			let count = 0;
			for (const tile of this.intendedSettings.diceTypes) {
				count += tile.amount;
			}
			return count;
		},
		intendedPlayers() {
			return this.intendedSettings.playerTemplates.filter((p) => p.drafted);
		},
		//homeModifiers() {
		//	return new Set([
		//		"home",
		//		...this.intendedSettings.homeDiceType.faces[0].modifiers,
		//	]);
		//},
		goalDescription() {
			switch (this.currentSettings.goal) {
				case "collapse_all":
					return "collapse all dice to win";
				case "last_one_standing":
					return "be the last player to fall";
			}
		},
	},
	methods: {
		setTab(tabName) {
			this.currentTab = tabName;
			if (this.pause && tabName === "game" && this.gameState !== "over") {
				this.awaitCommand();
			}
			this.pause = tabName !== "game";
		},
		pickPreset(preset) {
			this.intendedSettings = preset;
			if (!this.ready) {
				this.setBoard();
				this.ready = true;
			}
		},
		cloneDie(die) {
			return {
				state: STATE_INTACT,
				faceIndex: 0,
				faces: die.faces.map((face) => {
					return {
						...face,
						modifiers: new Set(face.modifiers),
					};
				}),
			};
		},
		draftPlayer() {
			let candidates = [];
			for (const player of this.intendedSettings.playerTemplates) {
				if (player.drafted === false) {
					candidates.push(player);
				}
			}
			if (candidates.length > 0) {
				candidates[Math.floor(Math.random() * candidates.length)].drafted =
					true;
			}
		},
		addTile() {
			this.intendedSettings.diceTypes.push({
				amount: 0,
				setSuit: false,
				suitIsInherited: true,
				currentFace: 0,
				faces: [
					{
						value: 1,
						modifiers: new Set(),
					},
				],
			});
		},
		addFace(tile) {
			let faceModifiers = new Set(tile.faces[tile.faces.length - 1].modifiers);
			tile.faces.push({
				value: tile.faces[tile.faces.length - 1].value,
				modifiers: faceModifiers,
			});
		},
		removeFace(tile, i) {
			if (tile.faces.length > 1) tile.faces.splice(i, 1);
		},
		ensureTileHasSecondFace(tile) {
			if (tile.otherFaces.length < 2) {
				this.addFace(tile);
				return true;
			}
			return false;
		},
		decrementTile(i) {
			if (this.intendedSettings.diceTypes[i].amount > 0)
				this.intendedSettings.diceTypes[i].amount--;
		},
		incrementTile(i) {
			this.intendedSettings.diceTypes[i].amount++;
		},
		setPosition(player, i) {
			player.position = i;
			player.x = this.getX(i);
			player.y = this.getY(i);
		},
		addModifier(face, event) {
			face.modifiers.add(event.target.value);
			event.target.value = "add:";
		},
		removeModifier(face, modifier) {
			face.modifiers.delete(modifier);
		},
		addSuitModifier(suitName, event) {
			this.intendedSettings.suitModifiers[suitName].add(event.target.value);
			event.target.value = "add:";
		},
		setBoard() {
			this.currentSettings = this.intendedSettings;
			this.players = [];
			for (const player of this.intendedPlayers) {
				this.players.push({
					position: -1000,
					x: -1,
					y: -1,
					movesLeft: 4,
					movesMade: 0,
					hasUsedAPortalThisTurn: false,
					turnStartTile: null,
					fallen: false,
					active: false,
					...player,
				});
			}
			if (this.intendedSettings.randomizeTurnOrder) {
				shuffle(this.players);
				//this.players = this.players
				//	.map(value => ({ value, sort: Math.random() }))
				//	.sort((a, b) => a.sort - b.sort)
				//	.map(({ value }) => value)
			}

			this.dice = this.deck
				.map((value) => ({ value, sort: Math.random() }))
				.sort((a, b) => a.sort - b.sort)
				.map(({ value }) => value);

			for (let i = 0; i < this.size; i++) {
				const c = this.dice[i];
				c.state = STATE_INTACT;
				c.faceIndex = 0;
				if (!isNaN(c.playerStart)) {
					const player = this.players[c.playerStart];
					this.setPosition(player, i);
					c.state = STATE_WEAK;
					c.home = player;
				} else if (this.getFace(c).modifiers.has("fallen")) {
					c.state = STATE_COLLAPSED;
				}
			}

			//this.checkLegalMoves()
			this.activePlayerId = 0;
			this.howOver = 0;
			this.legalMoves = [];
			this.setTab("game");
			this.gameState = "on";
			this.turn = 0;
			this.nextTurn();
		},
		getX(i) {
			return i % this.columns;
		},
		getY(i) {
			return Math.floor(i / this.columns);
		},
		getFace(die) {
			return die.faces[die.faceIndex | 0];
			// TODO: actually handle this
		},
		dieHas(die, modifier) {
			return this.getFace(die).modifiers.has(modifier);
		},
		getPosition(x, y) {
			return y * this.columns + x;
		},
		getLetterStyle(i) {
			const x = this.getX(i),
				y = this.getY(i);
			let color = "var(--bg-7)";
			switch (this.gameState) {
				case "victory":
					color = this.players[0].color;
					break;
				case "loss":
					color = "var(--bg-5)";
					break;
				case "over":
					color = this.remainingPlayers[0].color;
			}
			return {
				color,
				"border-color": color,
				left: `calc(${x} * var(--tile-size))`,
				top: `calc(${this.howOver / 20 > i / this.size ? y - 0.4 : y - 5} * var(--tile-size))`,
				opacity: this.howOver / 20 > i / this.size ? 1 : 0,
			};
		},
		moveTo(i, playerAction = true) {
			if (playerAction && this.activePlayer.controller.startsWith("bot:")) {
				return;
			}
			const p = this.activePlayer;
			if (p.fallen) return;
			if (p.movesLeft <= 0) {
				// TODO: remember what this is for?
				this.dice[p.position].state = STATE_COLLAPSED;
				this.setPosition(p, i);
				this.endTurn();
				return;
			}
			if (!this.isLegalMove(i)) return;
			if (p.position === i) {
				this.endTurn();
				return;
			}
			if (this.activePlayer.position >= 0) {
				let die = this.dice[p.position];
				if (this.activePlayer.movesMade === 0 || this.dieHas(die, "fragile")) {
					if (die.faceIndex < die.faces.length - 1) {
						die.faceIndex++;
					} else if (this.dieHas(die, "floating")) {
						die.faceIndex = 0;
					} else {
						die.state = STATE_COLLAPSED;
					}
				}
				if (this.dieHas(die, "portal")) {
					this.activePlayer.hasUsedAPortalThisTurn = true;
				}
			}
			this.setPosition(p, i);
			p.movesLeft--;
			p.movesMade++;
			this.dice[i].state = STATE_WEAK;
			if (p.movesLeft === 0) this.endTurn();
			else {
				this.checkLegalMoves();
				if (this.legalMoves.length) this.awaitCommand();
			}
		},
		isLegalPosition(i) {
			switch (this.dice[i].state) {
				case STATE_COLLAPSED:
				case STATE_WEAK:
					return false;
			}
			return true;
		},
		isLegalMove(i) {
			return this.legalMoves.includes(i);
		},
		getNeighbor(direction) {
			const p = this.activePlayer;
			let target = this.activePlayer.position;
			switch (direction) {
				case 0:
					target -= this.columns;
					if (target < 0) target += this.size;
					break;
				case 1:
					target++;
					if (target % this.columns === 0) target -= this.columns;
					break;
				case 2:
					target += this.columns;
					if (target >= this.size) target -= this.size;
					break;
				case 3:
					target--;
					if ((target + this.columns) % this.columns === this.columns - 1)
						target += this.columns;
					break;
			}
			return target;
		},
		endTurn() {
			let endTile = this.dice[this.activePlayer.position];
			let endFace = this.getFace(endTile);
			if (endFace.modifiers.has("hazard") && !this.activePlayer.fallen) {
				this.collapseOccupiedDie();
				return;
				// TODO: either make animations independent from game logic,
				//			 or block game logic until this completes?
			}
			this.activePlayer.movesLeft = endFace.value;
			this.activePlayer.movesMade = 0;
			this.activePlayer.active = false;
			this.activePlayer.turnStartTile = endTile;

			if (
				this.remainingPlayers.length === 1 &&
				this.currentSettings.goal === "last_one_standing"
			) {
				this.endGame("over");
			} else {
				this.nextTurn();
			}

		},
		nextTurn() {
			const id = this.nextPlayerId;
			this.activePlayerId = id;
			this.activePlayer.active = true;
			this.turn++;
			if (this.activePlayer.position >= 0) {
				this.activePlayer.movesLeft = this.getFace(
					this.dice[this.activePlayer.position],
				).value;
				this.activePlayer.turnStartTile = this.dice[this.activePlayer.position];
			} else {
				this.activePlayer.movesLeft = 1;
				this.activePlayer.turnStartTile = null;
			}
			this.activePlayer.hasUsedAPortalThisTurn = false;
			

			if (this.activePlayer.movesLeft === 0) this.activePlayer.movesLeft = 1;
			// TODO: delete this? player loses?

			this.activePlayer.movesMade = 0;

			search: for (let i = 0; i < this.size; i++) {
				if (this.dice[i].state === STATE_WEAK) {
					for (const player of this.players) {
						if (player.position === i) continue search;
					}
					this.dice[i].state = STATE_INTACT;
				}
			}

			if (this.activePlayer.position < 0) {
				this.legalMoves = [];
				for (let i = 0; i < this.size; i++) {
					if (this.isLegalPosition(i))
						this.legalMoves.push(i);
				}
				this.awaitCommand();
			} else if (this.checkLegalMoves()) this.awaitCommand();
		},
		awaitCommand() {
			if (this.activePlayer.controller.startsWith("bot:")) {
				if (!this.timeoutId)
					this.timeoutId = setTimeout(() => {
						this.timeoutId = 0;
						if (this.pause) {
							return;
						}
						switch (this.activePlayer.controller) {
							case CONTROLLER_BOT_RANDOM:
								let candidates = this.legalMoves;
								if (this.activePlayer.movesLeft === 1) {
									let safe = candidates.filter(
										(c) => !this.getFace(this.dice[c]).modifiers.has("hazard"),
									);
									if (safe.length > 0) candidates = safe;
								}
								this.moveTo(
									candidates[Math.floor(Math.random() * candidates.length)],
									false,
								);
								return;
						}
					}, 300);
			}
		},
		manuallyEndTurn(player) {
			if (
				player === this.activePlayer &&
				this.legalMoves.includes(player.position)
			) {
				this.endTurn();
			}
		},
		endGame(state) {
			this.legalMoves = [];
			setTimeout(() => {
				this.gameState = state;
				let interval = setInterval(() => {
					this.howOver++;
					if (this.howOver > 24) {
						clearInterval(interval);
						interval = setInterval(() => {
							this.howOver--;
							if (this.howOver <= 0) {
								clearInterval(interval);
							}
						}, 120);
					}
				}, 40);
			}, 600);
		},
		checkLegalMoves() {
			if (this.activePlayer.fallen) {
				this.legalMoves = [];
				return false;
			}
			const legalMoves = [];
			if (
				!this.activePlayer.hasUsedAPortalThisTurn &&
				this.dieHas(this.dice[this.activePlayer.position], "portal")
			) {
				for (let i = 0; i < this.size; i++) {
					if (
						this.dieHas(this.dice[i], "portal") &&
						this.isLegalPosition(i) &&
						this.activePlayer.position != i
					) {
						legalMoves.push(i);
					}
				}
			}
			for (let i = 0; i < 4; i++) {
				const pos = this.getNeighbor(i);
				if (this.isLegalPosition(pos)) {
					legalMoves.push(pos);
				}
			}
			if (
				this.activePlayer.movesMade !== 0 &&
				(this.dieHas(this.dice[this.activePlayer.position], "haven") ||
					this.dieHas(this.activePlayer.turnStartTile, "lookout"))
			) {
				legalMoves.push(this.activePlayer.position);
			}
			if (!legalMoves.length) {
				this.collapseOccupiedDie();
				return false;
			}
			this.legalMoves = legalMoves;
			return true;
		},
		collapseOccupiedDie() {
			let faller = this.activePlayer;
			this.legalMoves = [];
			setTimeout(() => {
				this.dice[faller.position].state = STATE_COLLAPSED;
				setTimeout(() => {
					faller.fallen = true;
					if (this.currentSettings.goal === "collapse_all") {
						let allIsCollapsed = true;
						for (const die of this.dice) {
							if (die.state !== STATE_COLLAPSED) {
								allIsCollapsed = false;
								break;
							}
						}
						if (allIsCollapsed) {
							this.endGame("victory");
							return;
						} else if (this.remainingPlayers.length === 0) {
							this.endGame("loss");
							return;
						}
					}
					this.endTurn();
				}, 100);
			}, 200);
		},
		getPositionsInRange(center, range) {
			let positions = [];
			const x1 = this.getX(center);
			const y1 = this.getY(center);
			for (let y = 0; y < this.rows; y++) {
				for (let x = 0; x < this.columns; x++) {
					const distance =
						Math.min(Math.abs(x - x1), Math.abs(x + this.columns - x1)) +
						Math.min(Math.abs(y - y1), Math.abs(y + this.columns - y1));
					if (distance < range) {
						positions.push(this.getPosition(x, y));
					}
				}
			}
			return positions;
		},
	},
	created() {
		this.currentSettings = this.intendedSettings;
		//shuffle(this.intendedSettings.playerTemplates)
		//this.intendedSettings.playerTemplates[0].controller = CONTROLLER_PLAYER_MOUSE_AND_WASD
		//this.intendedSettings.playerTemplates[0].drafted = true
		//this.intendedSettings.playerTemplates[1].drafted = true
		//this.setBoard()
	},
	mounted() {
		window.addEventListener("keydown", (e) => {
			if (this.activePlayer.movesLeft > 0) {
				switch (e.key) {
					case "Enter":
						this.manuallyEndTurn(this.activePlayer);
						break;
					case "ArrowUp":
						if (
							this.activePlayer.controller ===
							CONTROLLER_PLAYER_MOUSE_AND_ARROW_KEYS
						)
							this.moveTo(this.getNeighbor(0));
						break;
					case "ArrowRight":
						if (
							this.activePlayer.controller ===
							CONTROLLER_PLAYER_MOUSE_AND_ARROW_KEYS
						)
							this.moveTo(this.getNeighbor(1));
						break;
					case "ArrowDown":
						if (
							this.activePlayer.controller ===
							CONTROLLER_PLAYER_MOUSE_AND_ARROW_KEYS
						)
							this.moveTo(this.getNeighbor(2));
						break;
					case "ArrowLeft":
						if (
							this.activePlayer.controller ===
							CONTROLLER_PLAYER_MOUSE_AND_ARROW_KEYS
						)
							this.moveTo(this.getNeighbor(3));
						break;
					case "w":
						if (
							this.activePlayer.controller === CONTROLLER_PLAYER_MOUSE_AND_WASD
						)
							this.moveTo(this.getNeighbor(0));
						break;
					case "d":
						if (
							this.activePlayer.controller === CONTROLLER_PLAYER_MOUSE_AND_WASD
						)
							this.moveTo(this.getNeighbor(1));
						break;
					case "s":
						if (
							this.activePlayer.controller === CONTROLLER_PLAYER_MOUSE_AND_WASD
						)
							this.moveTo(this.getNeighbor(2));
						break;
					case "a":
						if (
							this.activePlayer.controller === CONTROLLER_PLAYER_MOUSE_AND_WASD
						)
							this.moveTo(this.getNeighbor(3));
						break;
				}
			}
		});
	},
});

app.component("collapsi-cell", {
	props: ["tile", "state", "legal", "player", "x", "y", "home", "faceIndex"],
	template: `
		<div
			:class="classes(0)"
			:style="style"
			@click="$emit('moveIn')">
			<div v-for="(face, i) in faces"
					:class="{ back: i < faceIndex, top: i === faceIndex, side: i === faceIndex+1, bottom: i === faceIndex+2 }">
				<template v-if="face && i < faceIndex + 2">
					<icon-suit :suit="suit(i)"></icon-suit>
					<div class="pip-container">
						<div v-for="row in pips(face.value)">
							<div v-for="pip in row" :class="{pip: pip}"></div>
						</div>
					</div>
				</template>
			</div>
		</div>`,
	computed: {
		faces() {
			//if (this.has(this.faceIndex, 'floating'))
			return [...this.tile.faces, this.tile.faces[0], 0, 0];
			//return [...this.tile.faces, 0, 0, 0]
		},
		style() {
			return {
				"--y": this.y,
				"--x": this.x,
				"--color-player": this.player ? this.player.color : "var(--bg-7)",
				"--color-home": this.home ? this.home.color : "",
			};
		},
		currentFace() {
			return this.tile.faces[this.faceIndex];
		},
		nextFace() {
			if (this.tile.faces.length > this.faceIndex + 1) {
				return this.tile.faces[this.faceIndex + 1];
			}
			return null;
		},
	},
	methods: {
		classes(faceIndex) {
			return [
				...this.tile.faces[faceIndex].modifiers,
				{
					die: true,
					fallen: this.state === 2,
					weak: this.state === 1,
					legal: this.legal,
				},
			];
		},
		suit(faceIndex) {
			const mods =
				this.tile.faces[faceIndex % this.tile.faces.length].modifiers;
			if (mods.has("spades")) {
				return "spades";
			} else if (mods.has("hearts")) {
				return "hearts";
			} else if (mods.has("diamonds")) {
				return "diamonds";
			} else if (mods.has("clubs")) {
				return "clubs";
			}
			return "none";
		},
		has(faceIndex, modifierString) {
			return this.tile.faces[faceIndex].modifiers.has(modifierString);
		},
		pips(value) {
			return tiles[value].pips;
		},
	},
});

app.component("collapsi-piece", {
	props: ["player", "stopIsLegal"],
	template: `
		<div
			class="card player"
			:class="{fallen: player.fallen, highlight: stopIsLegal}"
			:style="style"
			@click="$emit('manuallyEndTurn', player)">
				<div v-if="player.movesLeft + player.movesMade >= 0" class="pip-container">
					<div v-for="row in pips">
						<div v-for="pip in row" :class="{pip: pip, empty: pip > player.movesLeft}"></div>
					</div>
				</div>
				<span v-else>?</span>
		</div>
		`,
	computed: {
		style() {
			return {
				"--x": this.player.x,
				"--y": this.player.y,
				"--color-player": this.player.color,
			};
		},
		pips() {
			return tiles[this.player.movesLeft + this.player.movesMade].pips;
		},
	},
});

app.component("input-small-number", {
	props: ["modelValue", "minValue", "maxValue"],
	emits: ["update:modelValue"],
	data() {
		return {
			correct: true,
		};
	},
	template: `
		<span>
			<button @click="update(modelValue - 1)">-</button>
			<input
				type="number"
				pattern="[0-9]*"
				inputmode="numeric"
				:value="modelValue"
				:max="maxValue"
				style="max-width: 40px"
				@input="update(parseInt($event.target.value))">
			<button @click="update(modelValue + 1)">+</button>
		</span>
		`,
	methods: {
		update(value) {
			if (isNaN(value)) {
				this.correct = false;
				return;
			}
			if (value < this.minValue) {
				value = this.minValue;
			}
			if (value > this.maxValue) {
				value = this.maxValue;
			}
			this.correct = true;
			this.$emit("update:modelValue", value);
		},
	},
});

app.component("icon-suit", {
	props: ["suit"],
	template: `
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90">
			<circle :cx="cx1" :cy="cy1" :r="r1"/>
			<circle :cx="cx2" :cy="cy1" :r="r1"/>
			<circle cx="45" cy="20" :r="r2"/>
			<path v-if="suit === 'clubs'" d="M 35 35 C 42 50, 45 80, 25 80 L 25 85 L 65 85 L 65 80 C 45 80, 48 50, 55 35 Z"/>
			<path v-if="suit === 'spades'" d="M 35 35 C 42 50, 45 80, 25 80 L 25 85 L 65 85 L 65 80 C 45 80, 48 50, 55 35 Z"/>
			<polygon :points="points"/>
		</svg>`,
	computed: {
		cx1() {
			switch (this.suit) {
				case "spades":
				case "clubs":
				case "hearts":
					return 25;
				default:
					return 45;
			}
		},
		cx2() {
			switch (this.suit) {
				case "spades":
				case "clubs":
				case "hearts":
					return 65;
				default:
					return 45;
			}
		},
		cy1() {
			switch (this.suit) {
				case "spades":
				case "clubs":
					return 50;
				case "hearts":
					return 30;
				default:
					return 45;
			}
		},
		r1() {
			switch (this.suit) {
				case "spades":
					return 16;
				case "clubs":
					return 20;
				case "hearts":
					return 21.9;
			}
		},
		r2() {
			if (this.suit === "clubs") return 20;
			return 0;
		},
		points() {
			switch (this.suit) {
				case "spades":
					return "45,0 12.5,40 77.5,40";
				case "hearts":
					return "45,85 6.6,42 45,30 83.4,42";
				case "diamonds":
					return "10,45 45,87 80,45 45,3";
				case "clubs":
					return "";
			}
		},
	},
});

app.component("custom-tooltip", {
	template: `
		<span
				:class="['tooltip', {toggled: toggled}]"
				@click="toggled = !toggled">
			<span>ⓘ</span>
			<span class="expandable"
					@click.stop><slot></slot></span>
		</span>`,
	data() {
		return {
			toggled: false,
		};
	},
});

app.component("modifier-selector", {
	props: ["allowedModifiers", "selectedModifiers", "mandatoryModifiers"],
	template: `
		<div>
			modifiers:
			<ul>
				<li v-for="mod in mandatoryModifiers">
					<custom-tooltip>{{ getTooltip(mod) }}</custom-tooltip>
					{{ mod }}
				</li>
				<li v-for="mod in [...selectedModifiers].filter(m => !mandatoryModifiers.has(m))">
					<custom-tooltip>{{ getTooltip(mod) }}</custom-tooltip>
					<button @click="$emit('removeModifier', mod)">×</button>
					{{ mod }}
				</li>
				<li>
					<select
							@change="$emit('addModifier', $event)"
							value="add:"
							:disabled="availableModifiers.length < 1">
						<option disabled>add:</option>
						<option v-for="mod in availableModifiers">{{ mod }}</option>
					</select>
				</li>
			</ul>
		</div>`,
	methods: {
		getTooltip(modifier) {
			return {
				home: "player pieces start the game on these",
				fallen: "starts the game collapsed",
				fragile: "collapses from pieces passing through",
				portal: "connects to every other portal",
				haven:
					"allows pieces to conclude their turns here as long as they didn't start them here",
				lookout:
					"pieces that start their turn here can conclude their turns freely after moving out",
				floating:
					"does not collapse unless a player is on it, needs to move, and can't",
				hazard: "collapses when a piece is on it at the end of its turn",
				spades:
					"suit meta-modifier; merely cosmetic unless assigned modifiers of its own",
				hearts:
					"suit meta-modifier; merely cosmetic unless assigned modifiers of its own",
				diamonds:
					"suit meta-modifier; merely cosmetic unless assigned modifiers of its own",
				clubs:
					"suit meta-modifier; merely cosmetic unless assigned modifiers of its own",
			}[modifier];
		},
	},
	computed: {
		availableModifiers() {
			return this.allowedModifiers.filter(
				(m) => !this.selectedModifiers.has(m),
			);
		},
	},
});

app.component("input-dice-amount", {
	props: ["modelValue"],
	emits: ["update:modelValue"],
	template: `
		<div>
			<custom-tooltip>nº of copies of this die that will be in the board, assuming the total nº of dice matches the board size</custom-tooltip>
			amount:
			<input-small-number
				:model-value="modelValue"
				@update:model-value="val => $emit('update:modelValue', val)"
				:min-value="0"
				:max-value="999"></input-small-number>
		</div>`,
});

app.component("input-presets", {
	props: [],
	template: `
		<fieldset class="standalone">
			<div v-for="(preset, i) in presets">
				<custom-tooltip>{{ preset.description }}</custom-tooltip>
				<button @click="pickPreset(preset)">{{ preset.name }}</button>
			</div>
		</fieldset>`,
	data() {
		return {
			presets: [
				{
					name: "collapsi solo 3x3",
					description:
						"collapse all dice to win by starting a turn on each of them. the spade must be collapsed last. the number on the dice determine how many moves you can make each turn. the board wraps around.",
					videoLink: "https://www.youtube.com/watch?v=5bkYmniTJfM",
					goal: "collapse_all",
					playerControllers: [CONTROLLER_PLAYER_MOUSE_AND_WASD],
					columns: 3,
					rows: 3,
					diceTypes: [
						{ amount: 1, faces: [{ value: 1 , modifiers: ["home"]}] },
						{ amount: 3, faces: [{ value: 1 }] },
						{ amount: 3, faces: [{ value: 2 }] },
						{ amount: 1, faces: [{ value: 3 }] },
						{
							amount: 1,
							faces: [{ value: 1, modifiers: ["hazard", "spades"] }],
						},
					],
				},
				{
					name: "collapsi standard 1v1 4x4",
					description:
						"beginner-friendly setup created by mark ball. the first turn you can move up to four times (click your piece to stop moving); since then you MUST move as much as the number on the die you'r on demands. dice collapse when you leave them at the start of your turn... first to be unable to move loses.",
					videoLink: "https://www.youtube.com/watch?v=6vYEHdjlw3g&t=58s",
					playerControllers: [
						CONTROLLER_PLAYER_MOUSE_AND_WASD,
						CONTROLLER_BOT_RANDOM,
					],
					columns: 4,
					rows: 4,
					diceTypes: [
						{ amount: 2, faces: [{ value: 4, modifiers: ["lookout", "home"] }] },
						{ amount: 4, faces: [{ value: 1 }] },
						{ amount: 4, faces: [{ value: 2 }] },
						{ amount: 4, faces: [{ value: 3 }] },
						{ amount: 2, faces: [{ value: 4 }] },
					],
				},
				{
					name: "collapsi standard 1v1 6x6",
					description:
						"recommended vanilla setup for collapsi, created by mark ball. the first turn you can move up to four times (click your piece to stop moving); since then you MUST move as much as the number on the die you'r on demands. dice collapse when you leave them at the start of your turn... first to be unable to move loses.",

					playerControllers: [
						CONTROLLER_PLAYER_MOUSE_AND_WASD,
						CONTROLLER_BOT_RANDOM,
						CONTROLLER_BOT_RANDOM,
						CONTROLLER_BOT_RANDOM,
					],
					diceTypes: [
						//{ amount: 2, setSuit: true, faces: [{value: 1, modifiers: ['fallen']}] },
						{ amount: 4, faces: [{ value: 4, modifiers: ["lookout", "home"] }] },
						{ amount: 8, faces: [{ value: 1 }] },
						{ amount: 8, faces: [{ value: 2 }] },
						{ amount: 8, faces: [{ value: 3 }] },
						{ amount: 8, faces: [{ value: 4 }] },
					],
				},
				{
					name: "bot battle royale 12x8",
					description:
						"the maximum amount of automated players compete for the user's amusement on a very fragile board.",

					numberOfPlayers: 9,
					playerControllers: [
						CONTROLLER_BOT_RANDOM,
						CONTROLLER_BOT_RANDOM,
						CONTROLLER_BOT_RANDOM,
						CONTROLLER_BOT_RANDOM,
						CONTROLLER_BOT_RANDOM,
						CONTROLLER_BOT_RANDOM,
						CONTROLLER_BOT_RANDOM,
						CONTROLLER_BOT_RANDOM,
						CONTROLLER_BOT_RANDOM,
					],
					columns: 12,
					rows: 8,
					diceTypes: [
						{
							amount: 9,
							setSuit: true,
							faces: [{ value: 4, modifiers: ["lookout", "home"] }],
						},
						{
							amount: 64,
							faces: [{ value: 3, modifiers: ["fragile"] }],
						},
						{
							amount: 23,
							setSuit: true,
							faces: [{ value: 1, modifiers: ["fallen"] }],
						},
					],
				},
				{
					name: "hazard toggle",
					description: `leaving dice makes them ♠hazardous♠, but leaving ♠hazardous♠ dice makes them safe again. ending a turn on a ♠hazardous♠ die is the only way to collapse it.`,
					playerControllers: [
						CONTROLLER_PLAYER_MOUSE_AND_WASD,
						CONTROLLER_BOT_RANDOM,
						CONTROLLER_BOT_RANDOM,
						CONTROLLER_BOT_RANDOM,
					],
					diceTypes: [
						{
							amount: 4, 
							faces: [
								{ value: 3, modifiers: ["fragile", "home"] },
								{
									value: 7,
									modifiers: ["fragile", "floating", "hazard", "spades"],
								},
							],
						},
						{
							amount: 32,
							faces: [
								{ value: 3, modifiers: ["fragile"] },
								{
									value: 7,
									modifiers: ["fragile", "floating", "hazard", "spades"],
								},
							],
						},
					],
				},
				{
					name: "collapsi glider",
					description: `collapsi except you can move through "collapsed" tiles (represented by spades). just don't end your turn on them!`,

					playerControllers: [
						CONTROLLER_PLAYER_MOUSE_AND_WASD,
						CONTROLLER_BOT_RANDOM,
						CONTROLLER_BOT_RANDOM,
						CONTROLLER_BOT_RANDOM,
					],
					diceTypes: [
						{
							amount: 4,
							faces: [
								{ value: 4, modifiers: ["lookout", "home"] },
								{ value: 7, modifiers: ["floating", "hazard", "spades"] },
							],
						},
						{
							amount: 8,
							faces: [
								{ value: 1 },
								{ value: 7, modifiers: ["floating", "hazard", "spades"] },
							],
						},
						{
							amount: 8,
							faces: [
								{ value: 2 },
								{ value: 7, modifiers: ["floating", "hazard", "spades"] },
							],
						},
						{
							amount: 8,
							faces: [
								{ value: 3 },
								{ value: 7, modifiers: ["floating", "hazard", "spades"] },
							],
						},
						{
							amount: 8,
							faces: [
								{ value: 4 },
								{ value: 7, modifiers: ["floating", "hazard", "spades"] },
							],
						},
					],
				},
				{
					name: "hazard memory",
					description: `every time you walk out of a tile, it flips... it still looks the same, but it's hazardous until it's walked over again: if you end your turn on a hazardous tile, it collapses.`,
					playerControllers: [
						CONTROLLER_PLAYER_MOUSE_AND_WASD,
						CONTROLLER_BOT_RANDOM,
						CONTROLLER_BOT_RANDOM,
						CONTROLLER_BOT_RANDOM,
					],
					diceTypes: [
						{
							amount: 4,
							faces: [
								{ value: 4, modifiers: ["lookout", "home"] },
								{ value: 4, modifiers: ["floating", "hazard"] },
							],
						},
						{
							amount: 8,
							faces: [
								{ value: 1, modifiers: ["fragile"] },
								{ value: 1, modifiers: ["floating", "hazard", "fragile"] },
							],
						},
						{
							amount: 8,
							faces: [
								{ value: 2, modifiers: ["fragile"] },
								{ value: 2, modifiers: ["floating", "hazard"] },
							],
						},
						{
							amount: 8,
							faces: [
								{ value: 3, modifiers: ["fragile"] },
								{ value: 3, modifiers: ["floating", "hazard"] },
							],
						},
						{
							amount: 8,
							faces: [
								{ value: 4, modifiers: ["fragile"] },
								{ value: 4, modifiers: ["floating", "hazard"] },
							],
						},
					],
				},
			],
		};
	},
	methods: {
		colors() {
			let arr = [
				"red",
				"green",
				"blue",
				"cyan",
				"pink",
				"yellow",
				"lilac",
				"orange",
				"grey",
			];
			shuffle(arr);
			return arr;
		},
		emptySettings() {
			return {
				name: "unknown preset",
				randomizeTurnOrder: true,
				randomPlacement: true,
				description: "?",
				tileSize: 60,
				numberOfPlayers: 2,
				playerControllers: [
					CONTROLLER_PLAYER_MOUSE_AND_WASD,
					CONTROLLER_BOT_RANDOM,
				],
				players: [],
				goal: "last_one_standing",
				rows: 6,
				columns: 6,
				suitModifiers: {
					spades: new Set(),
					hearts: new Set(),
					diamonds: new Set(),
					clubs: new Set(),
				},
				diceTypes: [],
			};
		},
		pickPreset(preset) {
			preset = JSON.parse(JSON.stringify(preset));

			let settings = {
				...this.emptySettings(),
				...preset,
			};

			// simple overrides
			for (const key of [
				"name",
				"description",
				"rows",
				"columns",
				"numberOfPlayers",
				"homeDiceType",
			]) {
				if (preset.hasOwnProperty(key)) {
					settings[key] = preset[key];
				}
			}

			if (preset.suitModifiers) {
				for (let suitName in suitModifiers) {
					settings.suitModifiers[suitName] = new Set(
						preset.suitModifiers[suitName],
					);
				}
			}

			if (!preset.diceTypes.length) {
				preset.diceTypes.push({});
			}
			for (const diceType of preset.diceTypes) {
				this.fixDiceType(diceType);
			}
			settings.diceTypes = preset.diceTypes;

			settings.playerTemplates = [];
			const colors = this.colors();
			for (let i = 0; i < colors.length; i++) {
				const color = colors[i];
				let playerTemplate = {
					name: color,
					color: `var(--${color})`,
				};
				if (settings.playerControllers.length > i) {
					playerTemplate.drafted = true;
					playerTemplate.controller = settings.playerControllers[i];
				} else {
					playerTemplate.drafted = false;
					playerTemplate.controller = CONTROLLER_BOT_RANDOM;
				}
				settings.playerTemplates.push(playerTemplate);
			}

			this.$emit("pickPreset", settings);
		},
		fixDiceType(diceType) {
			if (
				typeof diceType !== "object" ||
				Array.isArray(diceType) ||
				diceType === null
			) {
				diceType = {};
			}
			for (const key in this.defaultDiceType) {
				if (!diceType.hasOwnProperty(key)) {
					diceType[key] = this.defaultDiceType[key];
				}
			}
			if (!diceType.faces) {
				diceType.faces = [];
			}
			if (!diceType.faces.length) {
				diceType.faces.push({ value: 1, modifiers: [] });
			}
			for (const face of diceType.faces) {
				face.modifiers = new Set(face.modifiers);
			}
			if (!diceType.hasOwnProperty("amount")) {
				diceType.amount = 1;
			}
			return diceType;
		},
	},
	created() {
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has("preset")) {
			const presetIndex = parseInt(urlParams.get("preset"));
			if (presetIndex >= 0 && presetIndex < this.presets.length) {
				this.pickPreset(this.presets[presetIndex]);
				return;
			}
		}
		this.pickPreset(this.presets[0]);
	},
	computed: {
		defaultDiceType() {
			return {
				setSuit: false,
				suitIsInherited: true,
			};
		},
	},
});

app.mount("#app");
