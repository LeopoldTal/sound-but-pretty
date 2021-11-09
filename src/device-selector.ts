const DEFAULT_LABEL = 'Unknown audio input';

export class DeviceSelector {
	private renderTarget: HTMLElement;
	private onDeviceSelect: (newDeviceId: string | null) => void
	private inputName: string;
	private activeDeviceId: string | null = null;

	constructor(
		renderId: string,
		onDeviceSelect: (newDeviceId: string | null) => void,
		activeDeviceId: string | null = null
	) {
		const renderRoot = document.getElementById(renderId);
		if (!renderRoot) {
			throw new Error(`No element with id ${renderId}`);
		}
		this.renderTarget = renderRoot;
		this.inputName = `select-${renderId}`;
		this.onDeviceSelect = onDeviceSelect;
		this.activeDeviceId = activeDeviceId;
	}

	start(refreshRateInMs = 300) {
		this.refresh();
		const refresh = this.refresh.bind(this);
		setInterval(refresh, refreshRateInMs);
	}

	setActiveDeviceId(activeDeviceId: string | null) {
		this.activeDeviceId = activeDeviceId;
	}

	async refresh() {
		const devices = await navigator.mediaDevices.enumerateDevices()
			.catch(err => {
				console.error(err);
				return [];
			});
		const audioDevices = devices.filter(({ kind }) => kind === 'audioinput');

		this.render(audioDevices);
	}

	private async render(audioDevices: MediaDeviceInfo[]) {
		const changeListener = (e: any) => {
			this.onDeviceSelect(e.target.value);
		};

		if (audioDevices.length === 0) {
			this.renderTarget.textContent = 'No microphone detected.';
			return;
		}
		this.renderTarget.textContent = '';
		audioDevices.forEach(({ deviceId, label }) => {
			const labelElement = document.createElement('label');

			const radioElement = document.createElement('input');
			radioElement.type = 'radio';
			radioElement.name = this.inputName;
			radioElement.value = deviceId;
			if (deviceId === this.activeDeviceId) {
				radioElement.checked = true;
			}
			radioElement.addEventListener('change', changeListener);

			labelElement.appendChild(radioElement);
			labelElement.appendChild(document.createTextNode(label || DEFAULT_LABEL));

			this.renderTarget.appendChild(labelElement);
		});
	}
}
