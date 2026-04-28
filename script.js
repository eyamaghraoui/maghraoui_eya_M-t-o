function getIcon(code) {
  if (code === 0) return "icon-sunny.webp";
  if (code <= 3) return "icon-partly-cloudy.webp";
  if (code >= 45 && code <= 48) return "icon-fog.webp";
  if (code >= 51 && code <= 67) return "icon-rain.webp";
  if (code >= 71 && code <= 77) return "icon-snow.webp";
  if (code >= 95) return "icon-storm.webp";
  return "icon-sunny.webp";
}

async function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) return;

  // 1. Géocodage
  const geo = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=fr&format=json`
  );
  const geoData = await geo.json();

  if (!geoData.results) return alert("Ville non trouvée");

  const { latitude, longitude, name, country } = geoData.results[0];

  // 2. Récupération météo (URL MISE À JOUR avec humidité et précipitation)
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,weathercode,relativehumidity_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
  );

  const data = await res.json();

  // 3. Affichage de l'état actuelle
  document.getElementById("city").textContent = name + ", " + country;
  document.getElementById("temp").textContent = data.current_weather.temperature + "°";
  document.getElementById("date").textContent = new Date().toLocaleDateString();
  document.getElementById("icon").src = getIcon(data.current_weather.weathercode);
  document.getElementById("wind").textContent = data.current_weather.windspeed + " km/h";
  document.getElementById("feels").textContent = data.current_weather.temperature + "°";

  // on vérifie si les données existent avant de les afficher
  document.getElementById("humidity").textContent = (data.hourly.relativehumidity_2m[0] || 0) + " %";
  document.getElementById("precip").textContent = (data.hourly.precipitation[0] || 0) + " mm";

  // Prévisions par jour
  let dailyHTML = "";
  for (let i = 0; i < data.daily.time.length; i++) {
    dailyHTML += `
      <div class="day">
        <p>${data.daily.time[i]}</p>
        <img src="${getIcon(data.daily.weathercode[i])}" width="40">
        <p>Max: ${data.daily.temperature_2m_max[i]}°</p>
        <p>Min: ${data.daily.temperature_2m_min[i]}°</p>
      </div>
    `;
  }
  document.getElementById("daily").innerHTML = dailyHTML;

  // Prévisions par heure - 10 prochaines heures
  let hourlyHTML = "";
  for (let i = 0; i < 10; i++) {
    hourlyHTML += `
      <div class="hour">
        <p>${data.hourly.time[i].slice(11, 16)}</p>
        <img src="${getIcon(data.hourly.weathercode[i])}" width="30">
        <p>${data.hourly.temperature_2m[i]}°</p>
      </div>
    `;
  }
  document.getElementById("hourly").innerHTML = hourlyHTML;
}