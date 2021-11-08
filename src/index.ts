import { AudioProcessor } from './audio-processor';
import { AudioRenderer } from './audio-renderer';

const SOUND_URLS = {
	CROWD: 'https://mdn.github.io/voice-change-o-matic/audio/concert-crowd.ogg',
	MUSIC: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Oh_Susanna.ogg',
	SCALE: 'https://upload.wikimedia.org/score/1/4/149hxowm0jnjun0byp4xzvq7h12ndfg/149hxowm.mp3',
	WHITE: 'https://upload.wikimedia.org/wikipedia/commons/9/98/White-noise-sound-20sec-mono-44100Hz.ogg',
	VOICE: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Howard_Goodall_voice.ogg'
};

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

	const audioBuf = await fetch(url)
		.then(res => res.arrayBuffer())
		.then(buf => arrayBufferToAudioBuffer(audioCtx, buf));

	const soundSource = audioCtx.createBufferSource();
	soundSource.buffer = audioBuf;

	return soundSource;
};

const getAudioSourceFromMicrophone = async () => {
	const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

	const audioCtx = new AudioContext();
	const soundSource = audioCtx.createMediaStreamSource(stream);

	return soundSource;
};

const displayFrequencies = (source: AudioNode, renderId: string, playbackEnabled: boolean) => {
	const appRoot = document.getElementById(renderId);
	if (!appRoot) {
		console.error(`No element with id ${renderId}`);
		return;
	}

	const processor = new AudioProcessor(source, NB_BINS, playbackEnabled);
	const renderer = new AudioRenderer(processor, appRoot);
	renderer.startRender();
};

const main = async () => {
	const networkSource = await getAudioSourceFromUrl(SOUND_URLS.VOICE);
	const micSource = await getAudioSourceFromMicrophone();
	displayFrequencies(networkSource, 'url-root', true);
	displayFrequencies(micSource, 'mic-root', false);
	networkSource.start();
};

main();
