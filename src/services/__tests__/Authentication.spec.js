/* eslint-disable compat/compat */
import AuthenticationService from '../Authentication';

const mockedResponse = jest.fn().mockReturnValue( {
    result : {
        screen_name : '',
    },
} );

const mockedUserCredentialsDAO = {
    authenticate : mockedResponse,
};
const mockedUserCredentials = {
    login              : '',
    password           : '',
    authenticationData : {
        login    : 'user@gmail.com',
        password : '1234',
    },
    smsConfirmationData : {
        smsCode   : '',
        sessionId : '',
    },
    screenName             : '',
    isAuthenticatedByToken : false,
    captcha                : {
        siteKey  : '',
        response : '',
    },
    canAuthenticateByToken : false,
};
const userCredentialsDAO = mockedUserCredentialsDAO;
const userCredentials = mockedUserCredentials;

let authenticationService;

beforeEach( () => {
    authenticationService = new AuthenticationService( {
        userCredentialsDAO,
        userCredentials,
    } );
} );

describe( 'метод authenticate', () => {

    const mockedUserInput = {
        login    : 'user@gmail.com',
        password : '1234',
    };

    it( 'должен записывать sessionId и возвращать объект с DTO, timeBeforeSmsResend при статусе sms_new_session',
        async () => {
            userCredentialsDAO.authenticate.mockImplementation( () => Promise.resolve( {
                result : {
                    must_wait      : 3,
                    sms_session_id : '35e305ed347ee4bee71a56fe4839d3d8',
                    status         : 'sms_new_session',
                },
                success : true,
            } ) );
            userCredentials.DTO = {
                authorizedExternalProvider          : '',
                canAuthenticateByToken              : false,
                isExternalAuthProviderBindingNeeded : false,
                isSmsConfirmation                   : true,
                login                               : 'user@gmail.com',
                password                            : '1234',
            };
            const responseDAO = await userCredentialsDAO.authenticate();
            const expectationResponse = {
                userCredentialsDTO : {
                    ...userCredentials.DTO,
                },
                timeBeforeSmsResend : 3,
            };

            const responseAuthentication = await authenticationService.authenticate( mockedUserInput );

            expect( userCredentials.smsConfirmationData.sessionId ).toBe( responseDAO.result.sms_session_id );
            expect( expectationResponse ).toEqual( responseAuthentication );
        } );

    it( 'должен вызвать метод authenticate у dao', async () => {
        await authenticationService.authenticate( mockedUserInput );

        expect( userCredentialsDAO.authenticate ).toBeCalledWith( mockedUserInput );
    } );

    it( 'сохранить screenName в userCredentials, если в ответе с сервера присутсвует screen_name',
        async () => {
            expect( authenticationService.userCredentials.screenName ).toBe('');

            mockedResponse.mockReturnValueOnce( {
                result : {
                    screen_name : 'login@example.com',
                },
            } );

            await authenticationService.authenticate( mockedUserInput );

            expect( authenticationService.userCredentials.screenName ).toBe('login@example.com');
        }
    );

    it( 'должен возвращать ответ от DAO', async () => {
        userCredentialsDAO.authenticate.mockImplementation( () => Promise.resolve( {
            result : {
                must_wait      : '3',
                sms_session_id : '35e305ed347ee4bee71a56fe4839d3d8',
                status         : 'sms_old_session_found',
            },
            success : true,
        } ) );
        const expectedResponse = {
            timeBeforeSmsResend : 3,
            userCredentialsDTO  : {
                authorizedExternalProvider          : '',
                canAuthenticateByToken              : false,
                isExternalAuthProviderBindingNeeded : false,
                isSmsConfirmation                   : true,
                login                               : 'user@gmail.com',
                password                            : '1234',
            },
        };
        const responseAuthentication = await authenticationService.authenticate( mockedUserInput );

        expect( expectedResponse ).toEqual( responseAuthentication );
    } );

    it( 'должен записывать логин и пароль в userCredentials если в метод authenticate были переданы данные',
        async () => {
            await authenticationService.authenticate( mockedUserInput );

            expect( userCredentials.login ).toBe( mockedUserInput.login );
            expect( userCredentials.password ).toBe( mockedUserInput.password );
        } );

    it( 'должен записывать в userCredentials.isAuthenticated = true если статус authenticated', async () => {
        userCredentialsDAO.authenticate.mockImplementation( () => Promise.resolve( {
            success : true,
            result  : {
                status      : 'authenticated',
                user_id     : 1,
                screen_name : '123@123.com',
            },
        } ) );

        await authenticationService.authenticate( mockedUserInput );

        expect( userCredentials.isAuthenticated ).toBe( true );
    } );

    it( 'сохранить isAuthenticatedByToken = true в userCredentials, если произошла авторизация по токену',
        async () => {
            userCredentials.password = undefined;
            await authenticationService.authenticate( {
                login    : '',
                password : '',
            } );

            expect( authenticationService.userCredentials.isAuthenticatedByToken ).toBe( true );
        }
    );

    it( 'должен записывать в userCredentials.captcha.siteKey ключ, если статус need_captcha', async () => {
        userCredentialsDAO.authenticate.mockImplementation( () => Promise.resolve( {
            success : true,
            result  : {
                count_attempt : '6',
                site_key      : '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
                status        : 'need_captcha',
                screen_name   : 'screen_name',
            },
        } ) );

        await authenticationService.authenticate( mockedUserInput );

        expect( userCredentials.captcha.siteKey ).toBe('6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI');
    } );
} );
