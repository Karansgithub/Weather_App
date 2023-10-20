const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const root = document.documentElement.style;
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const error=document.querySelector(".error-container");
const light=document.querySelector(".light");
const dark=document.querySelector(".dark");

//initially vairables need????

let oldTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
oldTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(newTab) {
    if(newTab != oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")) {
            //kya search form wala container is invisible, if yes then make it visible
            error.classList.remove("active");
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            //main pehle search wale tab pr tha, ab your weather tab visible karna h
            error.classList.remove("active"); 
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //ab main your weather tab me aagya hu, toh weather bhi display karna poadega, so let's check local storage first
            //for coordinates, if we haved saved them there.
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(searchTab);
});

// - - - - - - - - - - - -User Weather Handling- - - - - - - - - - - -
const grantAccessBtn = document.querySelector("[data-grantAccess]");
const messageText = document.querySelector("[data-messageText]");
const apiErrorImg = document.querySelector("[data-notFoundImg]");
const apiErrorMessage = document.querySelector("[data-apiErrorText]");
const apiErrorBtn = document.querySelector("[data-apiErrorBtn]");


function renderWeatherInfo(weatherInfo) {
    //fistly, we have to fetch the elements 
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //fetch values from weatherINfo object and put it UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText =`${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;


}


function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        grantAccessBtn.style.display = "none";
        messageText.innerText = "Geolocation is not supported by this browser.";
    }
}

// Handle any errors
function showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        messageText.innerText = "You denied the request for Geolocation.";
        break;
      case error.POSITION_UNAVAILABLE:
        messageText.innerText = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        messageText.innerText = "The request to get user location timed out.";
        break;
      case error.UNKNOWN_ERROR:
        messageText.innerText = "An unknown error occurred.";
        break;
    }
}

//check if cordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        //agar local coordinates nahi mile
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }

}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);

}
async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    // make grantcontainer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");

    //API CALL
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
        const  data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
            // console.log("User - Api Fetch Error", error.message);
    loadingScreen.classList.remove("active");
    error.classList.add("active");
    apiErrorImg.style.display = "none";
    apiErrorMessage.innerText = `Error: ${error?.message}`;
    apiErrorBtn.addEventListener("click", fetchUserWeatherInfo);

    }
}


grantAccessBtn.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "")
        return;
    else 
        fetchSearchWeatherInfo(cityName);
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();
        if(data?.main?.temp == undefined){
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");
        error.classList.add("active");
        }else{
            error.classList.remove("active");
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        }
    }
    catch(err) {
    // console.log("Search - Api Fetch Error", error.message);
    loadingScreen.classList.remove("active");
    error.classList.add("active");
    apiErrorMessage.innerText = `${error?.message}`;
    apiErrorBtn.style.display = "none";
    }
}
getdark();
light.addEventListener("click", getlight);
function getlight(){
    dark.classList.add("active");
    light.classList.remove("active");
}
dark.addEventListener("click", getdark);
function getdark(){
    dark.classList.remove("active");
    light.classList.add("active");
}
function darkModeProperties() {
    root.setProperty("--colorDark1", "#112D4E");
    root.setProperty("--colorDark2", "#141D2F");
    root.setProperty("--lm-text", "white");
    root.setProperty("--lm-bg", "#141D2F");
    root.setProperty("--colorLight2", "#60abff");
    root.setProperty("--colorLight1", "#6eb3f0");
    document.body.style.backgroundImage = "url('./assets/dark7.avif')";
  }
  function lightModeProperties() {
    root.setProperty("--colorDark1", "#adf");
    root.setProperty("--colorDark2", "#def");
    root.setProperty("--lm-bg", "#F6F8FF");
    root.setProperty("--colorLight1", "#759eeb");
    root.setProperty("--colorLight2", "#F9F7F7");
    root.setProperty("--lm-text", "#4B6A9B");
    document.body.style.backgroundImage = "url('./assets/light.jpg')";
  }