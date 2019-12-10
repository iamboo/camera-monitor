var deleteCamIndex = -1;
function sourceCameras() {
	document.ontouchmove = function(event) {
		event.preventDefault();
	};

	const cameraList = getCams();
	const listElement = document.getElementById("table-body");
	while (listElement.firstChild) {
		listElement.removeChild(listElement.firstChild);
	}
	if (listElement) {
		for (var x in cameraList) {
			const index = x;
			const row = document.createElement("tr");
			row.setAttribute("data-index", index);
			row.onclick = function(event) {
				editCamera(event);
			};
			const ipText = document.createTextNode(cameraList[x].ip);
			const ipNode = document.createElement("td");
			ipNode.appendChild(ipText);
			row.appendChild(ipNode);

			const unText = document.createTextNode(cameraList[x].username);
			const unNode = document.createElement("td");
			unNode.appendChild(unText);
			row.appendChild(unNode);

			const pwText = document.createTextNode(cameraList[x].password);
			const pwNode = document.createElement("td");
			pwNode.appendChild(pwText);
			row.appendChild(pwNode);

			const mdText = document.createTextNode(
				!cameraList[x].model ? "" : cameraList[x].model
			);
			const mdNode = document.createElement("td");
			mdNode.appendChild(mdText);
			row.appendChild(mdNode);

			const buttonNode = document.createElement("span");
			buttonNode.setAttribute("class", "fa fa-trash");
			buttonNode.onclick = function(event) {
				confirmDelete(event);
			};
			const buttonCell = document.createElement("td");
			buttonCell.setAttribute("class", "td-icon");
			buttonCell.appendChild(buttonNode);
			row.appendChild(buttonCell);
			listElement.appendChild(row);
		}
	}
	prefillSettings();
}

function prefillSettings() {
	const settings = getStorage("settings");
	document.getElementById("weather-city").value = settings["weather-city"];
	document.getElementById("weather-state").value = settings["weather-state"];
	document.getElementById("weather-country").value =
		settings["weather-country"];
	document.getElementById("camera-refresh").value = settings["camera-refresh"];
	document.getElementById("clock-format").checked =
		settings["clock-format"] === true;
}

function getClickIndex(clickElement) {
	if (!clickElement) {
		return -1;
	}
	const rowElement = clickElement.closest("tr");
	var dataIndex = rowElement.getAttribute("data-index");
	dataIndex = dataIndex ? parseInt(dataIndex, 10) : 0;
	return dataIndex;
}

function editCamera(e) {
	const activeBannerElements = document.getElementsByClassName("active-banner");
	for (var i = 0; i < activeBannerElements.length; i++) {
		activeBannerElements[i].classList.remove("active-banner");
	}
	const cameraList = getCams();
	const camIndex = getClickIndex(e.target);
	const camIndexElement = document.getElementById("camIndex");
	camIndexElement.setAttribute("value", camIndex);
	const newCam = { ip: "", username: "", password: "" };
	const camera = camIndex > -1 ? cameraList[camIndex] : newCam;
	var bannerPos = "";
	for (var x in camera) {
		const value = camera[x];
		const element = document.getElementById(x);
		if (element) {
			element.value = value;
		} else {
			bannerPos = value;
		}
	}
	const bannerElement = document.getElementsByClassName(bannerPos);
	if (bannerElement[0]) {
		bannerElement[0].classList.add("active-banner");
	}
	toggleModal("camera-modal");
}

function toggleModal(modalId) {
	const modalElement = document.getElementById(modalId);
	var classAttr = modalElement.getAttribute("class");
	const isShow = classAttr.indexOf("show") > -1;
	if (isShow) {
		classAttr = classAttr.replace("show", "");
	} else {
		classAttr += " show";
	}
	classAttr = classAttr.trim();
	modalElement.setAttribute("class", classAttr);
}

