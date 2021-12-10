var currentSrcIndex = 0;
var iterateSeconds = 4;
var defaultDelay = 0;
var weatherCity = "Highland";
var weatherState = "UT";
var weatherCountry = "US";
var weatherData = null;
var clockFormat = "12";
var camTO = null;
var weatherCounter = 0;
var clockCounter = 0;
var imageList = [];
var dateString = "";
var dateToggleTO = null;
var dateToggleBool = true;
var lastClockUpdate = null;

function sourceCameras() {
	const cameraList = getCams();
	const thumbnailElement = document.getElementById("thumbnails");
	for (var x in cameraList) {
		const cam = cameraList[x];
		const index = x;
		const camImage = document.createElement("img");
		camImage.onerror = function() {
			this.src = "assets/images/no_image.png";
		};
		camImage.onclick = function() {
			clickThumbnail(this);
		};
		camImage.setAttribute("data-bannerpos", cam.bannerPos);
		camImage.setAttribute("data-index", index);
		thumbnailElement.appendChild(camImage);
	}
	const settings = getStorage("settings");
	if (settings && settings["weather-city"]) {
		weatherCity = settings["weather-city"];
	}
	if (settings && settings["weather-state"]) {
		weatherState = settings["weather-state"];
	}
	if (settings && settings["weather-country"]) {
		weatherCountry = settings["weather-country"];
	}
	if (settings && settings["camera-refresh"]) {
		iterateSeconds = settings["camera-refresh"];
	}
	if (settings && settings["clock-format"]) {
		clockFormat = settings["clock-format"];
	}

	getWeather();
	updateClock();
	updateCamSrc();
	camTO = setInterval(updateCamSrc, iterateSeconds * 1000);

	document.getElementById("image-element").ontouchmove = function(event) {
		event.preventDefault();
	};
}

function updateClock() {
	var now = new Date();
	lastClockUpdate = now;
	var hour = now.getHours();
	var minute = now.getMinutes();
	if ((hour === 11 || hour === 23) && minute === 59) {
		setTimeout(function() {
			document.location.href = document.location.href;
		}, 1000 * 61);
	}
	if (hour > 12) {
		hour = clockFormat === "12" ? hour - 12 : hour;
	}
	if (hour === 0) {
		hour = clockFormat === "12" ? 12 : "00";
	}
	if (minute < 10) {
		minute = "0" + minute;
	}
	if (dateString === "" || (hour === 0 && minute === 0)) {
		dateString = formatDate(now);
		document.getElementById("date").innerHTML = dateString;
	}
	document.getElementById("time").innerHTML = hour + ":" + minute;
}

function formatDate(dateObj) {
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	];
	const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	return (
		days[dateObj.getDay()] +
		" " +
		months[dateObj.getMonth()] +
		" " +
		dateObj.getDate()
	);
}

function getWeather() {
	var request = new XMLHttpRequest();
	request.open(
		"GET",
		'http://api.openweathermap.org/data/2.5/weather?q='+weatherCity+','+weatherState+','+weatherCountry+'&appid=5c730330ff31b280e3ac55b845461d48&units=imperial');
	request.onload = function() {
		if (this.response) {
			var data = JSON.parse(this.response);
			console.log(data);
			var currentWeather = data.weather[0];
			var weather = {
				today: {
					high: Math.round(data.main.temp_max),
					low: Math.round(data.main.temp_min),
				},
				condition: {
					temperature: Math.round(data.main.temp),
					code: currentWeather.id,
					text: currentWeather.description
				}
			};
			storage.setItem("weatherData", JSON.stringify(weather));
		}
		updateWeather();
	};
	request.send();
}

