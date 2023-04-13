import makeInternalAuthAPI from '../InternalAuthAPI';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import i18nInstance from '../../locales/index';

Vue.use( VueI18n );
const i18n = i18nInstance();

const validResponse = {
    data : 'some response data',
};

const mockedRegJWT = {
    logIn : jest.fn().mockImplementation( () => {
        return validResponse;
    } ),
    register : jest.fn().mockImplementation( () => {
        return validResponse;
    } ),
};

describe( 'internalAuthAPI', () => {

    const internalAuthAPI = makeInternalAuthAPI( { regJWT: mockedRegJWT } );

    it( 'api должен вызвать транспорт авторизации', () => {
        const mockedUserInput = {
            login    : 'user@gmail.com',
            password : '1234',
        };

        internalAuthAPI.authenticate( mockedUserInput );

        expect( mockedRegJWT.logIn ).toBeCalledWith( mockedUserInput );
    } );

    it( 'должен вызываться метод _handleError и выкидывать ошибку при неудачной авторизации', async () => {
        const mockedUserInput = null;
        const error = new Error( i18n.t('networkErrorMessage') );

        await expect( async () => await internalAuthAPI.authenticate( mockedUserInput ) )
            .rejects.toThrowError( error );
    } );

    it( 'должен вызываться метод регистрации', () => {
        const mockedUserInput = {
            login            : 'user@gmail.com',
            captcha_response : '12345',
        };

        const requestUserInput = {
            email           : 'user@gmail.com',
            captchaResponse : '12345',
        };

        internalAuthAPI.register( mockedUserInput );

        expect( mockedRegJWT.register ).toBeCalledWith( requestUserInput );
    } );

    it( 'должен вызываться метод _handleError и выкидывать ошибку при неудачной регистрации', async () => {
        const mockedUserInput = undefined;
        const error = new Error( i18n.t('networkErrorMessage') );

        await expect( async () => await internalAuthAPI.register( mockedUserInput ) )
            .rejects.toThrowError( error );
    } );
} );
