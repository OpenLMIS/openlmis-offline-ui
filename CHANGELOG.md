1.0.1 / WIP
==================

Improvements:
* [OLMIS-7314](https://openlmis.atlassian.net/browse/OLMIS-7314): Update scss files to enable webpack build.

Bug fixes:
* [OLMIS-7314](https://openlmis.atlassian.net/browse/OLMIS-7314): Fix tests after karma upgrade.

1.0.0 / 2021-05-27
==================

New functionality that are backwards-compatible:
* [OLMIS-7209](https://openlmis.atlassian.net/browse/OLMIS-7209): Added pending offline events service decorator which retrieves events from local storage.
* [OLMIS-7198](https://openlmis.atlassian.net/browse/OLMIS-7198): Added the Pending Offline events screen with pending operations table.
* [OLMIS-7205](https://openlmis.atlassian.net/browse/OLMIS-7205): Updated the event service method to return only events that have not been synchronized before.
* [OLMIS-7207](https://openlmis.atlassian.net/browse/OLMIS-7207): Updated offline events service decorator which retrieves sync event errors from local storage.
* [OLMIS-7222](https://openlmis.atlassian.net/browse/OLMIS-7222): Display offline events synchronization errors in table.
