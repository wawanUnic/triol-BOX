# triol-BOX
Triol-BOX


Проблема1: Клиент Windows OpenSSH не принимает старый ключ ssh-rsa. Старые роутеры (особенно с Dropbear) поддерживают только ssh-rsa. Новые версии OpenSSH в Windows его отключили, поэтому сначала возникла ошибка:
```
no matching host key type found. Their offer: ssh-rsa
```
Решение: добавить параметры
```
ssh -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa root@192.168.8.1
```

Проблема2: Невозмодно скопировать файлы. Windows SCP использует SFTP, а не SCP. Хотя команда называется SCP, Windows‑клиент фактически работает через SFTP, а на роутере SFTP‑сервера нет. Поэтому появилась ошибка:
```
ash: /usr/libexec/sftp-server: not found
```
Dropbear (встроенный SSH‑сервер OpenWrt) не поддерживает SFTP, только SCP. Файл не копируется и соединение закрывается. Нужно использовать pscp.exe из PuTTY. Он использует настоящий SCP‑протокол:
```
pscp -scp favicon.ico root@192.168.8.1:/www/TP-link_BOX/
```
