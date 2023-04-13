import { nextTick } from 'vue';
import { mount, config } from '@vue/test-utils';
import AuthenticationComponent from '../Authentication.vue';
import { DsButton } from '@regru/design-system';
import {
    manuallyClosedWindowErrorMessage,
} from '../../../errors';
import CaptchaComponent from '../../layouts/Captcha/Captcha.vue';

const execFunction = jest.fn();

function makeCommands() {
    return {
        getCommand : jest.fn().mockImplementation( () => {
            return {
                exec : execFunction,
            };
        } ),
    };
}

const mockedStateMachine = {
    events : {},
    subscribeOnce( eventName, callback ) {
        this.events[ eventName ] = callback;
    },
};
const stateMachine = mockedStateMachine;

const commands = makeCommands();

config.provide.$commands = commands;
config.provide.$stateMachine = stateMachine;

const createComponent = ( propsData ) => {
    return mount( AuthenticationComponent, {
        propsData : {
            ...propsData,
        },
    } );
};

const submitSpy = jest.spyOn( AuthenticationComponent.methods, 'submit' );
const removeErrorMessagesSpy = jest.spyOn( AuthenticationComponent.methods, 'removeErrorMessages' );

const getLastEmittedEvent = ( events ) => {
    return events[ events.length - 1 ];
};

