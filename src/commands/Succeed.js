import AbstractCommand from './AbstractCommand';

class SucceedCommand extends AbstractCommand {
    constructor( options ) {
        super( options );
    }

    // succeedTransitionName = 'succeedAuthentication' || 'succeedRegistration'
    exec( userCredentialsDTO, succeedTransitionName ) {
        this.stateMachine[succeedTransitionName]( userCredentialsDTO );
    }
}

export default SucceedCommand;
