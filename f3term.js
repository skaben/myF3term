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

  subElements = {};
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
			header: '(C) ROBCO INDUSTRIES 2077<br>RTOS V 12.0.5 DEBUG MODE',
			footer: 'RTOS (C) ROBCO INDUSTRIES 2077 DEBUG ACCOUNT MODE'
		}
	} = {}) {
		this.headText = gameData.header;
		this.footText = gameData.footer;
		this.timer = gameData.timeOut;
		this.password = gameData.password;
		this.endType = 0;
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
		this.subElements = [];
		this.numGarbage = this.numRows * this.numChars *2; // Размер мусорной строки
		this.leftIdx = '';	// Левое поле индекса (адреса)
		this.rightIdx = '';	// Правое поле индекса (адреса)
		this.leftTxt = '';	// Левое поле текста
		this.rightTxt = ''; // Правое поле текста
		// Заполняем массивы
		this.wordList = this.initWordList(this.passPos, gameData.password, this.numWords, gameData.falseWords);
		this.posWords = this.initWordPos(this.numRows, this.numChars, this.numWords, this.lenWord);
		this.grbStrClear = this.initGrbClear(this.numGarbage, this.posWords, this.lenWord, this.wordList, this.grbChars);
		this.grbStrTagged = this.initGrbTagged(this.grbStrClear, this.wordList);
		[this.leftIdx, this.rightIdx] = this.initIdx(this.numRows, this.numChars);
		[this.leftTxt, this.rightTxt] = this.initTxt(this.numRows, this.numChars, this.grbStrTagged);

		this.render();
		this.initEventListeners();
	}

	initEventListeners() {
		this.element.addEventListener("pointerover", this.onHover);
		this.element.addEventListener("pointerout", this.onOut);
		this.element.addEventListener("pointerdown", this.onClick);
		this.element.addEventListener("gameOver", this.gameOver);
	}

	dummy() {
		return false;
	}

	onClick = (event) => {
		let curElem = event.target;	// Текущий элемент, на котором кликнули current element
		if (curElem.className.indexOf('word') >=0 ) { 	// Кликнули на слово
			this.clickOnWord(curElem);
		} else if (curElem.className.indexOf('char') >=0 ){ // Кликнули на символ
			this.clickOnChar(curElem);
		}
	}

	onOut = (event) => {
		let curElem = event.target; 			// Текущий, current element, с которого ушла мышь
		curElem.classList.remove('highlight');	// Перекрашиваем его в нормальный цвет по факту ухода
		if (this.leftCheat >=0 || this.rightCheat >= 0) {
			for (let i = this.leftCheat; i <= this.rightCheat; i++) { // Мы красили ранее чит и ушли с него! Покрасим его обратно.
				this.subElements[`idx-${i}`].classList.remove('highlight');
			}
			this.leftCheat = -1;	// Левая граница чита глобально - ушли с чита, значит вовзращаем индесы на место
			this.rightCheat = -1;	// Правая граница чита глобально - ушли с чита, значит вовзращаем индесы на место
		}
		if (curElem.className == "word") {
			this.delTmpServiсe(this.subElements.log);
		}
	}

	onHover = (event) => {
		let curElem = event.target; 		// Текущий, current element, на который пришла мышь
		let prevElem = event.relatedTarget;	// Предыдущий, previous element, с которого ушла мышь
		if (curElem.className === 'char' || curElem.className === 'word') {
			if (prevElem != null) { // Предыдущий элемент, с которого ушли, не пустой.
				if (prevElem.className === 'char' || prevElem.className === 'word') {
					prevElem.classList.remove('highlight'); // Если ушли со слова или знака - перекрасим в нормальный стиль.
				}
			}
			if (curElem.className === 'char') {
				[this.leftCheat, this.rightCheat] = this.checkCheat(curElem);
				if (this.leftCheat >= 0 && this.rightCheat >= 0) {
					for (let i = this.leftCheat; i <= this.rightCheat; i++) {
						// this.subElements[`idx-${i}`].classList.toggle('highlight');
						this.subElements[`idx-${i}`].classList.add('highlight');
					}
				}
			} else { // Выбрали слово
				// document.getElementById('sel_word').play();
				this.addTmpServiсe(this.subElements.log, curElem.dataset.element);
			}
			curElem.classList.add('highlight');
		}
	}

	clickOnWord(wordElement) {
		const curId = wordElement.dataset.element;
		const numLetters = compareWords(curId, this.password); // Сравниваем выбранное слово с паролем по буквам
		if (numLetters == this.lenWord)  { // Слово свопало с паролем
			this.element.dispatchEvent(new CustomEvent("timeCntrl", {
				detail: { bubbles: true, time: this.timer, cntrl: "stop", gameOver: this.gameOver, elems: this.elements }   
			}));
			this.element.dispatchEvent(new CustomEvent("gameOver", {
				detail: { bubbles: true, result: "Win", string: "ACCESS GRANTED"}   
			}));
		} else { // Слово не совпало с паролем
			this.tries--;	// Уменьшаем число попыток
			this.numTriesShow(this.tries);	// Отображаем уменьшенный результат
			if (this.tries == 0) { // Все попытки исчерпаны
				this.element.dispatchEvent(new CustomEvent("timeCntrl", {
					detail: { bubbles: true, time: this.timer, cntrl: "stop", gameOver: this.gameOver, elems: this.elements }   
				}));
				this.element.dispatchEvent(new CustomEvent("gameOver", {
					detail: { bubbles: true, result: "Lose", string: "Tries is over!"}   
				}));
			}
			this.delTmpServiсe(this.subElements.log);
			this.addServiсe(this.subElements.log, `${curId} <br> ${numLetters} of ${this.lenWord}<br>`); 
		}
	}

	clickOnChar(charElement) {
		let i = 0;
		let flag = 0;
		const chance = Math.random();
		if (this.leftCheat >= 0 && this.rightCheat >= 0) { // Кликнули на скобке и ранее обнаружен удачный чит
			for (i = this.leftCheat; i <= this.rightCheat; i++) {
				this.subElements[`idx-${i}`].innerHTML = '.';
				this.subElements[`idx-${i}`].classList.remove('highlight');
				this.grbStrClear[i] = '.';
			}
			if (chance <= this.chanceTries) { 	// Повезло. восстанавливаем попытки!
				this.tries = this.numTries;
				this.numTriesShow(this.tries);	// Отображаем результат
				this.addServiсe(this.subElements.log, "Tries restored!<br>");
			} else { // Убираем слово-заглушку
				const dWord = this.selectDummyWord();
				if (dWord === undefined) { 		// Слова кончились, восстанавливаем попытки!
					this.tries = this.numTries;
					this.numTriesShow(this.tries);	// Отображаем результат
				}
			}
		}
	}

	selectDummyWord() {
		const idxDumb = getRandomInt(0, this.falseWords.length-1);	// Выбираем случайное слово - не пароль.
		let wordSel = this.subElements[`${this.falseWords[idxDumb]}`];
		let i = 0, flag = 0;
		if (wordSel === undefined) { // Кончились "заглушки"
			return undefined;
		} else {
			this.falseWords.splice(idxDumb, 1);	// Удаляем выбранное слово из массива.
			let newWord = '';
			this.addServiсe(this.subElements.log, "DUMMY REMOVED!<br>");
			for (i = 0; i < wordSel.innerHTML.length; i++) {	// Перебираем выбранное слово посимвольно.
				if (flag == 0 && wordSel.innerHTML[i] == '<') { // Нашли тэг <br>, выставляем флаг, что надо копировать тэг.
					flag = 1;
					newWord += wordSel.innerHTML[i];
					continue;
				}
				if (flag == 1 && wordSel.innerHTML[i] == '>') { // Тэг закончился, скопировн, флаг обнулили.
					newWord += wordSel.innerHTML[i];
					flag = 0;
					continue;
				}
				if (flag == 1) { // Копируем тэг без изменений в новое "слово".
					newWord += wordSel.innerHTML[i];
					continue;
				}
				newWord += '<span data-element=\"dot\" class=\"char\">.</span>'; // Все символы в слове, кроме тэга, заменяем точками.
			}
			wordSel.innerHTML = newWord; 	// Заменили в документе слово точками.
			wordSel.dataset.element = ''; 	// Обнулили ID
			return wordSel;
		}
	}

	checkCheat(cheatElement) {
		let left = -1, right = -1; // Левая и правая границы чита
		const curId = cheatElement.dataset.element.slice(4); // Позиция в массиве grb_str_clear
		const leftBorder = Math.floor(curId / this.numChars) * this.numChars; // Левая граница строки
		const rightBorder = leftBorder + this.numChars;	// Правая граница строки
		let leftIdx = this.leftBrackets.indexOf(this.grbStrClear[curId]); 	// Проверяем, является ли символ левой скобкой
		let rightIdx = this.rightBrackets.indexOf(this.grbStrClear[curId]);	// Проверяем, является ли символ правой скобкой
		if (leftIdx >= 0) { // Символ  - левая скобка
			let rightBrk = this.rightBrackets[leftIdx]; // Выбираем к ней правую пару
			[left, right] = this.selectCheat(curId, rightBorder, rightBrk);
		} else if (rightIdx >= 0) { // Это правая скобка
			let leftBrk = this.leftBrackets[rightIdx]; // Выбираем к ней левую пару
			[left, right] = this.selectCheat(curId, leftBorder, leftBrk);
		}
		return [left, right];
	}

	selectCheat(startPos, endPos, bracket) { // Проверяем чит.
		if (startPos < endPos) {
			for(let i = startPos; i < endPos; i++) {
				switch (this.checkCharCheat(i, bracket)) {
					case -1: return [-1, -1];		// Cлово
					case 1:  return [startPos, i]; 	// Чит
				}
			}
		} else {
			for(let i = startPos; i > endPos; i--) {
				switch (this.checkCharCheat(i, bracket)) {
					case -1: return [-1, -1];		// Cлово
					case 1: return [i, startPos]; 	// Чит
				}
			}
		}
		return [-1, -1]; // Не нашли.
	}

	checkCharCheat(i, bracket) {
		if (isAlpha(this.grbStrClear[i])) {
			return (-1); // Слово. Точно нет чита
		} else if (this.grbStrClear[i] === bracket) {
			return (1); // Чит
		} else {
			return (0); // Не символ, возможно чит дальше
		}
	}

	initWordList(passPos, pwd, numWords, falseWords) { // Генерация массива слова и пароля вместе
		let wList = [];
		let i = 0, j = 0;
		for (i = 0; i < numWords; i++) { // Генерируем
			if (i == passPos) {
				wList[i] = pwd;
			} else {
				wList[i] = falseWords[j++];
			}
		}
		return (shuffleArray(wList)); // Перемешать и вернуть
	}

	initWordPos(numRows, numChars, numWords, lenWord) {
		const deltaWords = 2*(numRows*numChars)/numWords; // "Диапазон" внутри мусорный строки для размещения каждого слова
		let wPos = [];
		let i = 0;
		for (i = 0; i < numWords; i++) {
			wPos[i] = getRandomInt(i * deltaWords, (i + 1) * deltaWords - lenWord - 1); // Не доходя до конца диапазона на 1
		}
		return wPos;
	}

	initGrbClear(numGarbage, posWords, wordLen, wordList, grbChars) {
		let grbStr = [];
		let i = 0, j = 0, wordFlag = 0;
		const grbLen = grbChars.length;
		for (i = 0; i < numGarbage; i++) {
			if (posWords.includes(i) || (wordFlag > 0 && wordFlag < wordLen)) { // Дошли до слова, но ещё не конец
				grbStr[i] = wordList[j].slice(wordFlag,wordFlag+1); // Добавляем слово посимвольно
				wordFlag++;
				continue;
			} else if (wordFlag === wordLen) { // Всё, конец слова!
				j++;
				wordFlag=0;
			}
			grbStr[i] = grbChars[getRandomInt(0, grbLen - 1)];
		}
		return grbStr;
	}

	initGrbTagged(grbChars, wordList) {
		let i = 0, j = 0, wordFlag = 0, charFlag = 0, tLast = '';
		let grbTagged = [];
		grbChars.forEach(character => {
			charFlag = isAlpha(character);
			if(charFlag && wordFlag === 0) { // Начали слово
				grbTagged.push(`<span class=\"word\" data-element=\"${wordList[j]}\">${character}`);
				wordFlag = 1;
				j++;
			} else if (charFlag && wordFlag > 0) {
				grbTagged.push(`${character}`);
			} else if (wordFlag > 0) {
				wordFlag = 0;
				grbTagged.push(grbTagged.pop() + "</span>");
				grbTagged.push(`<span class=\"char\" data-element=\"idx-${i}\">${character}</span>`);
			} else {
				grbTagged.push(`<span class=\"char\" data-element=\"idx-${i}\">${character}</span>`);
			}
			i++;
		});
		return grbTagged;
	}

	initIdx(numRows, numCols) {
		let i = 0;
		let left = '', right = '';
		let startIdx = getRandomInt(0x1000,0xFFFF-513);
		for (i = 0; i < numRows; i++) {
			left += '0x' + startIdx.toString(16).toUpperCase() + '<br>';
			right += '0x' + (startIdx + numRows * numCols).toString(16).toUpperCase() + '<br>';
			startIdx += numCols;
		}
		return [left, right];
	}

	initTxt(numRows, numCols, grbTag) {
		let i = 0, j = 0;
		let left = '', right = '';
		for (i = 0; i < numRows; i++) {
			for (j = 0; j < numCols; j++) {
				left += grbTag[i * numCols + j];
				right += grbTag[(i + numCols) * numCols + j];
			}
			left += "<br>";
			right += "<br>";
		}
		return [left, right];
	}

	get template() {
		return `
		<div class="interface">
			<div class="interface_head" data-element="header">
				<p>${this.headText}<br>-------------</p>
			</div>
			<div data-element="tries"><br>TRIES LEFT: <span data-element="numTries">${"* ".repeat(this.tries)}</span><br></div>
			<div class="timer" data-element="timer"></div>
			<div class="interface_content" data-element="body">
				<div class="idx left_idx">${this.leftIdx}</div>
				<div class="content_left">${this.leftTxt}</div>
				<div class="idx right_idx">${this.rightIdx}</div>
				<div class="content_right">${this.rightTxt}</div>
				<div class="content_service">
					<div class="cursor">${"<br>".repeat(15)} &gt; </div>
					<div class="service" data-element="log">${"<br>".repeat(16)}</div>
				</div>
			</div>
			<div class="interface_foot" data-element="footer">
				<p>${this.footText}</p>
			</div>			
		</div>
		`
	}
	
	async render() {
    const element = document.createElement('div');
		element.innerHTML = this.template;
		this.element = element.firstElementChild;
		this.subElements = this.getSubElementsByData(this.element);
		
		let tmpHead = this.subElements.header.innerHTML
		this.subElements.header.innerHTML = '';
		let tmpFooter = this.subElements.footer.innerHTML
		this.subElements.footer.innerHTML = '';

		this.subElements.body.classList.add('hide');
		this.subElements.timer.classList.add('hide');
		this.subElements.tries.classList.add('hide');

		const headerType = () => this.typewriter(this.subElements.header, tmpHead, 100, footerType);
		const footerType = () => this.typewriter(this.subElements.footer, tmpFooter, 100, bodyType);
		const bodyType = () => {
			this.subElements.body.classList.remove('hide');
			this.subElements.timer.classList.remove('hide');
			this.subElements.tries.classList.remove('hide');
			this.element.addEventListener("timeCntrl", this.timerUse);
			this.element.dispatchEvent(new CustomEvent("timeCntrl", {
				detail: { bubbles: true, time: this.timer, cntrl: "start" }   
			}));

		}
		headerType();
		return this.element;
	}

	timerUse = (event) => { 
		let time = event.detail.time;
		const attr = event.detail.cntrl;
		const field = event.target;
		const timerField = this.subElements.timer;
		if (time <= 0) {
			field.innerHTML = "";
		} else {
			let timerFunc = setInterval(function () {
				let seconds = time % 60,
					minutes = time / 60 % 60,
					hour = time / 60 / 60 % 60;
				if (attr === 'stop') {
					clearInterval(timerFunc);
					timerField.innerHTML = "";
					timerField.remove();
				}
				if (time <= 0) {
					clearInterval(timerFunc);
					timerField.innerHTML = "";
					field.dispatchEvent(new CustomEvent("gameOver", {
						detail: { bubbles: true, result: "Lose", string: "Time is over!"}   
					}));
					timerField.remove();
				} else { 
					let strSec = pad(parseInt(seconds, 10).toString(), 2);
					let strMin = pad(parseInt(Math.trunc(minutes), 10).toString(), 2);
					let strHour = pad(parseInt(Math.trunc(hour), 10).toString(), 2);
					let strOut = `${strHour}:${strMin}:${strSec}`;
					timerField.innerHTML = strOut;
				}
				--time;
			}, 1000);
		}
	}

	typewriter(typeElement, addText, delay, callback) {
		let text = typeElement.innerHTML + addText;
		let kbFlag = 0;
    typeElement.innerHTML = '';
		document.addEventListener('keydown', function keyDelay(event) {
			if((event.code === 'Enter' ||
				event.code === 'NumpadEnter' ||
				event.code === 'Space') && ! kbFlag) {
				kbFlag = 1;
				delay = delay/4;
			}
		});
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
			if (text.length > 0) {
				setTimeout(typeFunc, delay);
			} else {
        		document.removeEventListener('keydown', function keyDelay(event){});
        		if (callback) { callback() };
			}
		}, delay);
	}

	gameOver = (event) => { 
		const result = event.detail.result; // Сделать вызов серверной компоненты
		this.subElements.tries.innerHTML = event.detail.string;
		this.subElements.body.classList.add('hide');
	}

	addTmpServiсe(field, word) {
		this.serviceTxt[15] = word;
		field.innerHTML = this.serviceTxt.join("");
	}

	delTmpServiсe(field) {
		this.serviceTxt[15] = "<br>";
		field.innerHTML = this.serviceTxt.join("");
	}

	addServiсe(field, word) {
		this.serviceTxt.splice(0, this.countStr(word,"<br>")+1);
		word.split("<br>").forEach(element => {
			this.serviceTxt.push(element+"<br>");
		});
		field.innerHTML = this.serviceTxt.join("");
	}

	countStr(str, substr) {
		let count = -1, index = 0;
		for (index = 0; index != -1; count++) {
			index = str.indexOf(substr, index + 1);
		}
		return count;
	}

	numTriesShow(numTries) {
		this.subElements.numTries.innerHTML = "* ".repeat(numTries);
	}

	getSubElementsByData(element) {
		const elements = element.querySelectorAll('[data-element]');
		let subElems = [];
		elements.forEach( function(item) {
			subElems[item.dataset.element] = item;
		});
		return subElems;
	}

	show(target) {
		const parentNode = target || document.body;
		parentNode.append(this.element);
	}
};