function updateWeather() {
	const hasWeatherData = weatherData !== null;
	var storedWeatherData = storage.getItem("weatherData");
	weatherData = storedWeatherData ? JSON.parse(storedWeatherData) : {};
	var condition = weatherData ? weatherData.condition : {};
	var today = weatherData.today;
	document.getElementById("temp").innerHTML =
		condition.temperature + "<i>&deg;</i>";
	document.getElementById("hi").innerHTML = today.high;
	document.getElementById("lo").innerHTML = today.low;
	const conditionElement = document.getElementById("condition");
	conditionElement.innerHTML = condition.text;
	conditionElement.className = "condition-" + condition.code;
	if (!hasWeatherData) {
		toggleDateWeather();
	}
}

function toggleDateWeather() {
	if (dateToggleTO) {
		clearTimeout(dateToggleTO);
	}
	dateToggleBool = !dateToggleBool;
	document
		.getElementById("condition-date-toggle")
		.setAttribute("class", dateToggleBool ? "" : "show-date");
	dateToggleTO = setTimeout(toggleDateWeather, 5000);
}

function updateCamSrc() {
	const now = new Date();
	if(now.getDate() !== lastClockUpdate.getDate()){
		dateString = "";
		getWeather();
		updateClock();
	}
	clockCounter = clockCounter + iterateSeconds;
	if (clockCounter === 60) {
		updateClock();
		clockCounter = 0;
	}
	weatherCounter = weatherCounter + iterateSeconds;
	if (weatherCounter === 600) {
		weatherCounter = 0;
		getWeather();
	}
	const cameraList = getCams();
	if (defaultDelay > 0) {
		defaultDelay = defaultDelay - 1000 * iterateSeconds;
	} else {
		currentSrcIndex = 0;
	}
	if (imageList.length === 0) {
		const thumbnailElement = document.getElementById("thumbnails");
		imageList = thumbnailElement.getElementsByTagName("img");
	}
	for (var i = 0; i < imageList.length; i++) {
		const thumbnailElement = imageList[i];
		thumbnailElement.src = getCameraModelSrc(cameraList[i]);
		if (currentSrcIndex === i) {
			setZoomImg(thumbnailElement);
		}
	}
}

function getCameraModelSrc(cam) {
	const key = cam.model;
	const ts = new Date().getTime();
	const timestamp = "xwing" + ts + "fighter";

	var returnString = "";
	switch (key) {
		case "Wyze":
			returnString +=
				"http://" +
				cam.username +
				":" +
				cam.password +
				"@" +
				cam.ip +
				"/image.jpg?ts=" +
				timestamp;
			break;
		case "Ring":
			returnString +=
				"http://" +
				cam.username +
				":" +
				cam.password +
				"@" +
				cam.ip +
				"/image.cgi?type=motion&camera=0&ts=" +
				timestamp;

			break;
		default:
			returnString +=
				"http://" +
				cam.ip +
				"/cgi-bin/api.cgi?cmd=Snap&channel=0&rs=" +
				timestamp +
				"&user=" +
				cam.username +
				"&password=" +
				cam.password;
			break;
	}
	return returnString;
}

function setZoomImg(thumbnailElement) {
	const bannerPos = thumbnailElement.getAttribute("data-bannerpos");
	const currentActive = document.getElementsByClassName("active")[0];
	if (currentActive && thumbnailElement !== currentActive) {
		currentActive.setAttribute("class", "");
	}
	thumbnailElement.setAttribute("class", "active");
	const zoomImgElement = document.getElementById("image-element");
	zoomImgElement.src = thumbnailElement.getAttribute("src");
	const timeContainerElement = document.getElementById("time-container");
	timeContainerElement.setAttribute("class", bannerPos);
}

function clickThumbnail(imgElement) {
	const index = parseInt(imgElement.getAttribute("data-index"));
	const thumbnailElement = document.getElementById("thumbnails");
	imageList = thumbnailElement.getElementsByTagName("img");
	setZoomImg(imageList[index]);
	currentSrcIndex = parseInt(index);
	defaultDelay = 30 * 1000;
}

function goToSetup() {
	const currentLocation = document.location.href;
	const setupLocation = currentLocation.replace("monitor.html", "");
	document.location.href = setupLocation;
}
