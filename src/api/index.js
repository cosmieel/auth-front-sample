import makeInternalAuthAPI from './InternalAuthAPI/InternalAuthAPI.js';
import makeExternalAuthAPI from './ExternalAuthAPI/ExternalAuthAPI.js';
import OAuth from './helpers/OAuth/OAuth.js';
import RegJWT from '@regru/reg-jwt';
import { computeExternalAuthHost } from './ExternalAuthAPI/utils.js';

export default function makeAPI( { internalAuthAxios, externalAuthAxios, authHostOverride } ) {

    const regJWTOptions = { axios: internalAuthAxios };

    if ( authHostOverride ) {
        regJWTOptions.authHost = authHostOverride;
    }


    const regJWT = new RegJWT( regJWTOptions );

    let internalAuthApi;

    let externalAuthApi;

    internalAuthApi = makeInternalAuthAPI( { regJWT } );
    externalAuthApi = makeExternalAuthAPI( {
        axios : externalAuthAxios,
        oAuth : new OAuth( { authHost: computeExternalAuthHost() } ),
    } );

    return {
        ...internalAuthApi,
        ...externalAuthApi,
    };
}
