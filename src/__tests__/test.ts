jest.mock('@aspnet/signalr');

import * as signalr from '@aspnet/signalr';
import { AutoHubConnection } from '../index'
import { MockHubConnection, MockHubConnectionBuilder } from './signalr.hubConnection.mock';

describe('tests', () => {
  const mockHubConnectionBuilder = signalr.HubConnectionBuilder as jest.Mock<signalR.HubConnectionBuilder>;
  let builder: MockHubConnectionBuilder;
  let connection: MockHubConnection;
  let invokeProto: <T>(methodName: string, ...args: any[]) => Promise<T>;
  let autoHubConnection: AutoHubConnection;

  beforeEach(() => {
    connection = new MockHubConnection();
    builder = new MockHubConnectionBuilder(connection);

    mockHubConnectionBuilder.mockImplementation(() => (builder as unknown) as signalR.HubConnectionBuilder);

    invokeProto = signalr.HubConnection.prototype.invoke = jest.fn();

    autoHubConnection = new AutoHubConnection('/hubUrl');
  });

  test('connection is correctly set up', () => {
    autoHubConnection.start();

    expect(builder.build).toHaveBeenCalledTimes(1);
    expect(builder.configureLogging).toHaveBeenCalledTimes(1);
    expect(builder.withUrl).toHaveBeenCalledTimes(1);
    expect(connection.onclose).toHaveBeenCalledTimes(1);
    expect(connection.start).toHaveBeenCalledTimes(1);
  });

  test('reattempt connection when start fails', async done => {
    autoHubConnection = new AutoHubConnection('/hubUrl', { retryInterval: 10 });
    connection.start.mockImplementationOnce(() => Promise.reject());

    await autoHubConnection.start();

    expect(connection.start).toHaveBeenCalledTimes(2);
    done();
  });

  test('start called again on disconnect', async done => {
    // tslint:disable-next-line:no-empty
    let onCloseHandler: () => void | null;
    connection.onclose.mockImplementation(callback => (onCloseHandler = callback));

    autoHubConnection = new AutoHubConnection('/hubUrl');
    await autoHubConnection.start();

    connection.state = signalr.HubConnectionState.Disconnected;
    onCloseHandler!();

    expect(connection.start).toBeCalledTimes(2);
    done();
  });

  test('start not called on user close', async done => {
    await autoHubConnection.start();
    await autoHubConnection.stop();

    expect(connection.start).toBeCalledTimes(1);
    expect(connection.stop).toBeCalledTimes(1);

    done();
  });

  test('internal start promise handles multiple calls', async done => {
    connection.start.mockImplementationOnce(() => Promise.reject());

    autoHubConnection = new AutoHubConnection('/hubUrl', { retryInterval: 500 });
    await Promise.all([autoHubConnection.start(), 
      autoHubConnection.start(), 
      autoHubConnection.start(), 
      autoHubConnection.start(),
      autoHubConnection.start(),
      autoHubConnection.start(),
      autoHubConnection.start(),
      autoHubConnection.start()
    ]);

    expect(connection.start).toBeCalledTimes(2);
    done();
  });
});
