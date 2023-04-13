const ERROR_CODE = 403;
const OAuthWindowMock = require('./src/OAuthWindowMock');

const proxy = {
    'GET /authenticate' : {
        csrf : 'csrf',
    },
    'POST /authenticate' : function( req, res ) {
        const { confirmation_code, captcha_response, sms_session_id } = req.body;
        const USER_ID = 123;

        if ( captcha_response ) {
            return res.json( {
                result : {
                    status      : 'authenticated',
                    user_id     : USER_ID,
                    screen_name : '123@123.com',
                },
                success : true,
            } );
        }

        if ( sms_session_id ) {
            return res.json( {

                result : {
                    count_attempt : '6',
                    site_key      : '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
                    status        : 'need_captcha',
                    screen_name   : 'screen_name',
                },

            } );
        }

        if ( !confirmation_code ) {
            return res.json( {

                // result : {
                //     count_attempt : '6',
                //     site_key      : '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
                //     status        : 'need_captcha',
                // },

                result : {
                    must_wait      : '3',
                    sms_session_id : '35e305ed347ee4bee71a56fe4839d3d8',
                    status         : 'sms_new_session',
                },

                // result : {
                //     status      : 'authenticated',
                //     user_id     : USER_ID,
                //     screen_name : '123@123.com',
                // },
                success : true,
            } );
        }

        else if ( confirmation_code === '6471' ) {
            return res.json( {
                success : true,
                result  : {
                    status      : 'authenticated',
                    user_id     : USER_ID,
                    screen_name : '123@123.com',
                },
            } );
        }

        return res.status( ERROR_CODE ).json( {
            success : false,
            message : [
                {
                    code : 'WRONG_CODE', // 'WRONG_CODE', 'ACCOUNT_BLOCKED'
                    text : 'Введен неверный код подтверждения.',
                    type : 'error',
                },
            ],
        } );
    },
    'GET /register_and_authenticate' : {
        csrf : 'csrf',
    },
    'POST /register_and_authenticate' : function( req, res ) {
        const { captcha_response, email } = req.body;

        if ( !captcha_response ) {
            return res.json( {
                result : {
                    site_key : '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
                    status   : 'need_captcha',
                },
                success : true,
            } );
        }

        return res.json( {
            result : {
                screen_name : email,
                status      : 'registered',
            },
            success : true,
        } );
    },
    'GET /api/accounts/providers' : function( req, res ) {
        return res.json( {
            'providers' : [{
                'provider_name' : 'vkontakte',
                'enabled'       : true,
            }, {
                'provider_name' : 'yandex',
                'enabled'       : true,
            }, {
                'provider_name' : 'mailru',
                'enabled'       : true,
            }, {
                'provider_name' : 'facebook',
                'enabled'       : true,
            }, {
                'provider_name' : 'google',
                'enabled'       : true,
            }, {
                'provider_name' : 'apple',
                'enabled'       : true,
            }],
        } );
    },
    'GET /oauth/yandex' : function( req, res ) {
        res.setHeader( 'Content-Type', 'text/html' );

        res.write( OAuthWindowMock );
    },
    'POST /refresh' : {
        success : true,
        result  : {
            status      : 'session_refreshed',
            screen_name : 'test@test.ru',
            user_id     : '1',
        },
    },
    'POST /api/accounts/bind' : {
        success : true,
    },
};

module.exports = proxy;
