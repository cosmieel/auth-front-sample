import UserCredentials from '../UserCredentials';

let userCredentials;

describe( 'Класс UserCredentials', () => {
    beforeEach( () => {
        userCredentials = new UserCredentials();
    } );

    describe( 'геттер isReadyToRegister', () => {

        it( 'должен вернуть true, если поле логина заполнено', () => {
            userCredentials.login = 'exampleLogin';

            expect( userCredentials.isReadyToRegister ).toBe( true );
        } );

        it( 'должен вернуть false, если поле логина не заполнено', () => {
            expect( userCredentials.isReadyToRegister ).toBe( false );
        } );
    } );

    describe( 'геттер isSmsConfirmation', () => {

        it( 'должен вернуть true, если существует sessionId для sms-подтверждения', () => {
            userCredentials.smsConfirmationData.sessionId = 'exampleSessionId';

            expect( userCredentials.isSmsConfirmation ).toBe( true );
        } );

        it( 'должен вернуть false, если не существует sessionId для sms-подтверждения', () => {
            userCredentials.smsConfirmationData.sessionId = '';

            expect( userCredentials.isSmsConfirmation ).toBe( false );
        } );
    } );

    describe( 'геттер authenticationData', () => {

        it( 'должен вернуть объект с данными аутентификации', () => {
            const mockedAuthenticationData = {
                login    : 'exampleLogin',
                password : 'examplePassword',
            };

            userCredentials.login = mockedAuthenticationData.login;
            userCredentials.password = mockedAuthenticationData.password;

            expect( userCredentials.authenticationData ).toEqual( mockedAuthenticationData );
        } );

        it( 'должен вернуть пустой объект, если поля пустые', () => {
            userCredentials.canAuthenticateByToken = true;

            expect( userCredentials.authenticationData ).toEqual( {} );
        } );

        it( `должен вернуть объект с данными аутентификации и данными sms-подтверждения,
            если isSmsConfirmation = true`,
        () => {
            userCredentials.smsConfirmationData.sessionId = 'exampleSessionId';
            const mockedAuthenticationData = {
                login             : 'exampleLogin',
                password          : 'examplePassword',
                sms_session_id    : 'exampleSessionId',
                confirmation_code : '',
            };

            userCredentials.login = mockedAuthenticationData.login;
            userCredentials.password = mockedAuthenticationData.password;
            userCredentials.sms_session_id = mockedAuthenticationData.sms_session_id;
            userCredentials.confirmation_code = mockedAuthenticationData.confirmation_code;

            expect( userCredentials.authenticationData ).toEqual( mockedAuthenticationData );
        } );

        it( `должен вернуть объект с данными captcha_response если hasCaptchaResponse `, () => {
            const mockedAuthenticationData = {
                login            : 'exampleLogin',
                password         : 'examplePassword',
                captcha_response : 'exampleResponse',
            };

            userCredentials.captcha.response = 'exampleResponse';
            userCredentials.login = mockedAuthenticationData.login;
            userCredentials.password = mockedAuthenticationData.password;

            expect( userCredentials.authenticationData ).toEqual( mockedAuthenticationData );
        } );
    } );

    describe( 'геттер registrationData', () => {

        it( 'должен вернуть объект с данными регистрации', () => {
            const mockedRegistrationData = {
                login : 'exampleLogin',
            };

            userCredentials.login = mockedRegistrationData.login;

            expect( userCredentials.registrationData ).toEqual( mockedRegistrationData );
        } );

        it( 'должен записать вернуть data с captcha_response, если флаг hasCaptchaResponse установлен',
            () => {
                const captchaResponse = 123;
                const mockedRegistrationData = {
                    login            : 'exampleLogin',
                    captcha_response : captchaResponse,
                };

                userCredentials.login = 'exampleLogin';
                userCredentials.captcha.response = captchaResponse;

                expect( userCredentials.registrationData ).toEqual( mockedRegistrationData );
            } );
    } );

    describe( 'геттер DTO', () => {

        it( 'должен вернуть DTO', () => {
            const mockedDTO = {
                login                               : 'exampleLogin',
                password                            : 'examplePassword',
                isSmsConfirmation                   : false,
                canAuthenticateByToken              : false,
                isExternalAuthProviderBindingNeeded : false,
                authorizedExternalProvider          : '',
                isAuthenticated                     : false,
                isAuthenticatedByToken              : false,
                screenName                          : '',
                captcha                             : {
                    siteKey  : '',
                    response : '',
                },
            };

            userCredentials.login = mockedDTO.login;
            userCredentials.password = mockedDTO.password;
            userCredentials.canAuthenticateByToken = mockedDTO.canAuthenticateByToken;
            userCredentials.isExternalAuthProviderBindingNeeded = mockedDTO.isExternalAuthProviderBindingNeeded;
            userCredentials.screenName = mockedDTO.screenName;

            expect( userCredentials.DTO ).toEqual( mockedDTO );
        } );
    } );

} );
