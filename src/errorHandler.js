import { BrowserClient, Hub } from '@sentry/browser';
import expectedErrorCodes from './expectedErrorCodes';

function _isExpectedError( error ) {
    if ( expectedErrorCodes.includes( error.code ) ) {

        return true;
    }

    return false;
}

let errorHandler;

export function getErrorHandler( isProduction = true ) {
    if ( errorHandler ) {
        return errorHandler;
    }

    let errorHub;

    if ( isProduction ) {
        const browserClient = new BrowserClient( {
            dsn : 'https://7@sentry.reg.ru/147',
        } );

        errorHub = new Hub( browserClient );
    }
    else {
        errorHub = {
            captureException( error ) {
                console.log( error );
            },
        };
    }
    
    errorHandler = {
        handleError( error ) {
            if ( _isExpectedError( error ) ) {
                return;
            }
            errorHub.captureException( error );
        },
    };

    return errorHandler;
}