describe( 'Authentication component', () => {

    it( 'при нажатии на кнопку Войти должен вызываться submit', async () => {
        const wrapper = createComponent( {
            value : {
                login                  : 'exampleLogin',
                password               : 'examplePassword',
                canAuthenticateByToken : false,
            },
        } );

        wrapper.findComponent( DsButton ).trigger('click');

        await nextTick();

        expect( submitSpy ).toBeCalled();
    } );

    it( 'при вызове submit должен вызывать и исполнять команду аутентификации', async () => {
        const wrapper = createComponent( {
            value : {
                login                  : 'exampleLogin',
                password               : 'examplePassword',
                canAuthenticateByToken : false,
            },
        } );

        await wrapper.vm.submit();

        expect( commands.getCommand ).toBeCalledWith('Authenticate');
        expect( execFunction ).toBeCalledWith( {
            login    : 'exampleLogin',
            password : 'examplePassword',
        } );
    } );

    it( 'при вызове submit должен показать ошибку, если поле не прошло валидацию', () => {
        const wrapper = createComponent( {
            value : {
                login                  : '',
                password               : '',
                canAuthenticateByToken : false,
            },
        } );

        wrapper.vm.submit();

        expect( wrapper.vm.loginErrorMessage ).toEqual('loginEmptyErrorMessage');
        expect( wrapper.vm.passwordErrorMessage ).toEqual('passwordEmptyErrorMessage');
    } );

    describe( 'при вызове validateLogin', () => {

        it( 'должен выкидывать ошибку, если поле пустое',
            async () => {
                const wrapper = createComponent( {
                    value : {
                        login                  : '',
                        password               : 'examplePassword',
                        canAuthenticateByToken : false,
                    },
                } );

                expect( wrapper.vm.validateLogin ).toThrow('loginEmptyErrorMessage');
            }
        );

        it( 'должен делать ранний return, если флаг canAuthenticateByToken = true', () => {
            const wrapper = createComponent( {
                value : {
                    login                  : '',
                    password               : 'examplePassword',
                    canAuthenticateByToken : true,
                },
            } );

            const result = wrapper.vm.validateLogin();

            expect( result ).toBe( undefined );
        } );
    } );

    describe( 'при вызове validatePassword', () => {

        it( 'должен выкидывать ошибку, если поле пустое',
            async () => {
                const wrapper = createComponent( {
                    value : {
                        login                  : '',
                        password               : '',
                        canAuthenticateByToken : false,
                    },
                } );

                expect( wrapper.vm.validatePassword ).toThrow('passwordEmptyErrorMessage');
            }
        );

        it( 'должен делать ранний return, если флаг canAuthenticateByToken = true', () => {
            const wrapper = createComponent( {
                value : {
                    login                  : '',
                    password               : '',
                    canAuthenticateByToken : true,
                },
            } );

            const result = wrapper.vm.validatePassword();

            expect( result ).toBe( undefined );
        } );
    } );

    describe( 'при вызове onSubmitAuthentication', () => {

        it( 'должен блокировать форму и очищать поля с ошибкой', async () => {
            const wrapper = createComponent( {
                value : {
                    login                  : 'exampleLogin',
                    password               : 'examplePassword',
                    canAuthenticateByToken : false,
                },
            } );

            wrapper.setData( { loginErrorMessage: 'Some message' } );
            wrapper.setData( { passwordErrorMessage: 'Some message' } );

            await wrapper.vm.onSubmitAuthentication();
            await nextTick();

            expect( getLastEmittedEvent( wrapper.emitted()['block-form'] ) ).toBeTruthy();
            expect( wrapper.vm.loginErrorMessage ).toEqual('');
            expect( wrapper.vm.passwordErrorMessage ).toEqual('');
        } );
    } );

    describe( 'при вызове onInvalidAuthenticationData', () => {

        it( 'должен разблокировать форму и выкидывать ошибку', async () => {
            const wrapper = createComponent( {
                value : {
                    login                  : 'exampleLogin',
                    password               : 'examplePassword',
                    canAuthenticateByToken : false,
                },
            } );
            const error = new Error('Some error');

            await wrapper.vm.onInvalidAuthenticationData( error );
            await nextTick();

            expect( getLastEmittedEvent( wrapper.emitted()['unblock-form'] ) ).toBeTruthy();
            expect( wrapper.vm.errorMessage ).toEqual('Some error');
        } );

        it( 'должен отключить блокировку полей, если пришел код ошибки OAUTH_DISABLED', async () => {
            const wrapper = createComponent( {
                value : {
                    login                  : 'exampleLogin',
                    password               : 'examplePassword',
                    canAuthenticateByToken : false,
                },
            } );
            const error = new Error('Some error');

            error.code = 'OAUTH_DISABLED';

            await wrapper.vm.onInvalidAuthenticationData( error );
            await nextTick();

            expect( wrapper.vm.needDisableInputField ).toBe( false );
        } );
    } );

    describe( 'при вызове onGetAuthenticationResult', () => {

        it( 'должен разблокировать форму', async () => {
            const wrapper = createComponent( {
                value : {
                    login                  : 'exampleLogin',
                    password               : 'examplePassword',
                    canAuthenticateByToken : false,
                },
            } );

            await wrapper.vm.onGetAuthenticationResult();
            await nextTick();

            expect( getLastEmittedEvent( wrapper.emitted()['unblock-form'] ) ).toBeTruthy();
        } );

        it( 'должен сообщить об успешной аутентификации если userCredentialsDTO.isAuthenticated', async () => {
            const authenticationResultMock = {
                userCredentialsDTO : {
                    isAuthenticated : true,
                },
            };
            const wrapper = createComponent( {
                value : {
                    login    : 'example@gmail.com',
                    password : 'examplePassword',
                },
            } );

            await wrapper.vm.onGetAuthenticationResult( authenticationResultMock );
            await nextTick();

            expect( commands.getCommand ).toBeCalledWith('Succeed');
        } );

        it( 'должен сообщить о привязке, если userCredentialsDTO.isExternalAuthProviderBindingNeeded', async () => {
            const authenticationResultMock = {
                userCredentialsDTO : {
                    isExternalAuthProviderBindingNeeded : true,
                },
            };
            const wrapper = createComponent( {
                value : {
                    login    : 'example@gmail.com',
                    password : 'examplePassword',
                },
            } );

            await wrapper.vm.onGetAuthenticationResult( authenticationResultMock );
            await nextTick();

            expect( commands.getCommand ).toBeCalledWith('BindExternalProvider');
        } );
    } );

    describe( 'при вызове onSucceedAuthentication', () => {

        it( 'должен сообщить об успешной аутентификации', async () => {
            const wrapper = createComponent( {
                value : {
                    login    : 'example@gmail.com',
                    password : 'examplePassword',
                },
            } );

            await wrapper.vm.onSucceedAuthentication();
            await nextTick();

            expect( getLastEmittedEvent( wrapper.emitted()['success-authentication'] ) ).toBeTruthy();
        } );
    } );

    describe( 'при вызове onErrorAuthorizeExternalProvider', () => {

        it( 'должен показывать ошибку, если внешняя авторизация прошла неудачно', async () => {
            const wrapper = createComponent( {
                value : {
                    login                  : 'exampleLogin',
                    password               : 'examplePassword',
                    canAuthenticateByToken : false,
                },
            } );
            const error = new Error('Some error');

            await wrapper.vm.onErrorAuthorizeExternalProvider( error );
            await nextTick();

            expect( removeErrorMessagesSpy ).toBeCalled();
            expect( wrapper.vm.errorMessage ).toEqual('Some error');
        } );

        it( 'должен не показывать ошибку, если окно внешней авторизации было закрыто без действий внутри', async () => {
            const wrapper = createComponent( {
                value : {
                    login                  : 'exampleLogin',
                    password               : 'examplePassword',
                    canAuthenticateByToken : false,
                },
            } );
            const error = new Error( manuallyClosedWindowErrorMessage );

            await wrapper.vm.onErrorAuthorizeExternalProvider( error );
            await nextTick();

            expect( wrapper.vm.errorMessage ).toEqual('');
        } );
    } );

    describe( 'при вызове cancelExternalAuthorization', () => {
        it( 'должен сообщить о необходимости отмены внешней авторизации и очистить все ошибки', () => {
            const wrapper = createComponent( {
                value : {
                    login    : 'example@gmail.com',
                    password : 'examplePassword',
                },
            } );

            wrapper.vm.cancelExternalAuthorization();

            expect( getLastEmittedEvent( wrapper.emitted()['cancel-external-authorization'] ) ).toBeTruthy();
            expect( removeErrorMessagesSpy ).toBeCalled();
        } );
    } );

    describe( 'при вызове onAuthorizeExternalProvider', () => {
        it( 'должен сообщить о необходимости очистки поля пароля при входе через соцсеть', () => {
            const wrapper = createComponent( {
                value : {
                    login    : 'example@gmail.com',
                    password : 'examplePassword',
                },
            } );

            wrapper.vm.onAuthorizeExternalProvider();

            expect( getLastEmittedEvent( wrapper.emitted()['clear-password-on-external-auth'] ) ).toBeTruthy();
        } );
    } );

    describe( 'login computed', () => {

        it( 'при изменении поля login должно эмититься событие input', async () => {
            const wrapper = createComponent( {
                value : {
                    login                  : 'exampleLogin',
                    password               : 'examplePassword',
                    canAuthenticateByToken : false,
                },
            } );

            wrapper.setData( { login: 'changedLogin' } );

            await nextTick();

            expect( getLastEmittedEvent( wrapper.emitted().input ) )
                .toEqual( [ {
                    login                  : 'changedLogin',
                    password               : 'examplePassword',
                    canAuthenticateByToken : false,
                } ] );
        } );

        it( 'должен вычисляться из value.login', async () => {
            const wrapper = createComponent( {
                value : {
                    login                  : 'exampleLogin',
                    password               : 'examplePassword',
                    canAuthenticateByToken : false,
                },
            } );

            expect( wrapper.vm.login ).toEqual('exampleLogin');
        } );
    } );

    describe( 'при вызове onGetAuthenticationResult', () => {

        it.each( [
            [ 'unblock-form' ],
            [ 'need-sms-confirmation' ],
        ] )( 'должен эмитить событие %s', async ( eventName ) => {
            const authenticationResultMock = {
                userCredentialsDTO : {
                    isSmsConfirmation : true,
                },
                timeBeforeSmsResend : '300',
            };
            const wrapper = createComponent( {
                value : {
                    login    : 'example@gmail.com',
                    password : 'examplePassword',
                },
            } );

            await wrapper.vm.onGetAuthenticationResult( authenticationResultMock );
            await nextTick();

            expect( getLastEmittedEvent( wrapper.emitted()[eventName] ) ).toBeTruthy();
        } );
    } );

    describe( 'password computed', () => {

        it( 'при изменении поля password должно эмититься событие input', async () => {
            const wrapper = createComponent( {
                value : {
                    login                  : 'exampleLogin',
                    password               : 'examplePassword',
                    canAuthenticateByToken : false,
                },
            } );

            wrapper.setData( { password: 'changedPassword' } );

            await nextTick();

            expect( getLastEmittedEvent( wrapper.emitted().input ) )
                .toEqual( [ {
                    login                  : 'exampleLogin',
                    password               : 'changedPassword',
                    canAuthenticateByToken : false,
                } ] );
        } );

        it( 'должен вычисляться из value.password', async () => {
            const wrapper = createComponent( {
                value : {
                    login                  : 'exampleLogin',
                    password               : 'examplePassword',
                    canAuthenticateByToken : false,
                },
            } );

            expect( wrapper.vm.password ).toEqual('examplePassword');
        } );
    } );

    describe( 'событие компонента CaptchaComponent', () => {

        it( 'authentication-captcha-success должно вызывать сабмит', async () => {
            const wrapper = createComponent( {
                value : {
                    login                  : 'exampleLogin',
                    password               : 'examplePassword',
                    canAuthenticateByToken : false,
                },
            } );

            wrapper.findComponent( CaptchaComponent ).vm.$emit('captcha-success');

            await nextTick();

            expect( submitSpy ).toBeCalled();
        } );
    } );
} );
