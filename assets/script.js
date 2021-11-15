var weatherFormEl = document.querySelector("#weather-form");
var cityInputEl = document.querySelector("#cityname");
var cityContainerEl = document.querySelector("#city-container");

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

var getWeatherForecast = function (city) {
  var apiURL =
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
    city +
    "&appid=05aaec66fd7cc6f94d62dd575b7836a9";

  fetch(apiURL)
    .then(function (response) {
      if (response.ok) {
        console.log(response);
        response.json().then(function (data) {
          console.log(data);
          displayWeatherForecast(data, city);
        });
      } else {
        alert("Error: " + response.statusText);
      }
    })
    .catch(function (error) {
      alert("Unable to connect to Open Weather");
    });
};

// var displayWeatherForecast = function()

weatherFormEl.addEventListener("submit", formSubmitHandler);
