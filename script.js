const adDomains = [
  "adtago.s3.amazonaws.com",
  "analyticsengine.s3.amazonaws.com",
  "analytics.s3.amazonaws.com",
  "advice-ads.s3.amazonaws.com",
  "pagead2.googlesyndication.com",
  "adservice.google.com",
  "pagead2.googleadservices.com",
  "afs.googlesyndication.com",
  "stats.g.doubleclick.net",
  "ad.doubleclick.net",
  "static.doubleclick.net",
  "m.doubleclick.net",
  "mediavisor.doubleclick.net",
  "ads30.adcolony.com",
  "adc3-launch.adcolony.com",
  "events3alt.adcolony.com",
  "wd.adcolony.com",
  "static.media.net",
  "media.net",
  "adservetx.media.net",
  "analytics.google.com",
  "click.googleanalytics.com",
  "google-analytics.com",
  "ssl.google-analytics.com",
  // Добавь ещё домены по желанию
];

const testButton = document.getElementById("testButton");
const percentageText = document.getElementById("percentage");
const progressCircle = document.getElementById("progressCircle");
const notBlockedContainer = document.getElementById("not-blocked-list");
const notBlockedList = document.getElementById("domain-list");

// SVG окружность
const radius = progressCircle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;
progressCircle.style.strokeDasharray = `${circumference}`;
progressCircle.style.strokeDashoffset = circumference;

// Обработчик кнопки
testButton.addEventListener("click", () => {
  // Сброс значений
  percentageText.textContent = "0%";
  progressCircle.style.stroke = "#ccc";
  progressCircle.style.strokeDashoffset = circumference;
  percentageText.style.color = "#000";
  notBlockedList.innerHTML = "";
  notBlockedContainer.style.display = "none";
  testButton.disabled = true;

  let tested = 0;
  let blockedCount = 0;
  const blockedDomains = [];
  const notBlockedDomains = [];

  // Проверка каждого домена
  adDomains.forEach((domain) => {
    fetch("https://" + domain, { method: "HEAD", mode: "no-cors" })
      .then(() => {
        // Не заблокирован
        notBlockedDomains.push(domain);
      })
      .catch(() => {
        // Заблокирован
        blockedCount++;
        blockedDomains.push(domain);
      })
      .finally(() => {
        tested++;
        if (tested === adDomains.length) {
          const percent = Math.round((blockedCount / adDomains.length) * 100);
          animateProgress(percent);
          updateSummary(adDomains.length, blockedCount, notBlockedDomains);
          testButton.disabled = false;
        }
      });
  });
});

// Анимация прогресса и цвета
function animateProgress(targetPercent) {
  const offset = circumference - (targetPercent / 100) * circumference;

  // Цвет по проценту
  let color = "#ef4444"; // красный
  if (targetPercent >= 85) color = "#22c55e"; // зелёный
  else if (targetPercent >= 50) color = "#f1c40f"; // жёлтый

  progressCircle.style.transition = "stroke-dashoffset 1s ease, stroke 0.5s ease";
  progressCircle.style.strokeDashoffset = offset;
  progressCircle.style.stroke = color;
  percentageText.style.color = color;

  // Анимация текста
  let current = 0;
  const stepTime = 20;
  const step = targetPercent / (1000 / stepTime);
  const interval = setInterval(() => {
    current += step;
    if (current >= targetPercent) {
      current = targetPercent;
      clearInterval(interval);
    }
    percentageText.textContent = `${Math.round(current)}%`;
  }, stepTime);
}

// Вывод списка незаблокированных
function updateSummary(total, blocked, notBlocked) {
  if (notBlocked.length > 0) {
    notBlockedList.innerHTML = "";
    notBlocked.forEach((domain) => {
      const li = document.createElement("li");
      li.textContent = domain;
      notBlockedList.appendChild(li);
    });
    notBlockedContainer.style.display = "block";
  }
}
