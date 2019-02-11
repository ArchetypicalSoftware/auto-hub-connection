import { HubConnection, HubConnectionBuilder, HubConnectionState, IStreamResult, LogLevel } from '@aspnet/signalr';

/**
 * Configuration options for AutoHubConnection
 */
export interface IConnectionConfig {
  logLevel?: LogLevel;
  retryInterval?: number;
  maxConnectionAttempts?: number;
}
/**
 * AutoHubConnection class definition
 */
export class AutoHubConnection {
  private config: IConnectionConfig;
  private connectionPromise: Promise<void> | null;
  private connection: HubConnection | null;
  private closedByUser: boolean;
  private url: string;
  private oncloseHandler: ((error?: Error) => void) | null;

  /**
   * Constructor
   * @param url Path to the server-side hub
   * @param config Optional configuration options
   */
  public constructor(url: string, config?: IConnectionConfig | null) {
    if (!url) {
      throw new Error('"url" must be a valid path');
    }

    this.url = url;
    this.connectionPromise = null;
    this.connection = null;
    this.closedByUser = false;
    this.oncloseHandler = null;

    this.config = Object.assign({}, {
      logLevel: LogLevel.Error,
      maxConnectionAttempts: 5,
      retryInterval: 5000,
    }, config);

    this.initConnection();
  }

  /** Stops the connection.
   *
   * @returns {Promise<void>} A Promise that resolves when the connection has been successfully terminated, or rejects with an error.
   */
  public async stop() {
    if (this.connection) {
      this.closedByUser = true;
      await this.connection!.stop();
      this.connectionPromise = null;
    }
  }

  /** Invokes a hub method on the server using the specified name and arguments.
   *
   * The Promise returned by this method resolves when the server indicates it has finished invoking the method. When the promise
   * resolves, the server has finished invoking the method. If the server method returns a result, it is produced as the result of
   * resolving the Promise.
   *
   * @typeparam T The expected return type.
   * @param {string} methodName The name of the server method to invoke.
   * @param {any[]} args The arguments used to invoke the server method.
   * @returns {Promise<T>} A Promise that resolves with the result of the server method (if any), or rejects with an error.
   */
  public async invoke(methodName: string, ...args: any[]) {
    return HubConnection.prototype.invoke.apply(this.connection!, arguments as any);
  }

  /** Registers a handler that will be invoked when the hub method with the specified method name is invoked.
   *
   * @param {string} methodName The name of the hub method to define.
   * @param {Function} newMethod The handler that will be raised when the hub method is invoked.
   */
  public on(methodName: string, newMethod: (...args: any[]) => void) {
    this.connection!.on(methodName, newMethod);
  }

  /** Removes the all handlers or a specified handler for the specified hub method.
   *
   * If removing a specific handler, you must pass the exact same Function instance as was previously passed to {@link @aspnet/signalr.HubConnection.on}. Passing a different instance (even if the function
   * body is the same) will not remove the handler.
   *
   * @param {string} methodName The name of the method to remove handlers for.
   * @param {Function} method Optional: The handler to remove. This must be the same Function instance as the one passed to {@link @aspnet/signalr.HubConnection.on}.
   */
  public off(methodName: string, method?: (...args: any[]) => void | null): void {
    this.connection!.off(methodName, method!);
  }

  /** Invokes a hub method on the server using the specified name and arguments. Does not wait for a response from the receiver.
   *
   * The Promise returned by this method resolves when the client has sent the invocation to the server. The server may still
   * be processing the invocation.
   *
   * @param {string} methodName The name of the server method to invoke.
   * @param {any[]} args The arguments used to invoke the server method.
   * @returns {Promise<void>} A Promise that resolves when the invocation has been successfully sent, or rejects with an error.
   */
  public async send(methodName: string, ...args: any[]): Promise<void> {
    return HubConnection.prototype.send.apply(this.connection, arguments as any);
  }

  /** Invokes a streaming hub method on the server using the specified name and arguments.
   *
   * @typeparam T The type of the items returned by the server.
   * @param {string} methodName The name of the server method to invoke.
   * @param {any[]} args The arguments used to invoke the server method.
   * @returns {IStreamResult<T>} An object that yields results from the server as they are received.
   */
  public stream<T = any>(methodName: string, ...args: any[]): IStreamResult<T> {
    return HubConnection.prototype.stream.apply(this.connection, arguments as any);
  }

  /** Registers a handler that will be invoked when the connection is closed.
   *
   * @param {Function} callback The handler that will be invoked when the connection is closed. Optionally receives a single argument containing the error that caused the connection to close (if any).
   */
  public onclose(callback: (error?: Error) => void): void {
    this.oncloseHandler = callback;
  }

  /** Starts the connection.
   *
   * @returns {Promise<void>} A Promise that resolves when the connection has been successfully established, or rejects with an error.
   */
  public async start(): Promise<void> {
    if (this.connectionPromise === null) {
      try {
        // Create a promise that gets resolved once the underlying connection is established or
        // rejects once the connection has failed the configured number of times
        this.connectionPromise = new Promise(async (resolve, reject) => {
          await this.connect(resolve, reject, 0);
        });
      } catch {
        if (this.connection) {
          this.connection = null;
        }
        this.connectionPromise = null;
      }
    }

    return this.connectionPromise!;
  }

  /** Indicates the state of the {@link HubConnection} to the server. */
  public get state(): HubConnectionState {
    if(this.connection) {
      return this.connection.state;
    }

    return HubConnectionState.Disconnected;
  }

  private async connect(resolve: () => void, reject: () => void, attemptCount: number) {
    try {
      await this.connection!.start();

      // Resolve when we have successfully connected
      resolve();
    } catch (err) {
      // Catch the connection exception and try again
      if (attemptCount === this.config.maxConnectionAttempts) {
        // If over maxConnectionAttempts, reject the promise
        reject();
      } else {
        // Try again in bit
        setTimeout(() => this.connect(resolve, reject, attemptCount + 1), this.config.retryInterval);
      }
    }
  }

  private initConnection() {
    if(!this.connection) {
      this.connection = new HubConnectionBuilder()
          .withUrl(this.url)
          .configureLogging(this.config.logLevel!)
          .build();

      this.connection.onclose(() => {
        this.connectionPromise = null;

        if (this.oncloseHandler) {
          this.oncloseHandler();
        }

        if (!this.closedByUser) {
          this.start();
        }
      });
    }
  }
}