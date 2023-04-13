import AbstractCommand from './AbstractCommand';

class AuthenticateCommand extends AbstractCommand {
    constructor( options ) {
        super( options );
        this.authenticationService = this.services.getService('Authentication');
    }

    async exec( userInput ) {
        this.stateMachine.submitAuthentication( userInput );
        let authenticationResult;

        try {
            authenticationResult = await this.authenticationService.authenticate( userInput );
        }
        catch ( error ) {
            this.errorHandler.handleError( error );
            this.stateMachine.invalidAuthenticationData( error );

            return;
        }

        this.stateMachine.getAuthenticationResult( authenticationResult );
    }
}

export default AuthenticateCommand;
