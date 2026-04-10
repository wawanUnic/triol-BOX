Оборудование: старый роутер TL‑WR740N ver.4
ОС роутера: OpenWrt 19.07 (для TL‑WR740N)

0. Цель:
- получить доступ по SSH,
- исправить проблемы с ключами,
- настроить безопасный вход,
- включить работу через SSH‑туннель,
- отключить парольный вход в SSH через веб‑морду.

1. Создаем ключ на стороннем компьютере (не на роутере):
```
ssh-keygen -t rsa -b 2048 -f C:\keys\openwrt_key
```
Проверить публичный ключ:
```
cat C:\keys\openwrt_key.pub
```

2. Загрузка публичного ключа через веб‑интерфейс:

В LuCI: System → Administration → SSH Access → Authorized Keys → Upload SSH Key File. Туда загружается публичный ключ (openwrt_key.pub). Dropbear автоматически создаёт:
```
/etc/dropbear/authorized_keys
```

3. Конвертация приватного ключа в формат PuTTY:

PuTTY не понимает OpenSSH‑ключи, поэтому открываем PuTTYgen. В PuTTYgen: Conversions → Import key. Выбраем C:\keys\openwrt_key. Сохранили как openwrt_key.ppk. Теперь PuTTY может использовать ключ.

4. Подключение по ключу:

В PuTTY: Host: 192.168.112.48, Port: 23, Connection → SSH → Auth → Credentials → Private key file: openwrt_key.ppk. После этого SSH‑вход работает без пароля. В Connection → Data настраиваем имя пользователя для автоматической подстановки при подклчении.

5. Отключение входа по паролю в SSH через веб‑интерфейс:

В LuCI: System → Administration → SSH Access → Dropbear Instance. Отключаем:
```
Allow SSH password authentication
Allow root logins with password
```
Теперь SSH принимает только ключи.

6. Важное уточнение: веб‑интерфейс всегда использует пароль! LuCI не поддерживает SSH‑ключи, поэтому:
- пароль root остаётся для веб‑интерфейса,
- но SSH теперь работает только по ключу.

7. SSH‑туннель как способ безопасно работать с веб‑интерфейсом без TLS:

Так как роутер не поддерживает HTTPS, настраиваем SSH‑туннель:
```
ssh -p 23 -L 8080:192.168.112.48:80 root@192.168.112.48
```
Теперь в браузере открываем http://localhost:8080 и весь трафик идёт внутри SSH‑шифрования, а веб‑интерфейс фактически защищен.

8. Отключем оболочку в PuTTY:

Включаем опцию в PuTTY: Connection → SSH → Don’t start a shell or command at all. Из‑за этого:
- SSH‑туннель работает,
- интерактивная оболочка не запускалается.
