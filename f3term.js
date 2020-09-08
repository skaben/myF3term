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
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
}

function pad(num, size) {
    let s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function numTries(num_tries) {
	let tmp_txt = "";
	for (let i = 0; i < num_tries; i++) {
		tmp_txt += "* ";
	}	
	document.getElementById("tries").innerHTML = tmp_txt;
}	

function compareWords(word, pass_word) {
	let count = 0;
	for (let i = 0; i < pass_word.length; i++) {
		if (pass_word[i] == word[i]) {
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

function insertServiсe(word) {
	serviceText.splice(0, 3);	
	serviceText[14] = word;
	serviceText[15] = "<br>";
	serviceField.innerHTML = serviceText.join("");
}

function gameLose () { // Проигрыш
	m_field.onclick = function clickDummy(event) {};
	m_field.onmouseover = function overDummy(event) {};
	m_field.onmouseout = function outDummy(event) {};
	
	str_lose = "You LOSE! ";
	if (num_tries <=0) {
		str_lose += "Tries is over! ";
	}
	if (game_data.timeout >0) {
		clearInterval(timerFunc);	
		if (time_out <= 0) {
			str_lose += "Time is out! ";
		}
	}
	document.getElementById("tries").innerHTML = str_lose;
}

function gameWin () { // Выигрыш
	m_field.onclick = function clickDummy(event) {};
	m_field.onmouseover = function overDummy(event) {};
	m_field.onmouseout = function outDummy(event) {};
	if (game_data.timeout >0) {
		clearInterval(timerFunc);	
	}
	document.getElementById("tries").innerHTML = "You WIN! Access GRANTED!";
}

// Поле 2х16х16, черт с ней с аутентичностью.

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
			header: ' ROBCO INDUSTRIES 2077',
			footer: 'FALLOUT TERMINAL'
		}
	} = {}) {
		this.timeОut = gameData.timeOut;
		this.tries = gameData.numTries;
		this.numWords = gameData.falseWords.length + 1; // Длина списка слов + пароль
		this.passPos = getRandomInt(0, this.numWords - 1); // Позиция пароля в списке слов
		this.lenWord = gameData.password.length; // Длина слова
		this.serviceText = ["<br>", "<br>", "<br>", "<br>", "<br>", "<br>", "<br>", "<br>", 
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

		this.rootElement = document.querySelector(".screen__content"); // Основной элемент интерфейса
		this.serviceField = document.querySelector(".service"); // Поле сервисного "журнала"
		
		
		// Заполняем массивы
		this.wordList = this.initWordList(this.passPos, gameData.password, this.numWords, gameData.falseWords);
		this.posWords = this.initWordPos(this.numRows, this.numChars, this.numWords, this.lenWord);
		this.grbStrClear = this.initGrbClear(this.numGarbage, this.posWords, this.lenWord, this.wordList, this.grbChars);
		this.grbStrTagged = this.initGrbTagged(this.grbStrClear, this.wordList);
		[this.leftIdx, this.rightIdx] = this.initIdx(this.numRows, this.numChars);
		[this.leftTxt, this.rightTxt] = this.initTxt(this.numRows, this.numChars, this.grbStrTagged);

		this.render();
		this.initEventListeners();
		

		//console.log(this.wordList);
		//console.log(this.posWords);
		//console.log(this.grbStrClear);
		//console.log(this.grbStrTagged);
		//console.log(this.leftIdx);
		//console.log(this.rightIdx);
		//console.log(this.leftTxt);
		//console.log(this.rightTxt);
	}

	initEventListeners() {
		this.rootElement.addEventListener("pointerover", this.onHover);
		this.rootElement.addEventListener("pointerout", this.onOut);
		// this.rootElement.addEventListener("pointerdown", this.onClick);
  	}

	onOut = (event) => {
		let curElem = event.target; 			// Текущий, current element, с которого ушла мышь
		curElem.classList.remove('highlight');	// Перекрашиваем его в нормальный цвет по факту ухода
		if (this.leftCheat >=0 || this.rightCheat >= 0) {
			for (let i = this.leftCheat; i <= this.rightCheat; i++) { // Мы красили ранее чит и ушли с него! Покрасим его обратно.
				// console.log(curElem.parentNode);
				curElem.parentNode.querySelector(`idx-${i}`).classList.remove('highlight');
			}
			this.leftCheat = -1;	// Левая граница чита глобально - ушли с чита, значит вовзращаем индесы на место
			this.rightCheat = -1;	// Правая граница чита глобально - ушли с чита, значит вовзращаем индесы на место
		}
		if (curElem.className == "word") {
			let serviceField = document.querySelector(".service");
			this.serviceText[15] = "<br>";
			serviceField.innerHTML = this.serviceText.join("");
		}	
	}

	onHover = (event) => {
		let curElem = event.target; 		// Текущий, current element, на который пришла мышь
		let prevElem = event.relatedTarget;	// Предыдущий, previous element, с которого ушла мышь
		if (curElem.className === 'char' || curElem.className === 'word') {
			if (prevElem != null) { // Предыдущий элемент, с которого ушли, не пустой.
				if (prevElem.className === 'char' || prevElem.className === 'word') { 
					// Если ушли со слова или знака - перекрасим в нормальный стиль.
					prevElem.classList.remove('highlight');
				}
			}	
			if (curElem.className === 'char') {
				[this.leftCheat, this.rightCheat] = this.checkCheat(curElem);
				if (this.leftCheat >= 0 && this.rightCheat >= 0) {
					for (let i = this.leftCheat; i <= this.rightCheat; i++) {
						// console.log(i);
						// console.log(curElem.parentNode);
						curElem.parentNode.querySelector(`idx-${i}`).classList.add('highlight');
					}
				}
			} else { // Выбрали слово
				// document.getElementById('sel_word').play(); 
				let serviceField = document.querySelector(".service");
				this.serviceText[15] = curElem.dataset.element;;
				serviceField.innerHTML = this.serviceText.join("");
			}
			curElem.classList.add('highlight');
		}
	}

	checkCheat(element) {
		let left = -1, right = -1; // Левая и правая границы чита
		let i = 0, j = 0;
		// ID - позиция в массиве grb_str_clear
		const curId = element.dataset.element.slice(4);
		// Левая граница строки на игровом поле в основном массиве символов
		const leftBorder = Math.floor(curId / this.numChars) * this.numChars; 
		// Правая граница диапазона в основном массиве симоволов
		const rightBorder = leftBorder + this.numChars;
		// console.log([leftBorder, rightBorder]);
		let leftIdx = this.leftBrackets.indexOf(this.grbStrClear[curId]); 	// Проверяем, является ли символ левой скобкой
		let rightIdx = this.rightBrackets.indexOf(this.grbStrClear[curId]);	// Проверяем, является ли символ правой скобкой
		if (leftIdx >= 0) { // Символ  - левая скобка
			let leftBrk = this.leftBrackets[leftIdx];
			let rightBrk = this.rightBrackets[leftIdx]; // Выбираем к ней правую пару
			[left, right] = this.selectCheat(curId, rightBorder, rightBrk); 
		} else if (rightIdx >= 0) { // Это правая скобка
				let rightBrk = this.rightBrackets[rightIdx];
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
					case 1: console.log([startPos, i]);
						return [startPos, i]; 	// Чит
				}
			}
		} else {
			for(let i = startPos; i > endPos; i--) {
				switch (this.checkCharCheat(i, bracket)) {
					case -1: return [-1, -1];		// Cлово
					case 1: console.log([i, startPos]);
						return [i, startPos]; 	// Чит
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
				tLast = grbTagged.pop() + "</span>";
				grbTagged.push(tLast);
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

	addTmpServiсe(word) {
		this.serviceText[15] = word;
		this.serviceField.innerHTML = this.serviceText.join("");
	}
	
	delTmpServiсe() {
		this.serviceText[15] = "<br>";
		this.serviceField.innerHTML = this.serviceText.join("");
	}
	

	template() {
		return `
		<div class="interface">
			<div class="interface_header">
			<p data-element="status">-----</p>
			<p> TRIES LEFT: <span data-element="tries">${"*".repeat(this.tries)}</span></p>
			</div>
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

	render() {
		this.rootElement.innerHTML = this.template();
	}	
};



/* 

const timer = document.querySelector(".timer");

function startTimer(timeOut) {
	if (timeOut <= 0) {
		timer.style.display = "none";
		return;
	}
	timerFunc = setInterval(function useTimer() {
		let seconds = timeOut%60; // Получаем секунды
		let minutes = timeOut/60%60; // Получаем минуты
		let hour = timeOut/60/60%60; // Получаем часы
		// Условие если время закончилось то...
		if (timeOut <= 0) {
				// Таймер удаляется
				clearInterval(timerFunc);
				gameLose(); // Проиграли!
		} else { // Иначе
				// Создаём строку с выводом времени
				let str_sec = pad(parseInt(seconds, 10).toString(), 2);
				let str_min = pad(parseInt(Math.trunc(minutes), 10).toString(), 2);
				let str_hour = pad(parseInt(Math.trunc(hour), 10).toString(), 2);
				let str_out = `${str_hour}:${str_min}:${str_sec}`;
				// Выводим строку в блок для показа таймера
				timer.innerHTML = str_out;
		}
		--timeOut; // Уменьшаем таймер
	}, 1000)
}	

startTimer(600);


m_field.onmouseout = function onMouseOut(event) {
  let c_elem = event.target; 				// Текущий, current element, с которого ушла мышь
	c_elem.style.color = fgCol;				// Перекрашиваем его в нормальный цвет по факту ухода
	c_elem.style.background = bgCol;
	if (l_cheat >=0 || r_cheat>= 0) {
		for (i = l_cheat; i <= r_cheat; i++) { // Мы красили ранее чит и ушли с него! Покрасим его обратно.
			document.getElementById(i).style.background = bgCol;
			document.getElementById(i).style.color = fgCol;  
		}
		l_cheat = -1;	// Левая граница чита глобально - ушли с чита, значит вовзращаем индесы на место
		r_cheat = -1;	// Правая граница чита глобально - ушли с чита, значит вовзращаем индесы на место
	}
	if (c_elem.className == "word") {
		removeTmpServive();
	}	
};

m_field.onclick = function onMouseClick(event) {
	let c_elem = event.target;	// Текущий элемент, на котором кликнули current element
	let c_id = c_elem.id;				// Его ID, для краткости
	if (c_elem.className == 'word') { 	// Кликнули на слово
		if (c_id == game_data.password) { // Слово свопало с паролем
			gameWin();	// Выиграли
			return;
		} else {	// Слово не совпало с паролем
			num_tries--;	// Уменьшаем число попыток
			numTries(num_tries);	// Отображаем уменьшенный результат
			if (num_tries == 0) { // Все попытки исчерпаны
				gameLose();	// Проиграли
			}	else {
				let n_let = compareWords(c_id, game_data.password); // Сравниваем выбранное слово с паролем по буквам
				removeTmpServive();
				insertServive(`${c_id} <br> ${n_let} of ${game_data.len_word}<br>`);	// Выводим результат сравнения
			}
		}
	} else { // Кликнули на символ
		let i = 0;
		let flag = 0;
		if (l_cheat >= 0 && r_cheat >= 0) { // Кликнули на скобке и ранее обнаружен удачный чит
			for (i = l_cheat; i <= r_cheat; i++) {
				document.getElementById(i).innerHTML = '.';	// Превращаем каждый элемент чита в точку и прокрашиваем как было
				document.getElementById(i).style.background = bgCol;
				document.getElementById(i).style.color = fgCol;
				grb_str_clear[i] = '.';
			}	
			
			let chance = Math.random();
			if (chance <= game_data.chance_tries) { // Повезло. восстанавливаем попытки!
				num_tries = game_data.num_tries;
				numTries(num_tries);	// Отображаем результат
			} else { // Убираем слово-заглушку
				let idx_dumb = getRandomInt(0, game_data.falsewords.length-1);	// Выбираем случайное слово - не пароль.
				let word_sel = document.getElementById(game_data.falsewords[idx_dumb]);
				if (word_sel == undefined) { // Кончились "заглушки"
					num_tries = game_data.num_tries; // Восстанавливаем попытки
					numTries(num_tries);	// Отображаем результат
				} else {
					game_data.falsewords.splice(idx_dumb, 1);	// Удаляем выбранное слово из массива.
					let new_word = '';
					insertServive("DUMMY REMOVED! <br>");
					for (i = 0; i < word_sel.innerHTML.length; i++) {	// Перебираем выбранное слово посимвольно.
						if (flag == 0 && word_sel.innerHTML[i] == '<') { // Нашли тэг <br>, выставляем флаг, что надо копировать тэг.
							flag = 1;
							new_word += word_sel.innerHTML[i];
							continue;
						}
						if (flag == 1 && word_sel.innerHTML[i] == '>') { // Тэг закончился, скопировн, флаг обнулили.
							new_word += word_sel.innerHTML[i];
							flag = 0;
							continue;
						}	
						if (flag == 1) { // Копируем тэг без изменений в новое "слово".
							new_word += word_sel.innerHTML[i];
							continue;
						}	
						new_word += '<span id=\"dot\" class=\"char\">.</span>'; // Все символы в слове, кроме тэга, заменяем точками.
					}
					word_sel.innerHTML = new_word; 	// Заменили в документе слово точками.
					word_sel.id = ''; 							// Обнулили ID
				}
			}	
		}	
	}	
};

*/