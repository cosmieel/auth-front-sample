import { AUTHENTICATED_STATUS, STATUSES_2FA } from '../constants';

export default class AuthenticationService {
    constructor( { userCredentialsDAO, userCredentials } ) {
        this.userCredentialsDAO = userCredentialsDAO;
        this.userCredentials = userCredentials;
    }

    async authenticate( userInput ) {

        if ( userInput?.login ) {
            this.userCredentials.login = userInput.login;
        }
        if ( userInput?.password ) {
            this.userCredentials.password = userInput.password;
        }

        if ( !this.userCredentials.password ) {
            this.userCredentials.isAuthenticatedByToken = true;
        }

        let response;

        try {
            response = await this.userCredentialsDAO.authenticate(
                this.userCredentials.authenticationData
            );
        } 
        catch ( error ) {
            if ( error.code === 'OAUTH_DISABLED' ) {
                this.userCredentials.canAuthenticateByToken = false;
            }

            throw error;
        }

        if ( response?.result?.status === AUTHENTICATED_STATUS ) {
            this.userCredentials.isAuthenticated = true;
        }

        if ( STATUSES_2FA.includes( response?.result?.status ) ) {
            this.userCredentials.smsConfirmationData.sessionId = response.result.sms_session_id;

            return {
                userCredentialsDTO  : this.userCredentials.DTO,
                timeBeforeSmsResend : Math.ceil( Number( response.result.must_wait ) ),
            };
        }

        if ( response?.result?.screen_name ) {
            this.userCredentials.screenName = response.result.screen_name;
        }

        if ( response?.result?.status === 'need_captcha' ) {
            this.userCredentials.captcha.response = '';
            this.userCredentials.captcha.siteKey = response.result.site_key;
        }

        return {
            userCredentialsDTO : this.userCredentials.DTO,
        };
    }
}
