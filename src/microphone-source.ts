export class MicrophoneSource {
	private audioCtx: AudioContext;
	private source: MediaStreamAudioSourceNode | null = null;

	constructor(audioCtx: AudioContext) {
		this.audioCtx = audioCtx;
	}

	async getSource(deviceId?: string | null): Promise<MediaStreamAudioSourceNode> {
		if (this.source) {
			this.source.mediaStream.getTracks().forEach(track => {
				console.debug('Stopping track', track);
				track.stop();
			});
		}

		const audioConstraints = deviceId
			? { deviceId: { exact: deviceId } }
			: true;
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: audioConstraints,
			video: false
		});

		this.source = this.audioCtx.createMediaStreamSource(stream);
		return this.source;
	}

	getDeviceId(): string | null {
		if (!this.source) {
			return null;
		}

		const tracks = this.source.mediaStream.getTracks();
		return tracks.length > 0
			? tracks[0].getSettings().deviceId || null
			: null; // can this actually happen?
	};
}
