export default class Commands {
    constructor( { commandMap, stateMachine, services, errorHandler } ) {
        this.commandMap = commandMap;
        this.stateMachine = stateMachine;
        this.services = services;
        this.errorHandler = errorHandler;
    }

    getCommand( commandName ) {
        if ( !( commandName in this.commandMap ) ) {
            throw new Error(`Command ${commandName} is not defined`);
        }
        
        const CommandConstructor = this.commandMap[commandName];

        if ( typeof CommandConstructor !== 'function' ) {
            throw new Error(`Command ${commandName} is not instanceable`);
        }

        return new CommandConstructor( {
            stateMachine : this.stateMachine,
            services     : this.services,
            errorHandler : this.errorHandler,
        } );
    }
}
