var weatherFormEl = document.querySelector("#weather-form");
var cityInputEl = document.querySelector("#cityname");
var cityContainerEl = document.querySelector("#city-container");
var citySearchTerm = document.querySelector("#city-search-term");
var historyEl = document.querySelector(".history-card");
var searchHistory = [];

var formSubmitHandler = function (event) {
  event.preventDefault();

  var cityName = cityInputEl.value.trim();

  if (cityName) {
    getWeatherForecast(cityName);

    cityContainerEl.textContent = "";
    cityInputEl.value = "";
  } else {
    alert("Please enter a city name");
  }
};

var getLatAndLon = function (city) {
  var geoAPI =
    "http://api.openweathermap.org/geo/1.0/direct?q=" +
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
    fetch(apiURL)
      .then(function (response) {
        if (response.ok) {
          console.log(response);
          response.json().then(function (data) {
            console.log(data);
            displayWeatherForecast(data, city);
            displayFutureForecasts(data, city);
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

  var weatherIcon = forecasts.current.weather[0].icon;
  var imgSrc = "http://openweathermap.org/img/w/" + weatherIcon + ".png";

  console.log(imgSrc);
  var currentDate = moment.unix(forecasts.current.dt).format("l");
  var weatherIconImg = document.createElement("img");
  weatherIconImg.setAttribute("src", imgSrc);

  citySearchTerm.innerHTML =
    searchTerm.charAt(0).toUpperCase() +
    searchTerm.slice(1) +
    " (" +
    currentDate +
    ")";

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

  console.log("forecasts", forecasts);

  if (currentUVINum.textContent <= 5) {
    currentUVINum.className = "uv-index-low";
  } else if (currentUVINum.textContent >= 6 || currentUVINum.textContent <= 7) {
    currentUVINum.className = "uv-index-moderate";
  } else {
    currentUVINum.className = "uv-index-severe";
  }

  currentUVI.appendChild(currentUVINum);
  cityContainerEl.append(
    weatherIconImg,
    currentTempEl,
    currentWindEl,
    currentHumidity,
    currentUVI
  );
};

var displayFutureForecasts = function (forecasts, searchTerm, iterations) {
  if (!iterations) {
    iterations = 5;
  }

  for (var i = 1; i <= iterations; i++) {
    var futureDates = moment.unix(forecasts.daily[i].dt).format("l");

    var futureDatesEl = document.createElement("h5");
    futureDatesEl.textContent = futureDates;

    var futureTempEl = document.createElement("p");
    var futureWindEl = document.createElement("p");
    var futureHumidity = document.createElement("p");

    var futureDayEl = document.getElementById(i.toString());
    removeAllChildNodes(futureDayEl);
    futureDayEl.append(futureDatesEl);

    //removeAllChildNodes(futureTempEl);
    //removeAllChildNodes(futureHomidity);
    console.log(futureDates);
    // console.log(forecasts.daily[i].temp.day);
  }
};

function removeAllChildNodes(parent) {
  // delete any existing children
  if (parent.hasChildNodes()) {
    var children = parent.childNodes;
    for (var j = 0; j < children.length; j++) {
      parent.removeChild(children[j]);
    }
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
    btn.textContent = searchHistory[i];
    historyEl.append(btn);
  }
}

weatherFormEl.addEventListener("submit", formSubmitHandler);
