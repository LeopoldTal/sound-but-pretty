import { AudioProcessor } from './audio-processor';

export class AudioRenderer {
	private processor: AudioProcessor;
	private bars: HTMLElement[] = [];
	private interval: number | null = null;

	constructor(processor: AudioProcessor, renderTarget: HTMLElement) {
		this.processor = processor;
		this.init(renderTarget);
	}

	public startRender(intervalInMs = 50) {
		const render = this.renderOnce.bind(this);
		this.interval = setInterval(render, intervalInMs);
	}
	public stopRender() {
		if (this.interval !== null) {
			clearInterval(this.interval);
		}
	}

	private renderOnce() {
		const nbBins = this.processor.getNbBins();
		const volumes = this.processor.getFrequencies();
		for (let ii = 0; ii < nbBins; ii++) {
			this.bars[ii].style.height = `${volumes[ii] * 100 / 255}%`;
		}
	}

	private init(renderTarget: HTMLElement) {
		this.initBars(renderTarget);
		this.initMuteButton(renderTarget);
	}

	private initBars(renderTarget: HTMLElement) {
		this.bars = [];
		const barsContainer = document.createElement('div');
		barsContainer.className = 'bars-container';

		const nbBins = this.processor.getNbBins();
		const barWidth = 100 / nbBins;
		for (let ii = 0; ii < nbBins; ii++) {
			const bar = document.createElement('div');
			bar.className = 'bar';
			Object.assign(bar.style, {
				left: `${ii * barWidth}%`,
				width: `${barWidth}%`,
				height: '50%',
				backgroundColor: `hsl(${360 * ii / nbBins}, 100%, 40%)`
			});
			barsContainer.appendChild(bar);
			this.bars.push(bar);
		}

		renderTarget.appendChild(barsContainer);
	}

	private initMuteButton(renderTarget: HTMLElement) {
		const buttonContainer = document.createElement('p');

		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = this.getMuteButtonText();

		button.addEventListener('click', () => {
			this.processor.togglePlayback();
			button.textContent = this.getMuteButtonText();
		});

		buttonContainer.appendChild(button);
		renderTarget.appendChild(buttonContainer);
	}
	private getMuteButtonText() {
		return this.processor.isPlaybackEnabled() ? 'Mute' : 'Unmute';
	}
}
