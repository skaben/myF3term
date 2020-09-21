
export default class menuTerminal {
	constructor ({
		menuData = {	// То, что передаётся из приложения на Питоне.
			menuItems: [{id:'listText1', text: 'Показать текст (лопнут глаза)'},
						{id:'GasValve', text: 'Пустить ядовитый газ'},
						{id:'ReactorDestroy', text: 'Перегрузить ядро реактора'},
					],
			menuHeader: 'ВЫБЕРИТЕ СПОСОБ СМЕРТИ',
			header: ' ROBCO INDUSTRIES 2077',
			footer: 'FALLOUT TERMINAL'
		}
	} = {}) {
		this.menuItems = menuData.menuItems;
		this.menuHeader = menuData.menuHeader;
		this.header = menuData.header;
		this.footer = menuData.footer;
		this.menuPos = 0;
		this.menuLen = menuData.menuItems.length;

		this.menuRows = [];
		this.menuRowElements = [];
		this.element = document.querySelector(".screen__content"); // Основной элемент интерфейса

		let i = 0;
		this.menuItems.forEach( item => {
			this.menuRows.push(`<div data-num=\'${i}\' class=\'menuItem\' id=\'${item['id']}\'>
									${item['text']}</div>`);
			i++;
		});
		
		this.render();
		this.initEventListeners();
	}

	initEventListeners() {
		this.element.addEventListener("pointerover", this.onHover);
		this.element.addEventListener("pointerdown", this.onClick);
		document.addEventListener("keydown", this.onKey);
	}
	  
	destroyEventListeners() {
		this.element.removeEventListener("pointerover", this.onHover);
		this.element.removeEventListener("pointerdown", this.onClick);
		document.removeEventListener("keydown", this.onKey);
  	}

	dummy() {
		return false;
	}

	returnMenu(id) {
		console.log(id);
		// Отправка на сервер
	}

	onClick = (event) => {
		let curElem = event.target;	
		if(curElem.className.indexOf('menuItem') >= 0) {
			this.returnMenu(curElem.id);
		}
	}	

	onOut = (event) => {
		let curElem = event.target; 			
		curElem.classList.remove('highlight');	
	}

	onHover = (event) => {
		let curElem = event.target; 		
		if (curElem.className === 'menuItem') {
			this.menuRowElements[this.menuPos].classList.remove('highlight');
			this.menuPos = curElem.dataset.num;
			curElem.classList.add('highlight');
		}	
	}
	
	onKey = (event) => {
		if(event.code === 'ArrowDown') {
			this.menuRowElements[this.menuPos].classList.remove('highlight');
			this.menuPos = (this.menuPos + 1) % this.menuLen;
			this.menuRowElements[this.menuPos].classList.add('highlight');
		} else if (event.code === 'ArrowUp') {
			this.menuRowElements[this.menuPos].classList.remove('highlight');
			if (this.menuPos >0 ) {
				this.menuPos = this.menuPos - 1;
			} else {
				this.menuPos = this.menuLen - 1;
			}
			this.menuRowElements[this.menuPos].classList.add('highlight');
		} else if (event.code === 'Enter' || event.code === 'NumpadEnter') {
			this.returnMenu(this.menuRowElements[this.menuPos].id);
		}
	}


	template() {
		return `
		<div class="interface">
			<div class="interface_head">
				<p data-element="status">${this.header}</p>
				<p></p>${this.menuHeader}<br><br><br>
			</div>
			<div class="timer"></div>
			<div class="interface_content">
			</div>
			<div class="interface_foot">
				${this.footer}
			</div>
			</div>
		</div>
		`
	}

	render() {
		this.element.innerHTML = this.template();
		let menu = this.element.querySelector(".interface_content");
		this.menuRows.forEach(element => {
			menu.innerHTML += element;
		});
		this.menuRowElements = menu.querySelectorAll('.menuItem');
		menu.querySelector(`[data-num=\'${this.menuPos}\']`).classList.add('highlight');
	}	

	startTimer(timeOut) {
		if (timeOut <= 0) {
		  // тут, кмк, достаточно вот так сделать
		  this.subElements.timer.innerHTML = "";
		  return;
		}
		const timerFunc = () => setInterval(() => {
			let seconds = timeOut % 60,
				minutes = timeOut / 60 % 60,
				hour = timeOut / 60 / 60 % 60;
			// Условие если время закончилось то...
			if (timeOut <= 0) {
				// Таймер удаляется
				clearInterval(timerFunc);
				console.log('game lost');
			} else { // Иначе
				// Создаём строку с выводом времени
				let strSec = pad(parseInt(seconds, 10).toString(), 2);
				let strMin = pad(parseInt(Math.trunc(minutes), 10).toString(), 2);
				let strHour = pad(parseInt(Math.trunc(hour), 10).toString(), 2);
				let strOut = `${strHour}:${strMin}:${strSec}`;
				// Выводим строку в блок для показа таймера
				this.rootElement.querySelector(".timer").innerHTML = strOut;
			}
			--timeOut; // Уменьшаем таймер
		}, 1000)
		timerFunc();
	}
};

