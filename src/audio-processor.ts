type VolumeSnapshot = {
	meanVolume: number;
	volumesByFreq: Uint8Array;
};

// There's always noise that's not very important to human ears
// Analyse volume only in this range
const VOLUME_MIN_FREQ = 500; // Hz
const VOLUME_MAX_FREQ = 15000; // Hz

export class AudioProcessor {
	private source: AudioNode;
	private analyser: AnalyserNode;
	private playbackEnabled: boolean;

	constructor(source: AudioNode, nbBins: number, playbackEnabled = true) {
		this.source = source;
		this.playbackEnabled = playbackEnabled;

		this.analyser = this.source.context.createAnalyser();
		this.analyser.fftSize = 2 * nbBins;
		if (this.playbackEnabled) {
			this.analyser.connect(this.source.context.destination);
		}
		this.source.connect(this.analyser);
	}

	getMaxFreq(): number { return this.source.context.sampleRate / 2; }
	getNbBins(): number { return this.analyser.frequencyBinCount; }

	getFrequencies(): VolumeSnapshot {
		const nbBins = this.getNbBins();

		const dataArray = new Uint8Array(nbBins);
		this.analyser.getByteFrequencyData(dataArray);
		const volumesByFreq = dataArray.map(volume => volume * 100 / 255);

		const maxFreq = this.getMaxFreq();
		const minBin = Math.floor(VOLUME_MIN_FREQ / maxFreq * nbBins);
		const maxBin = Math.ceil(VOLUME_MAX_FREQ / maxFreq * nbBins);
		const binsForVolume = volumesByFreq.slice(minBin, maxBin);
		const meanVolume = binsForVolume.reduce((a, b) => a + b, 0) / binsForVolume.length;

		return {
			volumesByFreq,
			meanVolume
		};
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
