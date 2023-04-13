/* eslint-disable compat/compat */
/* eslint-disable promise/avoid-new */
import UserCredentialsDAO from '../UserCredentials';

const makeAPI = ( isSuccess ) => {
    return {
        authorizeByExternalProvider : jest.fn().mockImplementation(
            () => Promise.resolve( { success: isSuccess } )
        ),
        bindExternalProvider : jest.fn().mockImplementation(
            () => Promise.resolve( { success: isSuccess } )
        ),
        saveAuthorizedExternalProvider : jest.fn().mockImplementation(
            () => Promise.resolve( { success: isSuccess } )
        ),
        getSavedExternalProvider : jest.fn().mockImplementation(
            () => Promise.resolve( { success: isSuccess } )
        ),
        removeSavedExternalProvider : jest.fn().mockImplementation(
            () => Promise.resolve( { success: isSuccess } )
        ),
        authenticate : jest.fn().mockImplementation(
            () => Promise.resolve( { success: isSuccess } )
        ),
        register : jest.fn().mockImplementation(
            () => Promise.resolve( { success: isSuccess } )
        ),
    };
};

describe( 'Класс UserCredentialsDAO', () => {
    const authenticationCredentials = {
        login    : 'example@mail.ru',
        password : '1234',
    };

    describe( 'метод authenticate', () => {

        it( 'должен запрашивать у внутренней авторизации метод authenticate', () => {
            const api = makeAPI( true );
            const userCredentialsDAOInstance = new UserCredentialsDAO( { api } );

            userCredentialsDAOInstance.authenticate( authenticationCredentials );

            expect( api.authenticate ).toBeCalledWith( authenticationCredentials );
        } );
    } );

    describe( 'метод authorizeByExternalProvider', () => {
        const provider = { provider: 'providerExample' };

        it( 'должен запрашивать у внешней авторизации метод authorizeByExternalProvider', () => {
            const api = makeAPI( true );
            const userCredentialsDAOInstance = new UserCredentialsDAO( { api } );

            userCredentialsDAOInstance.authorizeByExternalProvider( provider );

            expect( api.authorizeByExternalProvider ).toBeCalledWith( provider );
        } );

        it( 'должен прокидывать ошибку, если с сервера вернулось success false', () => {
            const api = makeAPI( false );
            const userCredentialsDAOInstance = new UserCredentialsDAO( { api } );

            expect( async () => await userCredentialsDAOInstance.authorizeByExternalProvider( provider ) )
                .rejects.toThrow();
        } );
    } );

    describe( 'метод bindExternalProvider', () => {

        it( 'должен запрашивать у внешней авторизации метод bindExternalProvider', () => {
            const api = makeAPI( true );
            const userCredentialsDAOInstance = new UserCredentialsDAO( { api } );

            userCredentialsDAOInstance.bindExternalProvider();

            expect( api.bindExternalProvider ).toBeCalled();
        } );
    } );

    describe( 'метод register', () => {
        const registrationCredentials = {
            login : 'example@mail.ru',
        };

        it( 'должен запрашивать у внутренней авторизации метод register', () => {
            const api = makeAPI( true );
            const userCredentialsDAOInstance = new UserCredentialsDAO( { api } );

            userCredentialsDAOInstance.register( registrationCredentials );

            expect( api.register ).toBeCalledWith( registrationCredentials );
        } );
    } );

    describe( 'метод saveAuthorizedExternalProvider', () => {
        const externalAuthorizeResultMock = {
            login    : 'example@mail.ru',
            provider : 'providerExample',
        };

        it( 'должен запрашивать у внешней авторизации метод saveAuthorizedExternalProvider', () => {
            const api = makeAPI( true );
            const userCredentialsDAOInstance = new UserCredentialsDAO( { api } );

            userCredentialsDAOInstance.saveAuthorizedExternalProvider( externalAuthorizeResultMock );

            expect( api.saveAuthorizedExternalProvider ).toBeCalledWith( externalAuthorizeResultMock );
        } );
    } );

    describe( 'метод getSavedExternalProvider', () => {

        it( 'должен запрашивать у внешней авторизации метод getSavedExternalProvider', () => {
            const api = makeAPI( true );
            const userCredentialsDAOInstance = new UserCredentialsDAO( { api } );

            userCredentialsDAOInstance.getSavedExternalProvider();

            expect( api.getSavedExternalProvider ).toBeCalled();
        } );
    } );

    describe( 'метод removeSavedExternalProvider', () => {
        
        it( 'должен запрашивать у внешней авторизации метод removeSavedExternalProvider', () => {
            const api = makeAPI( true );
            const userCredentialsDAOInstance = new UserCredentialsDAO( { api } );

            userCredentialsDAOInstance.removeSavedExternalProvider();

            expect( api.removeSavedExternalProvider ).toBeCalled();
        } );
    } );
} );
