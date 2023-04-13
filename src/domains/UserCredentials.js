export default class UserCredentials {
    constructor() {
        this.login = '';
        this.password = '';
        this.smsConfirmationData = {
            sessionId : '',
            smsCode   : '',
        };
        this.canAuthenticateByToken = false;
        this.isExternalAuthProviderBindingNeeded = false;
        this.authorizedExternalProvider = '';
        this.screenName = '';
        this.isAuthenticated = false;
        this.isAuthenticatedByToken = false;
        this.captcha = {
            siteKey  : '',
            response : '',
        };
    }

    get isReadyToRegister() {
        return this.login.length > 0;
    }

    get isSmsConfirmation() {
        return !!this.smsConfirmationData.sessionId;
    }

    get hasCaptchaResponse() {
        return !!this.captcha.response;
    }

    get authenticationData() {
        const data = {};

        if ( !this.canAuthenticateByToken ) {
            data.login = this.login;
            data.password = this.password;
        }

        if ( this.isSmsConfirmation ) {
            data.sms_session_id = this.smsConfirmationData.sessionId;
            data.confirmation_code = this.smsConfirmationData.smsCode;
        }

        if ( this.hasCaptchaResponse ) {
            data.captcha_response = this.captcha.response;
        }

        return data;
    }

    get registrationData() {
        const data = {
            login : this.login,
        };

        if ( this.hasCaptchaResponse ) {
            data.captcha_response = this.captcha.response;
        }

        return data;
    }

    get DTO() {
        return {
            login                               : this.login,
            password                            : this.password,
            canAuthenticateByToken              : this.canAuthenticateByToken,
            isExternalAuthProviderBindingNeeded : this.isExternalAuthProviderBindingNeeded,
            authorizedExternalProvider          : this.authorizedExternalProvider,
            isSmsConfirmation                   : this.isSmsConfirmation,
            isAuthenticated                     : this.isAuthenticated,
            isAuthenticatedByToken              : this.isAuthenticatedByToken,
            screenName                          : this.screenName,
            captcha                             : this.captcha,
        };
    }
}
