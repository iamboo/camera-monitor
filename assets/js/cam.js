const storage = window.localStorage;

window.onload = function() {
	sourceCameras();
};

function getStorage(key) {
	const storedValue = storage.getItem(key);
	return storedValue ? JSON.parse(storedValue) : null;
}

function setStorage(key, value) {
	const storedValue = JSON.stringify(value);
	storage.setItem(key, storedValue);
}

function getCams() {
	const cameraList = storage.getItem("cameraList");
	return cameraList ? JSON.parse(cameraList) : [];
}

function setCams(cameraList) {
	const saveString = JSON.stringify(cameraList);
	storage.setItem("cameraList", saveString);
}
