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
    // ... (добавьте остальные домены по необходимости)
  ];
  
  const testButton = document.getElementById("testButton");
  const percentageText = document.getElementById("percentage");
  const progressCircle = document.getElementById("progressCircle");
  
  // Расчет окружности SVG (радиус r = 50 => окружность ~314)
  const radius = progressCircle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  progressCircle.style.strokeDasharray = `${circumference}`;
  progressCircle.style.strokeDashoffset = circumference;
  
  let tested = 0;
  let blockedCount = 0;
  const blockedDomains = [];
  const notBlockedDomains = [];
  
  testButton.addEventListener("click", () => {
    // Сброс результатов
    tested = 0;
    blockedCount = 0;
    blockedDomains.length = 0;
    notBlockedDomains.length = 0;
    
    percentageText.textContent = "⏳";
    testButton.disabled = true;
    
    // Для каждого домена запускаем проверку
    adDomains.forEach((domain) => {
      // Используем fetch для запроса HEAD
      fetch("https://" + domain, { method: "HEAD", mode: "no-cors" })
        .then(() => {
          // Если запрос сработал, считаем домен НЕ заблокированным
          notBlockedDomains.push(domain);
        })
        .catch(() => {
          // Если произошла ошибка, считаем домен заблокированным
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
  
  function animateProgress(targetPercent) {
    // Синхронизированная анимация заполнения
    const offset = circumference - (targetPercent / 100) * circumference;
    
    // Выбираем цвет по проценту:
    // <50% -> красный; 50-84% -> желтый; >=85% -> зеленый.
    let color = "#ef4444"; // красный
    if (targetPercent >= 85) {
      color = "#22c55e"; // зеленый
    } else if (targetPercent >= 50) {
      color = "#f1c40f"; // желтый
    }
    
    progressCircle.style.transition = "stroke-dashoffset 1s ease, stroke 0.5s ease";
    progressCircle.style.strokeDashoffset = offset;
    progressCircle.style.stroke = color;
    percentageText.style.color = color;
    
    // Анимация числового значения
    let current = 0;
    const stepTime = 20; // обновление каждые 20 мс
    const step = targetPercent / (1000 / stepTime); // анимация в 1 секунду
    const interval = setInterval(() => {
      current += step;
      if (current >= targetPercent) {
        current = targetPercent;
        clearInterval(interval);
      }
      percentageText.textContent = `${Math.round(current)}%`;
    }, stepTime);
  }
  