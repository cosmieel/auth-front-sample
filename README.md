## Команды Makefile
- make test - запуск тестов
- make snapshots - обновление snaphot
- make test-watch - запуск тестов с watch
- make lint
- make build
- make dev - запуск dev сервер
- make install - установка нужных пакетов
- make start - установка пакетов и запуск dev сервера
- make reinstall - удаляет node_modules, package-lock.json и устанавливает по новой

## Структура проекта
В проекте разделение на 7 слоев:
- API - общение с бэками и локальным хранилищем,
- Commands - слой связывания UI с сервисами,
- UI,
- DAO(Data Access Objects) - слой доступа к данным, связывает сервисы с API
- Domains - слой бизнес-логики,
- Services - сервисный слой приложения
