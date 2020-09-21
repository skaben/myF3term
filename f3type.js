// Полезные вспомогательные функции

function isAlpha(c) {
	const alphas = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	return (alphas.indexOf(c) != -1);
}

function isDigit(c) {
	const digits = "0123456789";
	return (digits.indexOf(c) != -1);
}

function isAlphaNum(c) {
	return (isAlpha(c) || isDigit(c));
}

function getRandomInt(min, max) {
	const lMin = Math.ceil(min);
	const lMax = Math.floor(max);
	return Math.floor(Math.random() * (lMax - lMin + 1)) + lMin; //Максимум и минимум включаются
}

function pad(num, size) {
    let s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function compareWords(word, passWord) {
	let count = 0;
	for (let i = 0; i < passWord.length; i++) {
		if (passWord[i] == word[i]) {
			count++;
		}
	}
	return count;
}

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
	  let j = Math.floor(Math.random() * (i + 1));
	  [array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

export default class gameHackTerminal {
	numRows = 16;
	numChars = 16;
	grbChars = ["~", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+",
					"-", "=", "?", "|", ".", ",", "!", "&lt;", "&gt;", "{", "}", "[", "]"];
	leftBrackets = ["(", "[", "{", "&lt;"];
	rightBrackets = [")", "]", "}", "&gt;"];

	
	constructor ({
		gameData = {	// То, что передаётся из приложения на Питоне.
			password: 'AARDVARK',
			numTries: 4,
			timeOut: 600,		// Счетчик обратного отсчёта, секунды. 0 - нет отсчёта. 
			chanceTries: 0.2, 	// Вероятность при чите восстановить попытки
			falseWords: ['DESCRIBE', 'LINGERIE', 'MCMILLEN', 'OPPERMAN', 'PAVEMENT', 'QUANTITY', 'REVERENT'],
			header: '<BR>ROBCO INDUSTRIES 2077<BR>SMART TERMINAL V 100.77<BR>',
			footer: 'FALLOUT TERMINAL'
		}
	} = {}) {
		this.timeОut = gameData.timeOut;
		this.password = gameData.password;
		this.chanceTries = gameData.chanceTries; 
		this.numTries = gameData.numTries; 	// Эталонное висло попыток
		this.tries = gameData.numTries;		// Рабочее (текущее) число попыток
		this.falseWords = gameData.falseWords;
		this.lenWord = gameData.password.length; // Длина слова
		this.numWords = gameData.falseWords.length + 1; // Длина списка слов + пароль
		this.passPos = getRandomInt(0, this.numWords - 1); // Позиция пароля в списке слов
		this.serviceTxt = ["<br>", "<br>", "<br>", "<br>", "<br>", "<br>", "<br>", "<br>", 
								"<br>", "<br>", "<br>", "<br>", "<br>", "<br>", "<br>", "<br>" ];
		this.numGarbage = 2 * (this.numRows * this.numChars); // Общий размер игрового поля
		this.leftCheat = -1; 	// Позиция найденного чита начало
		this.rightCheat = -1;	// Позиция найденного чита конец
		this.wordList = [];		// Список слов вместе с паролем
		this.grbStrTagged = [];	// "Мусорная" строка с тэгами
		this.grbStrClear = [];	// "Мусорная" строка в чистом виде посимвольно
		this.posWords = [];		// Позиции слов внутри мусорной строки
		this.numGarbage = this.numRows * this.numChars *2; // Размер мусорной строки
		this.leftIdx = '';	// Левое поле индекса (адреса)
		this.rightIdx = '';	// Правое поле индекса (адреса)
		this.leftTxt = '';	// Левое поле текста
		this.rightTxt = ''; // Правое поле текста

		this.header = gameData.header;

		this.element = document.querySelector(".screen__content"); // Основной элемент интерфейса
		
		this.render();
		
	}

	template() {
		return `
		<div class="interface">
			<div class="interface_header typewriter">
			${this.header}
			-----
			</div>
			<div class="timer"></div>
			<div class="interface_content">
			<div class="idx left_idx">${this.leftIdx}</div>
			<div class="content_left">${this.leftTxt}</div>
			<div class="idx right_idx">${this.rightIdx}</div>
			<div class="content_right">${this.rightTxt}</div>
			<div class="content_service">
				<div class="cursor">${"<br>".repeat(15)} > </div>
				<div class="service" data-element="log">${"<br>".repeat(16)}</div>
			</div>
			</div>
		</div>
		`
	}

	typewriter(typeElement, addText, delay) {
		let text = typeElement.innerHTML + addText;
		let kbFlag = 0;
		typeElement.innerHTML = '';
		document.addEventListener('keydown',function keyDelay(event) {
			if((event.code === 'Enter' || 
				event.code === 'NumpadEnter' ||
				event.code === 'Space') && ! kbFlag) {
				kbFlag = 1;
				delay = delay/4;
			}
		})
		setTimeout(function typeFunc() {
			let tmpTxt = text[0];
			if (tmpTxt === "<") {
				while(text[0] != '>') {
					text = text.substr(1);
					tmpTxt += text[0];
				}
			}
			typeElement.innerHTML += tmpTxt;
			text = text.substr(1);
			if (text.length != 0) {
				setTimeout(typeFunc, delay);
			} else {
				document.removeEventListener('keydown', function keyDelay(event){});
			}
		}, delay)
	}

	render() {
		this.element.innerHTML = this.template();
		this.typewriter(this.element.querySelector(".typewriter"), "tridvaras", 100);
	}	


};

