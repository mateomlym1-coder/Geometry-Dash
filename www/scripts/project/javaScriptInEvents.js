

const scriptsInEvents = {

	async Gameev_Event21(runtime, localVars)
	{
		//----------------------------------------------------------------------------------
		
		// recursive function, be careful!
		function calculateZValuesRecursively (obj, parentZValue, recursiveDepth) 
		{	
			obj.instVars.zValue = parentZValue + obj.instVars.zChildOrderIndex / 10 ** recursiveDepth;
			
			// for all relevant children
			for (const child of obj.children())
			{	
				// check that child is part of zOrder
				if (!child.objectType.isInFamily(zOrderType)) continue
		
				// call a recursive fucntion which will continue for that child's children, etc.
				calculateZValuesRecursively(child, obj.instVars.zValue, recursiveDepth + 1);
			}
		}
		
		//----------------------------------------------------------------------------------
		
		// var which determines what the top level parent has for zValue
		let zIndex = 0;
		
		const zOrderType = runtime.objects.zOrder;
		
		// get instances, sorted by y order
		const sortedList = zOrderType.getPickedInstances().sort((a, b) => a.y - b.y);
		
		// for each instance
		for (const inst of sortedList)
		{
			// get parent, for testing
			const parent = inst.getParent(); // will be null if not existing
			
			// test that this object doesn't have a zOrder parent
			if (parent && parent.objectType.isInFamily(zOrderType)) continue;
			
			// set off the recursive function that goes through the hierarchy using this parent
			calculateZValuesRecursively(inst, zIndex, 0);
				
			// increment
			zIndex++;
		}
		
		//----------------------------------------------------------------------------------
		
		// once all is done, use the system 'sort Z order' which uses the zValue inst var
		//runtime.sortZOrder(sortedList, (a, b) => a.instVars.zValue - b.instVars.zValue);
		
		//----------------------------------------------------------------------------------
	},

	async Gameev_Event198(runtime, localVars)
	{

	},

	async Gameev_Event199(runtime, localVars)
	{
		const cobbs = runtime.objects.cobb.getAllInstances();
		// const blastFurnaces = runtime.objects.blastFurnace.getAllInstances();
		
		for (const instA of cobbs) {
		    for (const instB of cobbs) { //push coobs away from each other
		
		        if (instA.uid === instB.uid) continue;
		        separate(instA, instB)
		    }
		
			/*for (const instB of blastFurnaces){ //push cobbs away from blastFurnaces
				separateStaticB(instA, instB, 128)
			}*/
		}
		
		function separate(instA, instB, distance = 64){ //circle separation, moves both evenly
			let dx, dy, d;
			dx = instB.x - instA.x;
			dy = instB.y - instA.y;
			d = Math.sqrt(dx * dx + dy * dy);
			if (d > distance) return;
			dx /= d;
			dy /= d;
			d = Math.max(0, distance - d) * 0.5;
			dx *= d;
			dy *= d;
			instA.offsetPosition(-dx, -dy);
			instB.offsetPosition(dx, dy);
		}
		/*
		function separateStaticB(instA, instB, distance = 64){ //circle separation, doesn't move instanceB
			let dx, dy, d;
			dx = instB.x - instA.x;
			dy = instB.y - instA.y;
			d = Math.sqrt(dx * dx + dy * dy);
			if (d > distance) return;
			dx /= d;
			dy /= d;
			d = Math.max(0, distance - d);
			dx *= d;
			dy *= d;
			instA.offsetPosition(-dx, -dy);
		}
		*/
	},

	async Globalev_Event29(runtime, localVars)
	{
		if (navigator.keyboard) {
		  const keyboard = navigator.keyboard;
			keyboard.getLayoutMap().then((keyboardLayoutMap) => {
			globalThis.keyboardLayoutMap = keyboardLayoutMap;
		  });
		}
	},

	async Globalev_Event30_Act1(runtime, localVars)
	{
		const keyCode = globalThis.binds.kbm[localVars.actionName][localVars.index]
		let keyString = ""
		
		if (globalThis.keyboardLayoutMap){ //was able to get input map
			keyString = globalThis.keyboardLayoutMap.get(keyCode)
			}
		
		if (keyString === "" || !keyString){ //if invalid use the physical key instead
			keyString = keyCode.replace("Key", "").replace("Digit", "");
		}
		
		keyString.toString()
		
		//uppercase single letter keyStrings otherwise it would return "d" instead of "D"
		if (keyString.length == 1) {
			keyString = keyString.toUpperCase();
		}
		
		runtime.setReturnValue(keyString)
	},

	async Globalev_Event36(runtime, localVars)
	{
		// init keybbinds, these could be fetched from a file or saveState for custom keybinds
		
		globalThis.binds = {
		    "kbm": {
			//using physical event CODE values, useful checker: https://keyjs.dev/
			//Mouse buttons are handled with button indices e.g. left-click = 0, middle = 1, right = 2...
		        "up": ["KeyW", "ArrowUp"],
				"down": ["KeyS", "ArrowDown"],
				"left": ["KeyA", "ArrowLeft"],
				"right": ["KeyD", "ArrowRight"],
				"select": ["KeyE", "Space", "Enter", 0],
				"back": ["Escape", "KeyP"]
		    },
			"gamepad": { 
			//0 = A, 1 = B, 2 = X, 3 = Y, 4 = L-SHOULDER, 5 = R-SHOULDER, 6 = L-TRIGGER, 7 = R-TRIGGER, 8 = SELECT, 9 = MENU, 
			//10 = L-STICK Press, 11 = R-STICK Press, 12 = D-PAD UP, 13 = D-PAD DOWN, 14 = D-PAD LEFT, 15 = D-PAD RIGHT
				"up": [12],
				"down": [13],
				"left": [14],
				"right": [15],
				"select": [0],
				"back": [1, 9]
			}
		};
	},

	async Globalev_Event38(runtime, localVars)
	{
		const binds = globalThis.binds;
		
		//check keyboard and mouse
		for (const code of binds.kbm[localVars.action]) {
		
		    if (typeof code === 'number') { //if it's number is mouse button index
		
		        if (runtime.mouse.isMouseButtonDown(code)) {
		            runtime.setReturnValue(1)
		        }
		
		    } else if (runtime.keyboard.isKeyDown(code)) {
		        runtime.setReturnValue(1)
		    }
		}
		//check gamepad, there is no scripting interface in the LTS (available in beta), so going through an event sheet function for now
		for (const code of binds.gamepad[localVars.action]) {
		
		    if (runtime.callFunction("isGamepadButtonDown", code)) {
		        runtime.setReturnValue(1)
		    }
		
		}
	},

	async Utilsev_Event4_Act2(runtime, localVars)
	{
		// constants
		const a = 1103515245; 		// multiplier
		const c = 12345;			// constant (consider large prime numbers)
		const m = 2 ** 31;			// modulus (the random value is mod + divided by this large value)
		
		// generate random number
		runtime.globalVars.randomSeed = (a * runtime.globalVars.randomSeed + c) % m;
		
		// map random number to 0-1
		const randNum = runtime.globalVars.randomSeed / m;
		
		// return function value
		localVars.value = randNum;
	}
};

globalThis.C3.JavaScriptInEvents = scriptsInEvents;
