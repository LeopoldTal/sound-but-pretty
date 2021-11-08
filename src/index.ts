import { AudioProcessor } from './audio-processor';
import { AudioRenderer } from './audio-renderer';

//const NOISE_URL = 'https://upload.wikimedia.org/wikipedia/en/2/26/Europe_-_The_Final_Countdown.ogg';
//const NOISE_URL = 'https://mdn.github.io/voice-change-o-matic/audio/concert-crowd.ogg';
const NOISE_URL = 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Oh_Susanna.ogg';

const NB_BINS = 1024;

const arrayBufferToAudioBuffer = (
	audioCtx: AudioContext,
	buf: ArrayBuffer
): Promise<AudioBuffer> => new Promise((resolve, reject) => {
	audioCtx.decodeAudioData(buf, resolve, reject);
});

const getAudioSourceFromUrl = async (url: string): Promise<AudioBufferSourceNode> => {
	// probably cleaner to build the context at the top of the app and pass it
	const audioCtx = new AudioContext();

	const audioBuf = await fetch(NOISE_URL)
		.then(res => res.arrayBuffer())
		.then(buf => arrayBufferToAudioBuffer(audioCtx, buf));

	const soundSource = audioCtx.createBufferSource();
	soundSource.buffer = audioBuf;

	return soundSource;
};

const main = async () => {
	const appRoot = document.getElementById('app-root');
	if (!appRoot) {
		console.error('No element with id app-root');
		return;
	}
	const source = await getAudioSourceFromUrl(NOISE_URL);
	console.log(source);
	const processor = new AudioProcessor(source, NB_BINS);
	const renderer = new AudioRenderer(processor, appRoot);
	renderer.startRender();
	source.start();
};

main();
