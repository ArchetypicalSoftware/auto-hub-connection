import { HubConnectionState, IStreamResult, LogLevel } from '@aspnet/signalr';
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
export declare class AutoHubConnection {
    private config;
    private connectionPromise;
    private connection;
    private closedByUser;
    private url;
    private oncloseHandler;
    /**
     * Constructor
     * @param url Path to the server-side hub
     * @param config Optional configuration options
     */
    constructor(url: string, config?: IConnectionConfig | null);
    /** Stops the connection.
     *
     * @returns {Promise<void>} A Promise that resolves when the connection has been successfully terminated, or rejects with an error.
     */
    stop(): Promise<void>;
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
    invoke(methodName: string, ...args: any[]): Promise<{}>;
    /** Registers a handler that will be invoked when the hub method with the specified method name is invoked.
     *
     * @param {string} methodName The name of the hub method to define.
     * @param {Function} newMethod The handler that will be raised when the hub method is invoked.
     */
    on(methodName: string, newMethod: (...args: any[]) => void): void;
    /** Removes the all handlers or a specified handler for the specified hub method.
     *
     * If removing a specific handler, you must pass the exact same Function instance as was previously passed to {@link @aspnet/signalr.HubConnection.on}. Passing a different instance (even if the function
     * body is the same) will not remove the handler.
     *
     * @param {string} methodName The name of the method to remove handlers for.
     * @param {Function} method Optional: The handler to remove. This must be the same Function instance as the one passed to {@link @aspnet/signalr.HubConnection.on}.
     */
    off(methodName: string, method?: (...args: any[]) => void | null): void;
    /** Invokes a hub method on the server using the specified name and arguments. Does not wait for a response from the receiver.
     *
     * The Promise returned by this method resolves when the client has sent the invocation to the server. The server may still
     * be processing the invocation.
     *
     * @param {string} methodName The name of the server method to invoke.
     * @param {any[]} args The arguments used to invoke the server method.
     * @returns {Promise<void>} A Promise that resolves when the invocation has been successfully sent, or rejects with an error.
     */
    send(methodName: string, ...args: any[]): Promise<void>;
    /** Invokes a streaming hub method on the server using the specified name and arguments.
     *
     * @typeparam T The type of the items returned by the server.
     * @param {string} methodName The name of the server method to invoke.
     * @param {any[]} args The arguments used to invoke the server method.
     * @returns {IStreamResult<T>} An object that yields results from the server as they are received.
     */
    stream<T = any>(methodName: string, ...args: any[]): IStreamResult<T>;
    /** Registers a handler that will be invoked when the connection is closed.
     *
     * @param {Function} callback The handler that will be invoked when the connection is closed. Optionally receives a single argument containing the error that caused the connection to close (if any).
     */
    onclose(callback: (error?: Error) => void): void;
    /** Starts the connection.
     *
     * @returns {Promise<void>} A Promise that resolves when the connection has been successfully established, or rejects with an error.
     */
    start(): Promise<void>;
    /** Indicates the state of the {@link HubConnection} to the server. */
    readonly state: HubConnectionState;
    private connect;
    private initConnection;
}
