Инструкция по настройке OpenWRT для подключения к Wi‑Fi‑устройству в режиме клиента (STA), с сохранением доступа через WAN

OpenWRT 19.07.x
TP‑Link TL‑WR740N v4
подключения к Wi‑Fi‑точке доступа (например, вашей embedded‑плате)

Во время настройки произойдёт два кратковременных обрыва SSH‑соединения через WAN:
- При включении Wi‑Fi‑радио
- При перезагрузке Wi‑Fi после добавления клиента
Это нормальное поведение. Просто переподключитесь по SSH через WAN и продолжайте с того же шага.

WAN‑маршрут мы не трогаем, поэтому доступ всегда восстанавливается.

### 1. Включение Wi‑Fi‑радио
```
uci set wireless.radio0.disabled='0'
uci commit wireless
wifi reload
```
Wi‑Fi включится, SSH может оборваться на 1–2 секунды. Просто переподключитесь.
```
wifi status
{
        "radio0": {
                "up": true,
                "pending": false,
                "autostart": true,
                "disabled": false,
                "retry_setup_failed": false,
                "config": {
                        "channel": "11",
                        "hwmode": "11g",
                        "path": "platform/ahb/18100000.wmac",
                        "htmode": "HT20",
                        "disabled": false
                },
                "interfaces": [
                        {
                                "section": "default_radio0",
                                "ifname": "wlan0",
                                "config": {
                                        "mode": "ap",
                                        "ssid": "OpenWrt",
                                        "encryption": "none",
                                        "network": [
                                                "lan"
                                        ],
                                        "mode": "ap"
                                }
                        }
                ]
        }
}
```

### 2. Создание Wi‑Fi‑клиента (режим STA)
```
uci add wireless wifi-iface
uci set wireless.@wifi-iface[-1].device='radio0'
uci set wireless.@wifi-iface[-1].mode='sta'
uci set wireless.@wifi-iface[-1].ssid='SSID_DEVICE'
uci set wireless.@wifi-iface[-1].encryption='psk2'
uci set wireless.@wifi-iface[-1].key='PASSWORD'
uci set wireless.@wifi-iface[-1].network='wwan'
uci commit wireless
wifi reload
```
Wi‑Fi перезапустится, SSH может оборваться. Снова переподключитесь по WAN.

### 3. Создание интерфейса WWAN (DHCP‑клиент)
```
uci set network.wwan=interface
uci set network.wwan.proto='dhcp'
```
❗ Запретить WWAN менять default‑маршрут. Это гарантирует, что SSH через WAN не пропадёт.
```
uci set network.wwan.defaultroute='0'
uci set network.wwan.peerdns='0'
uci commit network
```
Теперь поднимаем интерфейс:
```
ifup wwan
```
WAN остаётся основным → SSH не пропадает.

### 4. Проверка подключения WWAN
``` 
status wwan
{
        "up": true,
        "pending": false,
        "available": true,
        "autostart": true,
        "dynamic": false,
        "uptime": 1,
        "l3_device": "wlan0",
        "proto": "dhcp",
        "device": "wlan0",
        "updated": [
                "addresses",
                "routes",
                "data"
        ],
        "metric": 0,
        "dns_metric": 0,
        "delegation": true,
        "ipv4-address": [
                {
                        "address": "192.168.18.250",
                        "mask": 24
                }
        ],
        "ipv6-address": [

        ],
        "ipv6-prefix": [

        ],
        "ipv6-prefix-assignment": [

        ],
        "route": [

        ],
        "dns-server": [

        ],
        "dns-search": [

        ],
        "neighbors": [

        ],
        "inactive": {
                "ipv4-address": [

                ],
                "ipv6-address": [

                ],
                "route": [
                        {
                                "target": "0.0.0.0",
                                "mask": 0,
                                "nexthop": "192.168.18.2",
                                "source": "192.168.18.250/32"
                        }
                ],
                "dns-server": [

                ],
                "dns-search": [

                ],
                "neighbors": [

                ]
        },
        "data": {
                "leasetime": 3600
        }
}
```
Если интерфейс получил IP (например 192.168.18.x) — всё работает.

### 5. Создание firewall‑зоны WWAN
```
uci add firewall zone
uci set firewall.@zone[-1].name='wwan'
uci set firewall.@zone[-1].network='wwan'
uci set firewall.@zone[-1].input='ACCEPT'
uci set firewall.@zone[-1].output='ACCEPT'
uci set firewall.@zone[-1].forward='ACCEPT'
uci commit firewall
/etc/init.d/firewall restart
```
--- reload ---

### 6 Разрешение маршрутизации WAN ↔ WWAN
WAN → WWAN:
```
uci add firewall forwarding
uci set firewall.@forwarding[-1].src='wan'
uci set firewall.@forwarding[-1].dest='wwan'
```
WWAN → WAN:
```
uci add firewall forwarding
uci set firewall.@forwarding[-1].src='wwan'
uci set firewall.@forwarding[-1].dest='wan'
```
Применяем:
```
uci commit firewall
/etc/init.d/firewall restart
```
--- reload ---

### 7. Проверка связи с устройством
На роутере:
```
ping 192.168.18.2
```
На Raspberry Pi (LAN):
```
ping 192.168.18.2
```
Если пингуется — всё готово.

### 8. (Необязательно) Проброс порта WAN → устройство
Пример: WAN:8080 → 192.168.18.2:80
```
uci add firewall redirect
uci set firewall.@redirect[-1].name='to_device'
uci set firewall.@redirect[-1].src='wan'
uci set firewall.@redirect[-1].src_dport='8080'
uci set firewall.@redirect[-1].dest='wwan'
uci set firewall.@redirect[-1].dest_ip='192.168.18.2'
uci set firewall.@redirect[-1].dest_port='80'
uci set firewall.@redirect[-1].proto='tcp'
uci commit firewall
/etc/init.d/firewall restart
```

### Результат. После выполнения всех шагов:
- SSH через WAN остаётся доступным
- OpenWRT подключается к вашему устройству по Wi‑Fi
- WWAN не ломает маршрутизацию
- WAN → WWAN → устройство работает
- Можно пробрасывать порты на устройство

### Включение маршрутизации LAN → WWAN в OpenWRT

### 1. Разрешить форвардинг LAN → WWAN
uci add firewall forwarding
uci set firewall.@forwarding[-1].src='lan'
uci set firewall.@forwarding[-1].dest='wwan'

### 2. Включить NAT (masquerading) на зоне WWAN
###    Это обязательно, иначе Wi‑Fi‑устройство не сможет отвечать LAN‑клиентам.
uci set firewall.@zone[2].masq='1'

# 3. Применить настройки
uci commit firewall
/etc/init.d/firewall restart
