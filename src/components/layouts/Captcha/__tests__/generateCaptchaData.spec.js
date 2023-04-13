import generateCaptchaData from '../generateCaptchaData';

describe( 'функция generateCaptchaData', () => {
    it( 'должна возвращать объект с данныеми об siteKey, response, siteKey', () => {
        const captcha = 123;
        const expectationResult = {
            siteKey     : captcha,
            response    : captcha,
            isKeyExists : true,
        };

        const resultGenerated = generateCaptchaData( { captcha : {
            siteKey     : captcha,
            response    : captcha,
            isKeyExists : true,
        } } );

        expect( resultGenerated ).toEqual( expectationResult );
    } );
} );
