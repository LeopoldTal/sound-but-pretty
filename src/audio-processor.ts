export class AudioProcessor {
	private source: AudioNode;
	private nbBins: number;
	private analyser: AnalyserNode;
	private playbackEnabled: boolean;

	constructor(source: AudioNode, nbBins: number, playbackEnabled = true) {
		this.source = source;
		this.nbBins = nbBins;
		this.playbackEnabled = playbackEnabled;

		this.analyser = this.source.context.createAnalyser();
		this.analyser.fftSize = 2 * this.nbBins;
		if (this.playbackEnabled) {
			this.analyser.connect(this.source.context.destination);
		}
		this.source.connect(this.analyser);
	}

	getNbBins(): number { return this.nbBins; }

	getFrequencies(): Uint8Array {
		const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
		this.analyser.getByteFrequencyData(dataArray);
		return dataArray;
	}

	isPlaybackEnabled() {
		return this.playbackEnabled;
	}
	togglePlayback() {
		if (this.playbackEnabled) {
			this.analyser.disconnect();
			this.playbackEnabled = false;
		} else {
			this.analyser.connect(this.source.context.destination);
			this.playbackEnabled = true;
		}
	}
}
