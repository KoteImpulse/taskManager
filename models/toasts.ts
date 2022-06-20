interface IOption {
	[key: string | number]: string | boolean | number | (() => void);
}

const defaultOptions: IOption = {
	position: 'bottom-right',
	title: 'title',
	text: 'text',
	autoClose: false,
	onCloseToast: () => ({}),
	onOpenToast: () => ({}),
	canClose: true,
	showProgress: true,
	pauseOnHover: true,
	pauseOnFocusLoss: false,
};

export class Toast {
	toastElement;
	progressInterval!: number;
	autoCloseInterval!: number;
	removeBind;
	timeVisible = 0;
	_autoClose!: number;
	isPaused = false;
	unpause: () => void;
	pause: () => void;
	visibilityChange: () => void;
	shouldUnPause!: boolean;

	constructor(options: IOption) {
		this.toastElement = createToastElement(options.text as string, options.title as string);
		this.toastElement.classList.add('toast');
		this.removeBind = this.remove.bind(this);
		requestAnimationFrame(() => {
			this.toastElement.classList.add('show');
		});
		this.unpause = () => (this.isPaused = false);
		this.pause = () => (this.isPaused = true);
		this.visibilityChange = () => {
			this.shouldUnPause = document.visibilityState === 'visible';
		};
		this.update({ ...defaultOptions, ...options });
		this.appear();
	}

	set position(value: string) {
		const modal = document.getElementById('toastModal1');
		const currentContainer = this.toastElement.parentElement;
		const selector = `.toastsContainer[data-position="${value}"]`;
		const container = document.querySelector(selector) || createContainer(value);
		container.append(this.toastElement);
		modal?.append(container);
		if (currentContainer == null || currentContainer.hasChildNodes()) return;
		currentContainer?.remove();
	}
	set autoClose(value: number | boolean) {
		this.timeVisible = 0;
		if (value === false) return;
		this._autoClose = value as number;

		let lastTime: number | null;
		const func = (time: number) => {
			if (this.shouldUnPause) {
				lastTime = null;
				this.shouldUnPause = false;
			}
			if (lastTime == null) {
				lastTime = time;
				this.autoCloseInterval = requestAnimationFrame(func);
				return;
			}
			if (!this.isPaused) {
				this.timeVisible += time - lastTime;
				if (this.timeVisible >= this._autoClose) {
					this.remove();
					return;
				}
			}
			lastTime = time;
			this.autoCloseInterval = requestAnimationFrame(func);
		};

		this.autoCloseInterval = requestAnimationFrame(func);
	}
	set text(value: string) {
		const textContainer = this.toastElement.querySelector('.text');
		if (textContainer != null) {
			textContainer.textContent = value;
		}
	}
	set title(value: string) {
		const titleContainer = this.toastElement.querySelector('.title');
		if (titleContainer != null) {
			titleContainer.textContent = value;
		}
	}
	set canClose(value: boolean) {
		if (value) {
			this.toastElement.addEventListener('click', this.removeBind);
		} else {
			this.toastElement.removeEventListener('click', this.removeBind);
			const button = this.toastElement.querySelector('button');
			if (button != null) {
				button.remove();
			}
		}
	}
	set showProgress(value: boolean) {
		this.toastElement.classList.toggle('progress', value);
		this.toastElement.style.setProperty('--progress', `1`);
		if (value) {
			const func = () => {
				if (!this.isPaused) {
					this.toastElement.style.setProperty('--progress', `${1 - this.timeVisible / this._autoClose}`);
				}
				this.progressInterval = requestAnimationFrame(func);
			};

			this.progressInterval = requestAnimationFrame(func);
		}
	}
	set pauseOnHover(value: boolean) {
		if (value) {
			this.toastElement.addEventListener('mouseenter', this.pause);
			this.toastElement.addEventListener('mouseleave', this.unpause);
		} else {
			this.toastElement.removeEventListener('mouseenter', this.pause);
			this.toastElement.removeEventListener('mouseleave', this.unpause);
		}
	}
	set pauseOnFocusLoss(value: boolean) {
		if (value) {
			document.addEventListener('visibilitychange', this.visibilityChange);
		} else {
			document.removeEventListener('visibilitychange', this.visibilityChange);
		}
	}

	update(options: IOption) {
		Object.entries(options).forEach(([key, value]) => {
			//@ts-ignore
			this[key] = value;
		});
	}
	appear() {
		//@ts-ignore
		this.onOpenToast();
	}
	remove() {
		cancelAnimationFrame(this.autoCloseInterval);
		cancelAnimationFrame(this.progressInterval);
		const container = this.toastElement.parentElement;
		this.toastElement.classList.remove('show');
		this.toastElement.addEventListener('transitionend', () => {
			this.toastElement.remove();
			if (container?.hasChildNodes()) return;
			container?.remove();
		});
		//@ts-ignore
		this.onCloseToast();
	}
}

function createContainer(value: string) {
	const container = document.createElement('div');
	container.classList.add('toastsContainer');
	container.dataset.position = value;
	return container;
}

function createToastElement(text: string, title: string) {
	const container = document.createElement('div');

	const button = document.createElement('button');
	button.classList.add('closeButton');
	button.textContent = 'x';

	const textsContainer = document.createElement('div');
	textsContainer.classList.add('textContainer');

	const titleContainer = document.createElement('span');
	titleContainer.classList.add('title');
	titleContainer.textContent = title;

	const textContainer = document.createElement('span');
	textContainer.classList.add('text');
	textContainer.textContent = text;

	textsContainer.append(titleContainer);
	textsContainer.append(textContainer);

	container.appendChild(textsContainer);
	container.appendChild(button);

	return container;
}
