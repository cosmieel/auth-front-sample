import i18nInstance from '../locales/index';

export default function makeInternalAuthAPI( { regJWT } ) {
    const i18n = i18nInstance();

    const internalAuthApi = {
        authenticate : async function( userCredentials ) {
            let response;

            try {
                response = await regJWT.logIn( {
                    login               : userCredentials.login,
                    password            : userCredentials.password,
                    smsSessionId        : userCredentials.sms_session_id,
                    smsConfirmationCode : userCredentials.confirmation_code,
                    captchaResponse     : userCredentials.captcha_response,
                } );
            }
            catch ( error ) {
                _handleError( error );
            }

            return response.data;
        },

        register : async function( userCredentials ) {
            let response;

            try {
                response = await regJWT.register( {
                    email           : userCredentials.login,
                    captchaResponse : userCredentials.captcha_response,
                } );
            }
            catch ( error ) {
                _handleError( error );
            }

            return response.data;
        },

    };

    function _handleError( error ) {
        const message = error?.response?.data?.message?.[0]?.text || i18n.t('networkErrorMessage');
        const customError = new Error( message );

        customError.code = error?.response?.data?.message?.[0]?.code;

        throw customError;
    }

    return internalAuthApi;
}
