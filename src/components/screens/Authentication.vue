<template>
    <div>
        <Title v-if="isShowNeedBindMessage">
            {{ $t('loginConfirmMessage') }}
        </Title>
        <AuthenticationNeedBindMessage
            v-if="isShowNeedBindMessage"
            :value="value"
        />
        <InfoMessage v-if="isUserAlreadyExists">
            {{ $t('userAlreadyExistMessage') }}
        </InfoMessage>
        <ErrorMessage
            v-if="errorMessage"
            v-html="errorMessage"
        />
        <form
            @submit.stop.prevent
        >
            <LoginField
                v-model="login"
                :is-disabled="isInputFieldDisabled"
                :login-field-state="loginFieldState"
                :login-field-hint="loginFieldHint"
            />
            <PasswordField
                v-model="password"
                :password-field-state="passwordFieldState"
                :password-field-hint="passwordFieldHint"
                :is-disabled="isInputFieldDisabled"
            />
            <div class="auth-form__wrapper-link">
                <a
                    :href="restorePasswordLink"
                    rel="noreferrer noopener"
                    target="_blank"
                    class="auth-form__link ds-link qa-auth-form-link-forgot-pass"
                >{{ $t('forgetPasswordHint') }}</a>
            </div>

            <Captcha
                :captcha-site-key="captchaData.siteKey"
                :captcha-response="captchaData.response"
                :captcha-type="captchaType"
                @captcha-success="onAuthenticationCaptchaSuccess"
            />

            <ds-button
                class="auth-form__submit-button qa-auth-form-login-btn"
                color="blue-500"
                block
                :disabled="isSubmitButtonDisabled"
                @click="submit"
            >
                {{ $t('loginButtonText') }}
            </ds-button>

            <ds-button
                v-if="isShowNeedBindMessage"
                class="auth-form__cancel-button qa-registr-form-cancel-btn"
                color="gray-50"
                block
                :disabled="isSubmitButtonDisabled"
                @click="cancelExternalAuthorization"
            >
                {{ $t('cancelButtonText') }}
            </ds-button>
        </form>
    </div>
</template>

<script>

// Design system
import { DsButton } from '@regru/design-system';

// Constants
import {
    successAuthenticationEvent,
    blockFormEvent,
    unblockFormEvent,
    needSmsConfirmationEvent,
    analyticsEvent,
    oauthDisabledEvent,
    cancelExternalAuthorizationEvent,
    clearPasswordOnExternalAuthEvent,
} from '../../events/eventTypes';
import { restorePasswordLink } from '../constants/index';
import {
    manuallyClosedWindowErrorMessage,
} from '../../errors';

import AuthenticationNeedBindMessage from '../layouts/AuthenticationNeedBindMessage.vue';
import InfoMessage from '../layouts/InfoMessage.vue';
import ErrorMessage from '../layouts/ErrorMessage.vue';
import Title from '../layouts/Title.vue';

import StateMachineListenersMixin from '../mixins/StateMachineListenersMixin';
import Captcha from '../layouts/Captcha/Captcha.vue';
import captchaTypes from '../layouts/Captcha/captchaTypes';
import generateCaptchaData from '../layouts/Captcha/generateCaptchaData';
import { SUCCEED_AUTHENTICATION_TRANSITION_NAME } from '../../constants';
import PasswordField from '../layouts/PasswordField.vue';
import LoginField from '../layouts/LoginField.vue';

import messages from './locales/messages';

