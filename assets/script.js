var weatherFormEl = document.querySelector("#weather-form");
var cityInputEl = document.querySelector("#cityname");
var cityContainerEl = document.querySelector("#city-container");
var citySearchTerm = document.querySelector(".city-search-term");
var historyEl = document.querySelector(".history-card");
var searchHistory = [];

var formSubmitHandler = function (event) {
  event.preventDefault();

  var cityName = cityInputEl.value.trim();

  if (cityName) {
    getWeatherForecast(cityName);
    cityInputEl.value = "";
  } else {
    alert("Please enter a city name");
  }
};

var getLatAndLon = function (city) {
  var geoAPI =
    "https://api.openweathermap.org/geo/1.0/direct?q=" +
    city +
    "&appid=05aaec66fd7cc6f94d62dd575b7836a9";

  return fetch(geoAPI)
    .then(function (response) {
      if (response.ok) {
        console.log(response);
        return response.json().then(function (geoData) {
          return geoData;
        });
      }
    })
    .catch(function (error) {
      alert("Unable to connect to Open Weather");
    });
};

var getWeatherForecast = function (city) {
  getLatAndLon(city).then(function (geoData) {
    console.log(geoData);
    var lat = geoData[0].lat;
    var lon = geoData[0].lon;
    var apiURL =
      "https://api.openweathermap.org/data/2.5/onecall?lat=" +
      lat +
      "&lon=" +
      lon +
      "&exclude=minutely,hourly&units=imperial&appid=05aaec66fd7cc6f94d62dd575b7836a9";
    return fetch(apiURL)
      .then(function (response) {
        if (response.ok) {
          console.log(response);
          response.json().then(function (data) {
            console.log(data);
            displayWeatherForecast(data, city);
            displayFutureForecasts(data);
            appendToHistory(city);
            displayInHistory();
          });
        } else {
          alert("Error: " + response.statusText);
        }
      })
      .catch(function (error) {
        alert("Unable to connect to Open Weather");
      });
  });
};

var displayWeatherForecast = function (forecasts, searchTerm) {
  if (forecasts.length === 0) {
    cityContainerEl.textContent = "No forecasts found.";
    return;
  }

  var currentDate = moment.unix(forecasts.current.dt).format("l");
  var currentWeatherIcon = forecasts.current.weather[0].icon;

  citySearchTerm.innerHTML =
    searchTerm.charAt(0).toUpperCase() +
    searchTerm.slice(1) +
    " (" +
    currentDate +
    ")";

  var weatherIconImgEl = document.createElement("img");
  var imgSrc = "http://openweathermap.org/img/w/" + currentWeatherIcon + ".png";
  weatherIconImgEl.setAttribute("src", imgSrc);

  var currentTempEl = document.createElement("p");
  var currentWindEl = document.createElement("p");
  var currentHumidity = document.createElement("p");
  var currentUVI = document.createElement("p");
  var currentUVINum = document.createElement("span");

  currentUVINum.className = "uv-index";

  currentTempEl.textContent =
    "Temperature: " + forecasts.current.temp + "\xB0F";
  currentWindEl.textContent =
    "Wind Speed: " + forecasts.current.wind_speed + "MPH";
  currentHumidity.textContent = "Humidity: " + forecasts.current.humidity + "%";
  currentUVI.textContent = "UV Index: ";
  currentUVINum.textContent = forecasts.current.uvi;

  if (currentUVINum.textContent <= 5) {
    currentUVINum.className = "uv-index-low";
  } else if (currentUVINum.textContent >= 6 || currentUVINum.textContent <= 7) {
    currentUVINum.className = "uv-index-moderate";
  } else {
    currentUVINum.className = "uv-index-severe";
  }
  removeAllChildNodes(cityContainerEl);
  currentUVI.appendChild(currentUVINum);
  cityContainerEl.append(
    weatherIconImgEl,
    currentTempEl,
    currentWindEl,
    currentHumidity,
    currentUVI
  );
};

var displayFutureForecasts = function (forecasts) {
  const iterations = 5;
  for (var i = 1; i <= iterations; i++) {
    var futureDatesText = moment.unix(forecasts.daily[i].dt).format("l");
    var futureDatesEl = document.createElement("h5");
    futureDatesEl.textContent = futureDatesText;

    var futureWeatherIcon = forecasts.daily[i].weather[0].icon;
    var futureWeatherIconImgEl = document.createElement("img");
    var imgSrc =
      "http://openweathermap.org/img/w/" + futureWeatherIcon + ".png";
    futureWeatherIconImgEl.setAttribute("src", imgSrc);

    var futureTempEl = document.createElement("p");
    var futureWindEl = document.createElement("p");
    var futureHumidityEl = document.createElement("p");

    futureTempEl.textContent = "Temp: " + forecasts.daily[i].temp.day + "\xB0F";
    futureWindEl.textContent = "Wind: " + forecasts.daily[i].wind_speed + "MPH";
    futureHumidityEl.textContent =
      "Humidity: " + forecasts.daily[i].humidity + " %";

    var futureDaysEl = document.getElementById(i.toString());

    removeAllChildNodes(futureDaysEl);
    futureDaysEl.style.border = "solid 1px";
    futureDaysEl.style.padding = "5px";
    futureDaysEl.style.backgroundColor = "gray";

    futureDaysEl.append(
      futureDatesEl,
      futureWeatherIconImgEl,
      futureTempEl,
      futureWindEl,
      futureHumidityEl
    );
  }
};

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function appendToHistory(city) {
  if (searchHistory.indexOf(city) !== -1) {
    return;
  }
  searchHistory.push(city);
  localStorage.setItem("cities", JSON.stringify(searchHistory));
}

function displayInHistory() {
  historyEl.innerHTML = "";
  for (var i = searchHistory.length - 1; i >= 0; i--) {
    var btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.setAttribute("class", "historyBtn");
    btn.textContent = searchHistory[i];
    btn.addEventListener("click", displayHistoryData);
    historyEl.append(btn);
  }
}

function displayHistoryData(event) {
  var searchHistoryButton = event.target;
  var historicalSearch = searchHistoryButton.textContent;
  getWeatherForecast(historicalSearch);
}

function init() {
  var storedCities = localStorage.getItem("cities");
  var storedCitiesArr = JSON.parse(storedCities);
  var historyEl = document.querySelector(".history-card");

  for (var i = 0; i < storedCitiesArr.length; i++) {
    var btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.setAttribute("class", "historyBtn");
    btn.textContent = storedCitiesArr[i];
    console.log(btn.textContent);

    historyEl.append(btn);
    btn.addEventListener("click", displayHistoryData);
  }
}

weatherFormEl.addEventListener("submit", formSubmitHandler);

init();
