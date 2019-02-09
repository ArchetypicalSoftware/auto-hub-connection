# AutoHubConnection

AutoHubConnection is a simple wrapper to the .net core signalr client implementation. It automates the logic necessary to reconnecting after a unexpected disconnect.

## Installation

Install globally via npm:

```sh
npm install -g @archetypical/auto-hub-connection
```

Or globally via yarn:

```sh
yarn global add @archetypical/auto-hub-connection
```

## Usage

Once you have established your [server side hub](https://docs.microsoft.com/en-us/aspnet/core/signalr/hubs?view=aspnetcore-2.2), you can connect to it with a new AutoHubConnection. It includes all the same methods provided by the [signalr client](https://docs.microsoft.com/en-us/javascript/api/@aspnet/signalr/hubconnection?view=signalr-js-latest) with the same expected functionality.

In addition to the existing functionality, AutoHubConnection provides simple instantiation of a new connection and the logic to automatically reconnect when there is a network disconnect.

### Instantiation

When creating a new AutoHubConnection, you must provide a host.

```js
const autoHubConnection = new AutoHubConnection('/MyHubPath');
```

Optionally you can provide configuration settings used to change the reconnect behavior.

```js
const autoHubConnection = new AutoHubConnection('/MyHubPath', {
    logLevel: LogLevel.Error,
    retryInterval: 3000,
    maxConnectionAttempts: 5
});
```

**logLevel**: The log level the underlying signalr client will log at. Default value is `LogLevel.Error`.

**retryInterval**: Defines the wait interval between connection attempts in milliseconds. Default value is `5000`.

**maxConnectionAttempts**: Max number of attempts to initiate a connection. Default value is `5`.

### Example

```js
const autoHubConnection = new AutoHubConnection('/MyHubUrl');
autoHubConnection.on('EventName', x => console.log(x));
autoHubConnection.start();
```

For more detail on how to utilize the signalr client, please reference the [official documentation](https://docs.microsoft.com/en-us/javascript/api/@aspnet/signalr/hubconnection?view=signalr-js-latest).