export default {
    name : 'Authentication',
    i18n : {
        messages,
    },
    components : {
        PasswordField,
        LoginField,
        Captcha,
        DsButton,
        AuthenticationNeedBindMessage,
        InfoMessage,
        ErrorMessage,
        Title,
    },
    mixins : [
        StateMachineListenersMixin,
    ],
    inject : ['$commands'],
    props  : {
        value : {
            type     : Object,
            required : true,
        },
        isUserAlreadyExists : {
            type : Boolean,
        },
    },
    data() {
        return {
            loginErrorMessage     : '',
            passwordErrorMessage  : '',
            errorMessage          : '',
            infoMessage           : '',
            stateMachineListeners : [
                'onSubmitAuthentication',
                'onInvalidAuthenticationData',
                'onGetAuthenticationResult',
                'onSucceedAuthentication',
                'onErrorAuthorizeExternalProvider',
                'onAuthorizeExternalProvider',
            ],
            needDisableInputField : true,
        };
    },
    computed : {
        userInput() {
            return {
                login    : this.value.login,
                password : this.value.password,
            };
        },
        login : {
            get() {
                return this.value.login;
            },
            set( login ) {
                this.$emit( 'input', Object.assign( this.value, { login } ) );
            },
        },
        password : {
            get() {
                return this.value.password;
            },
            set( password ) {
                this.$emit( 'input', Object.assign( this.value, { password } ) );
            },
        },
        isInvalidLogin() {
            return this.loginErrorMessage;
        },
        loginFieldState() {
            return this.isInvalidLogin ? 'error' : 'default';
        },
        loginFieldHint() {
            return this.isInvalidLogin ? this.loginErrorMessage : '';
        },
        isInvalidPassword() {
            return this.passwordErrorMessage;
        },
        passwordFieldState() {
            return this.isInvalidPassword ? 'error' : 'default';
        },
        passwordFieldHint() {
            return this.isInvalidPassword ? this.passwordErrorMessage : '';
        },
        restorePasswordLink() {
            return restorePasswordLink;
        },
        isShowNeedBindMessage() {
            return this.value.isExternalAuthProviderBindingNeeded;
        },
        captchaType() {
            return captchaTypes.authentication;
        },
        captchaData() {
            return generateCaptchaData( this.value );
        },
        isSubmitButtonDisabled() {
            return this.captchaData.isKeyExists;
        },
        isInputFieldDisabled() {
            return this.needDisableInputField && this.value.canAuthenticateByToken;
        },

    },
    watch : {
        login : function() {
            this.removeErrorMessages();
        },
        password : function() {
            this.removeErrorMessages();
        },
    },
    methods : {
        async submit() {
            if ( !this.isSubmitButtonDisabled ) {
                this.$emit( analyticsEvent, { name: 'login_button_clicked' } );
            }
            this.removeErrorMessages();

            try {
                this.validateLogin();
            }
            catch ( error ) {
                this.loginErrorMessage = error.message;

                if ( this.password.length ) {
                    return;
                }
            }

            try {
                this.validatePassword();
            }
            catch ( error ) {
                this.passwordErrorMessage = error.message;

                return;
            }

            const authenticateCommand = this.$commands.getCommand('Authenticate');

            await authenticateCommand.exec( this.userInput );
        },

        validateLogin() {
            if ( this.value.canAuthenticateByToken ) {
                return;
            }

            if ( !this.login.length ) {
                throw new Error( this.$t('loginEmptyErrorMessage') );
            }
        },

        validatePassword() {
            if ( this.value.canAuthenticateByToken ) {
                return;
            }
            
            if ( !this.password.length ) {
                throw new Error( this.$t('passwordEmptyErrorMessage') );
            }
        },

        onSubmitAuthentication() {
            this.$emit( blockFormEvent );

            this.removeErrorMessages();
        },

        onInvalidAuthenticationData( error ) {
            this.showErrorMessage( error );

            if ( error.code === 'OAUTH_DISABLED' ) {
                this.needDisableInputField = false;

                this.$emit( oauthDisabledEvent );
            }
        },

        onSucceedAuthentication( userCredentialsDTO ) {
            this.$emit( successAuthenticationEvent, userCredentialsDTO );
            this.$emit( analyticsEvent, { name: 'success_authentication' } );
        },
        
        onGetAuthenticationResult( authenticationResult ) {
            this.$emit( unblockFormEvent );

            if ( authenticationResult?.userCredentialsDTO?.isSmsConfirmation ) {
                this.$emit( needSmsConfirmationEvent, authenticationResult.timeBeforeSmsResend );

                return;
            }

            if ( this.captchaData.isKeyExists ) {
                return;
            }

            // nextTick нужен для того, чтобы стейтмашина не ругалась на незавершенный переход в состояние
            this.$nextTick( () => {
                if ( authenticationResult?.userCredentialsDTO?.isExternalAuthProviderBindingNeeded ) {
                    this.bindExternalProvider( authenticationResult );

                    return;
                }

                if ( authenticationResult?.userCredentialsDTO?.isAuthenticated ) {
                    this.succeedAuthentication( authenticationResult );
                }
            } );
        },

        onErrorAuthorizeExternalProvider( error ) {
            this.removeErrorMessages();

            if ( error.message === manuallyClosedWindowErrorMessage ) {
                return;
            }

            this.errorMessage = error.message;
        },

        removeErrorMessages() {
            this.errorMessage = '';
            this.loginErrorMessage = '';
            this.passwordErrorMessage = '';
        },

        showErrorMessage( error ) {
            this.$emit( unblockFormEvent );

            this.errorMessage = error.message;
        },

        onAuthenticationCaptchaSuccess() {
            this.submit();
        },

        bindExternalProvider( authenticationResult ) {
            const bindExternalProviderCommand = this.$commands.getCommand('BindExternalProvider');

            bindExternalProviderCommand.exec( 
                authenticationResult.userCredentialsDTO, SUCCEED_AUTHENTICATION_TRANSITION_NAME 
            );
        },

        succeedAuthentication( authenticationResult ) {
            const succeedCommand = this.$commands.getCommand('Succeed');

            succeedCommand.exec( authenticationResult.userCredentialsDTO, SUCCEED_AUTHENTICATION_TRANSITION_NAME );
        },

        cancelExternalAuthorization() {
            this.$emit( cancelExternalAuthorizationEvent );
            this.removeErrorMessages();
        },

        onAuthorizeExternalProvider() {
            if ( this.password.length ) {
                this.$emit( clearPasswordOnExternalAuthEvent );
            }
        },
    },
};
</script>
