import { AudioProcessor } from './audio-processor';
import { AudioRenderer } from './audio-renderer';
import { DeviceSelector } from './device-selector';
import { MicrophoneSource } from './microphone-source';

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

const getAudioSourceFromUrl = async (
	audioCtx: AudioContext,
	url: string
): Promise<AudioBufferSourceNode> => {
	const audioBuf = await fetch(url)
		.then(res => res.arrayBuffer())
		.then(buf => arrayBufferToAudioBuffer(audioCtx, buf));

	const soundSource = audioCtx.createBufferSource();
	soundSource.buffer = audioBuf;

	return soundSource;
};

const displayFrequencies = (
	source: AudioNode,
	renderId: string,
	playbackEnabled: boolean
): AudioProcessor => {
	const renderRoot = document.getElementById(renderId);
	if (!renderRoot) {
		throw new Error(`No element with id ${renderId}`);
	}

	const processor = new AudioProcessor(source, NB_BINS, playbackEnabled);
	const renderer = new AudioRenderer(processor, renderRoot);
	renderer.startRender();

	return processor;
};

const launchNetworkDisplay = async (audioCtx: AudioContext) => {
	const networkSource = await getAudioSourceFromUrl(audioCtx, SOUND_URLS.VOICE);
	displayFrequencies(networkSource, 'url-root', true);
	networkSource.start();
};

const launchMicDisplay = async (audioCtx: AudioContext) => {
	const mic = new MicrophoneSource(audioCtx);
	const micSource = await mic.getSource();
	const micProcessor = displayFrequencies(micSource, 'mic-root', false);

	const changeDevice = async (newDeviceId: string | null) => {
		const source = await mic.getSource(newDeviceId);
		const deviceId = mic.getDeviceId();
		console.debug('Device select:', deviceId);
		micProcessor.setSource(source);
		deviceSelector.setActiveDeviceId(deviceId);
	};

	const initialDeviceId = mic.getDeviceId();
	const deviceSelector = new DeviceSelector('devices', changeDevice, initialDeviceId);

	navigator.mediaDevices.addEventListener('devicechange', () => {
		const newDeviceId = mic.getDeviceId();
		console.debug('Device change:', newDeviceId);
		deviceSelector.setActiveDeviceId(newDeviceId);
		deviceSelector.refresh();
	});

	deviceSelector.start();
};

const main = async () => {
	const sharedAudioCtx = new AudioContext();
	launchNetworkDisplay(sharedAudioCtx);
	launchMicDisplay(sharedAudioCtx);
};

main();
