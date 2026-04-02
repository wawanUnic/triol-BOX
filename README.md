# triol-BOX
Triol-BOX


1. Клиент Windows OpenSSH не принимает старый ключ ssh-rsa
Старые роутеры (особенно с Dropbear) поддерживают только ssh-rsa.
Новые версии OpenSSH в Windows его отключили, поэтому сначала возникла ошибка:

```
no matching host key type found. Their offer: ssh-rsa
```

Решение: добавить параметры
```
-o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa
```

2. Windows SCP использует SFTP, а не SCP
Хотя команда называется scp, Windows‑клиент фактически работает через SFTP, а на роутере SFTP‑сервера нет.

Поэтому появилась ошибка:

```
ash: /usr/libexec/sftp-server: not found
```

Dropbear (встроенный SSH‑сервер OpenWrt) не поддерживает SFTP, только SCP.

Почему это ломает загрузку файла
Windows SCP → пытается открыть SFTP

Роутер → не имеет SFTP‑сервера

Соединение закрывается → файл не копируется

Рабочие решения
1. Использовать WinSCP (рекомендуется)
Выбрать протокол SCP, и всё заработает.

2. Использовать pscp.exe из PuTTY
Он использует настоящий SCP‑протокол:

```
pscp -scp favicon.ico root@192.168.117.50:/www/TP-link_BOX/
```

3. Установить SFTP‑сервер на роутер (если возможно)
Но на старых устройствах часто нет места.

Итог
Проблема не в файле и не в команде, а в несовместимости:

новый SCP‑клиент Windows → требует SFTP

старый OpenWrt → не умеет SFTP

Поэтому нужно использовать WinSCP или PuTTY pscp, которые работают через настоящий SCP.
