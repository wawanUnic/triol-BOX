// === ПОДСВЕТКА ТЕКСТА ===
let topo = document.getElementById("topology");
let html = topo.innerText;

// Красные слова
html = html.replace(/WAN/g, '<span class="red">WAN</span>');
html = html.replace(/LAN/g, '<span class="green">LAN</span>');

// IP-адреса
html = html.replace(/192\.168\.[0-9]+\.[0-9]+/g, '<span class="blue">$&</span>');

topo.innerHTML = html;

// === АВТОМАТИЧЕСКАЯ ССЫЛКА НА ТОТ ЖЕ ХОСТ, НО ДРУГОЙ ПОРТ ===
function sameHost(port) {
    return location.protocol + "//" + location.hostname + ":" + port;
}

// Например, хотим порт 81:
const port81 = sameHost(81);
const port82 = sameHost(82);
const port83 = sameHost(83);
const port84 = sameHost(84);
const port85 = sameHost(85);
const port86 = sameHost(86);

// === КЛИКАБЕЛЬНЫЕ ЗОНЫ ===
// Функция для создания кликабельного прямоугольника
function zone(x, y, w, h, url) {
    const z = document.createElement("div");
    z.className = "click-zone";
    z.style.left = x + "px";
    z.style.top = y + "px";
    z.style.width = w + "px";
    z.style.height = h + "px";
    z.onclick = () => window.open(url, "_blank");

    // ВАЖНО: добавляем зоны внутрь topology-wrapper
    document.querySelector(".topology-wrapper").appendChild(z);
}

// Пример: зона поверх главного роутера
zone(365, 70, 188, 200, port81);
zone(20, 368, 177, 170, port82);
zone(250, 368, 177, 170, port83);
zone(479, 368, 177, 170, port84);
zone(705, 368, 177, 170, port85);
zone(21, 668, 104, 35, port86);

fetch("cgi-bin/wan_ip")
    .then(r => r.text())
    .then(ip => {
        ip = ip.trim();

        // если у тебя есть блок в шапке
        const wanTop = document.getElementById("wan-ip");
        if (wanTop) wanTop.innerText = "WAN IP: " + ip;

        // строка над схемой
        const inline = document.getElementById("wan-inline");
        if (inline) inline.textContent = "WAN (" + ip + ")";
    })
    .catch(() => {
        const inline = document.getElementById("wan-inline");
        if (inline) inline.textContent = "WAN (недоступен)";
    });
