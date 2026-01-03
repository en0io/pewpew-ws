### pewpew-ws

![img](pewpew.png)

pewpew-ws is a fork of @alexcpsec & @hrbrmstr's original project [https://github.com/hrbrmstr/pewpew](https://github.com/hrbrmstr/pewpew). Instead of using pre-generated statistical data, maps are drawn off of real-time data fed to it by the [pewpew-ws-server](https://github.com/en0io/pewpew-ws-server). pewpew-ws-server receives a CSV from a RabbitMQ queue that is published by the Project Maka backend.

The format of the CSV that this receives is as follows:

`$sourceip,$isp,$sourcelat,$sourcelon,$sourceISO3166,$destlat,$destlon,$destISO3166,$proto,$destport,$comment,$incidentid`

| Index | Description                                                                           |
|-------|---------------------------------------------------------------------------------------|
| 0     | Source IP Address                                                                     |
| 1     | ISP, usually blank unless you have a license for GeoIP2-ISP                           |
| 2     | Source Latitude, in our backend implementation this is pulled from GeoLite2-City      |
| 3     | Source Longitude, in our backend implementation this is pulled from GeoLite2-City     |
| 4     | Source ISO3166 Country Code                                                           |
| 5     | Destination Latitude, in our backend implementation this is pulled from GeoLite2-City |
| 6     | Destination Longitude, in our implementation this is pulled from GeoLite2-City        |
| 7     | Destination ISO3166 Country Code                                                      |
| 8     | Protocol                                                                              |
| 9     | Destination Port                                                                      |
| 10    | Comment, description, etc                                                             |
| 11    | Incident ID, in our backend this is the ID of the record in our database.             |

The latitude, longitude, ISP and ISO3166 country codes are pulled from GeoLite2 by the Project Maka backend.

Much like the original pewpew map, this utilizes the [datamaps](http://datamaps.github.io/) library.

