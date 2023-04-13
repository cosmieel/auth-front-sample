/* eslint-disable no-magic-numbers */
import AuthenticateCommand from '../Authenticate';

const mockedAuthenticationService = {
    authenticate : jest.fn().mockImplementation( () => {
        return { success: true };
    } ),
};
const services = {
    getService( serviceName ) {
        switch ( serviceName ) {
            case 'Authentication':
                return mockedAuthenticationService;
        }
    },
};
const mockedStateMachine = {
    submitAuthentication      : jest.fn(),
    getAuthenticationResult   : jest.fn(),
    invalidAuthenticationData : jest.fn(),
    subscribeOnce             : jest.fn(),
};
const stateMachine = mockedStateMachine;

const errorHandler = {
    handleError() {},
};

let authenticateCommand;

describe( 'Authenticate', () => {

    beforeEach( () => {
        authenticateCommand = new AuthenticateCommand( {
            stateMachine,
            services,
            errorHandler,
        } );
    } );

    describe( 'authenticateCommand', () => {
        const mockedUserInput = {
            login    : 'fdsfsdf@mail.ru',
            password : '12323gdfgsdf',
        };

        it( 'должен быть вызван запрос аутентификации у dao', () => {
            authenticateCommand.exec( mockedUserInput );

            expect( mockedAuthenticationService.authenticate ).toBeCalledWith( mockedUserInput );
        } ); 

        it( 'должен вызвать stateMachine.submitAuthentication при успешной инициализации', () => {
            authenticateCommand.exec( mockedUserInput );

            expect( stateMachine.submitAuthentication ).toBeCalledWith( mockedUserInput );
        } );

        it( 'должен вызвать stateMachine.getAuthenticationResult при успешном вызове сервиса аутентификации',
            async () => {
                await authenticateCommand.exec( mockedUserInput );

                expect( stateMachine.getAuthenticationResult ).toBeCalledWith( {
                    success : true,
                } );
            }
        );
        
        it( 'должен вызвать stateMachine.invalidAuthenticationData при неуспешном вызове сервиса аутентификации',
            async () => {
                mockedAuthenticationService.authenticate.mockImplementationOnce( () => {
                    throw new Error('Mocked error');
                } );

                await authenticateCommand.exec( mockedUserInput );

                expect( stateMachine.invalidAuthenticationData ).toBeCalledWith( new Error('Mocked error') );
            }
        );
    } );
} );
