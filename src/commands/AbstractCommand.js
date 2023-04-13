export default class AbstractCommand {
    constructor( { stateMachine, services, errorHandler } ) {
        this.stateMachine = stateMachine;
        this.services = services;
        this.errorHandler = errorHandler;
    }
}
