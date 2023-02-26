// Lovingly copied from here https://github.com/MetaMask/metamask-extension/blob/23e3f52a04e5fa03590238d481a47a9294b7953a/app/scripts/platforms/extension.js
import browser from 'webextension-polyfill';

export type WindowId = number;

type onRemoveListener = (windowId: WindowId) => void;

//https://github.com/MetaMask/metamask-extension/blob/23e3f52a04e5fa03590238d481a47a9294b7953a/app/scripts/lib/util.js#L105
function checkForError() {
	const { lastError } = browser.runtime;
	if (!lastError) {
		return undefined;
	}
	// if it quacks like an Error, its an Error

	// @ts-ignore
	if (lastError.stack && lastError.message) {
		return lastError;
	}
	// repair incomplete error object (eg chromium v77)
	return new Error(lastError.message);
}

export default class Platform {
	public async openWindow(
		options: browser.Windows.CreateCreateDataType
	): Promise<browser.Windows.Window> {
		const newWindow = await browser.windows.create(options);
		const error = checkForError();
		if (error) {
			throw error;
		}

		return newWindow;
	}

	public addOnRemovedListener(listener: onRemoveListener) {
		browser.windows.onRemoved.addListener(listener);
	}

	public async focusWindow(windowId: WindowId) {
		await browser.windows.update(windowId, { focused: true });
		const error = checkForError();
		if (error) {
			throw error;
		}
	}

	public async getLastFocusedWindow(): Promise<browser.Windows.Window> {
		const windowObject = await browser.windows.getLastFocused();
		const error = checkForError();
		if (error) {
			throw error;
		}

		return windowObject;
	}

	public async updateWindowPosition(
		windowId: WindowId,
		left: number,
		top: number
	) {
		await browser.windows.update(windowId, { left, top });
		const error = checkForError();
		if (error) {
			throw error;
		}
	}

	public async getAllWindows(): Promise<browser.Windows.Window[]> {
		const windows = await browser.windows.getAll();
		const error = checkForError();
		if (error) {
			throw error;
		}
		return windows;
	}
}