function saveCamera() {
	var cameraList = getCams();
	const camIndexElement = document.getElementById("camIndex");
	var camIndex = camIndexElement.getAttribute("value");
	camIndex = parseInt(camIndex, 10);
	const camIp = document.getElementById("ip").value;
	const camUn = document.getElementById("username").value;
	const camPw = document.getElementById("password").value;
	const camMd = document.getElementById("model").value;
	var bannerPos = "";
	const bannerElement = document.getElementsByClassName("active-banner");
	if (bannerElement[0]) {
		const classString = bannerElement[0]
			.getAttribute("class")
			.replace("active-banner", "")
			.trim();
		bannerPos = classString;
	}

	const newCam = {
		ip: camIp,
		username: camUn,
		password: camPw,
		model: camMd,
		bannerPos: bannerPos
	};
	if (camIndex === -1) {
		if (!cameraList) {
			cameraList = [];
		}
		cameraList.push(newCam);
	} else {
		cameraList[camIndex] = newCam;
	}
	setCams(cameraList);
	sourceCameras();
	clearModal();
}

function clearModal() {
	document.getElementById("camIndex").value = "";
	document.getElementById("ip").value = "";
	document.getElementById("username").value = "";
	document.getElementById("password").value = "";
	toggleModal("camera-modal");
}

function confirmDelete(e) {
	if (e) {
		e.stopPropagation();
	}
	const cameraList = getCams();
	const camIndex = getClickIndex(e.target);
	deleteCamIndex = parseInt(camIndex, 10);
	const camera = cameraList[camIndex];
	const deleteElement = document.getElementById("delete-message");
	while (deleteElement.firstChild) {
		deleteElement.removeChild(deleteElement.firstChild);
	}
	const deleteMessage = document.createTextNode(
		"Confirm deletion of camera located at:\n\n'" + camera.ip + "'"
	);
	deleteElement.appendChild(deleteMessage);
	toggleModal("confirm-modal");
}
function deleteCamera() {
	const cameraList = getCams();
	cameraList.splice(deleteCamIndex, 1);
	setCams(cameraList);
}

function launchMonitor() {
	document.location.href = "monitor.html";
}

function tabClick(event) {
	event.preventDefault();
	const clickedTabElement = event.target;
	const tabsParent = document.getElementById("tabList");
	const activeTabs = tabsParent.getElementsByClassName("active");
	for (var i = 0; i < activeTabs.length; i++) {
		const tabId = activeTabs[i].getAttribute("id");
		const contentElement = document.getElementById(tabId + "-content");
		contentElement.setAttribute("class", "tab-pane");
		activeTabs[i].setAttribute("class", "nav-link");
	}
	clickedTabElement.setAttribute("class", "active nav-link");
	const clickedId = clickedTabElement.getAttribute("id");
	const activeContentElement = document.getElementById(clickedId + "-content");
	activeContentElement.setAttribute("class", "active tab-pane");
}

function saveSettings(event) {
	var settingsJSON = {};
	event.preventDefault();
	const weatherCityElement = document.getElementById("weather-city");
	const weatherStateElement = document.getElementById("weather-state");
	const weatherCountryElement = document.getElementById("weather-country");
	const cameraRefreshElement = document.getElementById("camera-refresh");
	const clockFormatElement = document.getElementById("clock-format");
	settingsJSON["weather-city"] = weatherCityElement.value;
	settingsJSON["weather-state"] = weatherStateElement.value;
	settingsJSON["weather-country"] = weatherCountryElement.value;
	settingsJSON["clock-format"] = clockFormatElement.checked;
	settingsJSON["camera-refresh"] = parseInt(cameraRefreshElement.value, 10);
	setStorage("settings", settingsJSON);
}

function bannerClick(event) {
	const currentElement = document.getElementsByClassName("active-banner");
	if (currentElement[0]) {
		currentElement[0].classList.remove("active-banner");
	}
	event.preventDefault();
	const clickElement = event.target;
	clickElement.classList.add("active-banner");
}
