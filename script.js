const apiKey = '0228b57aec4b75d2e0d634961aff53b4';

const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const weatherInfoContainer = document.querySelector('#weather-info-container');

// โหลดข้อมูลล่าสุดเมื่อเปิดเว็บ
document.addEventListener('DOMContentLoaded', () => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        getWeather(lastCity);
    }
});

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const cityName = cityInput.value.trim();

    if (cityName) {
        localStorage.setItem('lastCity', cityName); // บันทึกชื่อเมืองล่าสุด
        getWeather(cityName);
    } else {
        alert('กรุณาป้อนชื่อเมือง');
    }
});

async function getWeather(city) {
    weatherInfoContainer.innerHTML = `<p>กำลังโหลดข้อมูล...</p>`;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=th`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('ไม่พบข้อมูลเมืองนี้');
        }
        const data = await response.json();
        displayWeather(data);
        getForecast(city); // เรียกพยากรณ์ล่วงหน้า
    } catch (error) {
        weatherInfoContainer.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

function displayWeather(data) {
    const { name, main, weather } = data;
    const { temp, humidity } = main;
    const { description, icon } = weather[0];

    const weatherHtml = `
        <h2>${name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <p style="font-size: 2rem; font-weight: bold;">${temp.toFixed(1)}°C</p>
        <p>${description}</p>
        <p>ความชื้น: ${humidity}%</p>
        <div id="forecast-container" style="margin-top: 2rem;"></div>
    `;
    weatherInfoContainer.innerHTML = weatherHtml;
}

// ฟังก์ชันดึงพยากรณ์อากาศล่วงหน้า 5 วัน
async function getForecast(city) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=th`;

    try {
        const response = await fetch(forecastUrl);
        if (!response.ok) {
            throw new Error('ไม่สามารถดึงข้อมูลพยากรณ์อากาศได้');
        }
        const data = await response.json();

        // เลือกเฉพาะข้อมูลเวลา 12:00 ของแต่ละวัน
        const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

        let forecastHTML = `<h3>พยากรณ์ 5 วันถัดไป</h3><div style="display: flex; gap: 10px; overflow-x: auto;">`;
        dailyData.forEach(day => {
            const date = new Date(day.dt_txt);
            const dayName = date.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });
            forecastHTML += `
                <div style="background: rgba(255,255,255,0.15); padding: 10px; border-radius: 8px; text-align: center; min-width: 100px;">
                    <p>${dayName}</p>
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
                    <p style="font-weight: bold;">${day.main.temp.toFixed(1)}°C</p>
                    <p style="font-size: 0.85rem;">${day.weather[0].description}</p>
                </div>
            `;
        });
        forecastHTML += `</div>`;

        document.getElementById('forecast-container').innerHTML = forecastHTML;

    } catch (error) {
        document.getElementById('forecast-container').innerHTML = `<p class="error">${error.message}</p>`;
    }
}
