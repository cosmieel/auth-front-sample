export default class UserCredentialsDAO {

    constructor( { api } ) {
        this.api = api;
    }

    async authenticate( authenticationCredentials ) {
        const authenticationResult = await this.api.authenticate( authenticationCredentials );

        return authenticationResult;
    }

    async authorizeByExternalProvider( { provider } ) {
        const authorizeResult = await this.api.authorizeByExternalProvider( { provider } );

        if ( !authorizeResult.success ) {
            throw new Error( authorizeResult.error.message );
        }

        return authorizeResult;
    }

    async bindExternalProvider() {
        const bindingResult = await this.api.bindExternalProvider();

        return bindingResult.success;
    }

    async register( registrationCredentials ) {
        const registrationResult = await this.api.register( registrationCredentials );

        return registrationResult;
    }

    async saveAuthorizedExternalProvider( { login, provider } ) {
        const externalAuthorizeResult = await this.api.saveAuthorizedExternalProvider( {
            login, 
            provider,
        } );

        return externalAuthorizeResult;
    }

    async getSavedExternalProvider() {
        const savedExternalAuthorizeProvider = await this.api.getSavedExternalProvider();

        return savedExternalAuthorizeProvider;
    }

    async removeSavedExternalProvider() {
        const removedExternalAuthorizeProvider = await this.api.removeSavedExternalProvider();

        return removedExternalAuthorizeProvider;
    }
}
