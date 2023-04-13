<template>
    <div
        class="auth-form"
    >
        <div
            v-if="isFormBlocked"
            class="auth-form-loader"
        >
            <ds-loader :overlay="true"></ds-loader>
        </div>
        <div class="auth-form__content">
            <div class="auth-form__vpn-warn">
                Не забудьте отключить VPN. 
                Он может мешать работе SMS-уведомлений
            </div>
            <ds-segment-control
                v-show="isTabShown"
                v-model="selectedTab"
                :options="tabs"
                option-class="wrapper-sc__option"
                class="auth-form__tabs"
                :class="tabsQAClass"
            />
            <Authentication
                v-show="isAuthenticationFormShown"
                :value="userCredentials"
                :is-user-already-exists="isUserAlreadyExists"
                @success-authentication="onSuccessAuthentication"
                @oauth-disabled-event="onOauthDisabled"
                @block-form="blockForm"
                @unblock-form="unblockForm"
                @need-sms-confirmation="onNeedSmsConfirmation"
                @analytics-event="onAnalyticsEvent($event)"
                @cancel-external-authorization="cancelExternalAuthorization"
                @clear-password-on-external-auth="clearPasswordOnExternalAuth"
            />
            <StoredExternalLogin
                v-show="isStoredExternalLoginFormShown"
                :value="userCredentials"
                @show-authentication-form="showAuthenticationForm"
                @show-stored-external-login-form="showStoredExternalLoginForm"
                @block-form="blockForm"
                @unblock-form="unblockForm"
            />
            <Registration
                v-show="isRegistrationFormShown"
                :value="userCredentials"
                @success-registration="onSuccessRegistration"
                @block-form="blockForm"
                @unblock-form="unblockForm"
                @user-already-exists="setUserAlreadyExists"
                @cancel-external-authorization="cancelExternalAuthorization"
            />
            <SmsConfirm
                v-if="isSmsConfirmShown"
                :value="userCredentials"
                :time-before-sms-resend="smsConfirm.timeBeforeSmsResend"
                @success-authentication="onSuccessAuthentication"
                @need-sms-confirmation="onNeedSmsConfirmation"
                @block-form="blockForm"
                @unblock-form="unblockForm"
            />
            <ExternalLogin
                v-show="isExternalProvidersComponentShown"
                :hint-text="externalLoginHintText"
                @block-form="blockForm"
                @unblock-form="unblockForm"
                @external-authorize-success="onExternalAuthorizeSuccess"
            />
        </div>
    </div>
</template>

<script>

// Design system
import { DsSegmentControl, DsLoader } from '@regru/design-system';

// Components
import Authentication from './screens/Authentication.vue';
import Registration from './screens/Registration.vue';
import ExternalLogin from './layouts/ExternalLogin.vue';
import StoredExternalLogin from './layouts/StoredExternalLogin.vue';
import SmsConfirm from './screens/SmsConfirm.vue';

// Constatns
import {
    successAuthenticationEvent,
    successRegistrationEvent,
    externalProviderBindingSuccessEvent,
    externalProviderBindingErrorEvent,
    selectedTabEvent,
    analyticsEvent,
} from '../events/eventTypes';

import StateMachineListenersMixin from './mixins/StateMachineListenersMixin';

import messages from './locales/messages';

export default {
    name : 'AuthFrontend',
    i18n : {
        messages,
    },
    components : {
        DsSegmentControl,
        DsLoader,
        Authentication,
        Registration,
        ExternalLogin,
        SmsConfirm,
        StoredExternalLogin,
    },
    mixins : [
        StateMachineListenersMixin,
    ],
    inject : [
        '$commands',
        '$userCredentialsDTO',
    ],
    props : {
        value : {
            type     : String,
            required : true,
        },
        preFilledLogin : {
            type     : String,
            required : false,
            default  : '',
        },
    },
    data() {
        return {
            selectedTab   : null,
            isFormBlocked : false,
            smsConfirm    : {
                isNeeded            : false,
                timeBeforeSmsResend : null,
            },
            userCredentials       : null,
            isUserAlreadyExists   : false,
            stateMachineListeners : [
                'onBindExternalProvider',
                'onHasBindExternalProviderResult',
                'onSubmitAuthentication',
                'onInvalidAuthenticationData',
                'onInvalidRegistrationData',
            ],
            isLoggedInWithExternalProvider : false,
        };
    },
    computed : {
        tabs() {
            const tabNames = ['registration', 'authentication'];

            return tabNames.map( ( tab, tabIndex ) => {
                return {
                    value : tabIndex + 1,
                    name  : tab,
                    label : this.$t( tab ),
                };
            } );
        },
        isAuthenticationFormShown() {
            const isAuthenticationTabSelected = this.selectedTab.value === 2;

            return isAuthenticationTabSelected && !this.isSmsConfirmShown && !this.isLoggedInWithExternalProvider;
        },
        isStoredExternalLoginFormShown() {
            return this.isLoggedInWithExternalProvider && !this.isRegistrationFormShown && !this.isSmsConfirmShown;
        },
        isRegistrationFormShown() {
            const isRegistrationTabSelected = this.selectedTab.value === 1;

            return isRegistrationTabSelected && !this.isSmsConfirmShown;
        },
        isTabShown() {
            return !this.isSmsConfirmShown && !this.userCredentials.isExternalAuthProviderBindingNeeded;
        },
        isExternalProvidersComponentShown() {
            return (
                !this.userCredentials.isExternalAuthProviderBindingNeeded
                && !this.isStoredExternalLoginFormShown
                && !this.isSmsConfirmShown
            );
        },
        externalLoginHintText() {
            if ( this.isAuthenticationFormShown ) {
                return this.$t('externalLoginHintText');
            }
            if ( this.isRegistrationFormShown ) {
                return this.$t('externalRegistrationHintText');
            }

            return '';
        },
        canAuthenticateByToken() {
            return this.userCredentials?.canAuthenticateByToken;
        },
        isSmsConfirmShown() {
            return this.smsConfirm.isNeeded;
        },
        tabsQAClass() {            
            return this.selectedTab.label === this.$t('registration')
                ? 'qa-auth-tab-register'
                : 'qa-auth-tab-authorize';
        },
    },
    watch : {
        async canAuthenticateByToken( flag ) {
            if ( flag ) {
                await this.authenticate();
            }
        },
        selectedTab( value ) {
            const isRegistrationTabSelected = value.name === 'registration';

            this.$emit( selectedTabEvent, value.name );

            if ( isRegistrationTabSelected ) {
                this.isUserAlreadyExists = false;
                this.$emit( analyticsEvent, { name: 'registration_popup_shown' } );
            }
        },
        value( value ) {
            this.selectedTab = this.tabs.find( tab => tab.name.includes( value ) );
        },
    },
    created() {
        this.userCredentials = this.$userCredentialsDTO;
        if ( this.preFilledLogin ) {
            this.userCredentials.login = this.preFilledLogin;
        }
        this.initActiveTab();
    },
    methods : {
        initActiveTab() {
            this.selectedTab = this.tabs.find( tab => tab.name.includes( this.value ) );
        },

        switchToAuthentication() {
            this.selectedTab = this.tabs[1];
        },

        onSuccessAuthentication( userCredentialsDTO ) {
            this.userCredentials = userCredentialsDTO;
            this.$emit( successAuthenticationEvent );
            this.blockForm();
        },

        onSuccessRegistration( userCredentialsDTO ) {
            this.userCredentials = userCredentialsDTO;
            this.$emit( successRegistrationEvent );
            this.$emit( analyticsEvent, { name: 'success_registration' } );
            this.blockForm();
        },

        async onExternalAuthorizeSuccess( userCredentials ) {
            this.userCredentials = userCredentials;
        },

        onBindExternalProvider() {
            this.blockForm();
        },

        onHasBindExternalProviderResult( userCredentialsDTO, succeedTransitionName, error ) {
            this.$emit( error ? externalProviderBindingErrorEvent : externalProviderBindingSuccessEvent );
            this.unblockForm();

            this.$nextTick( () => {
                this.succeed( userCredentialsDTO, succeedTransitionName );
            } );
        },

        blockForm() {
            this.isFormBlocked = true;
        },

        unblockForm() {
            this.isFormBlocked = false;
        },

        async succeed( userCredentialsDTO, succeedTransitionName ) {
            const succeedCommand = this.$commands.getCommand('Succeed');

            succeedCommand.exec( userCredentialsDTO, succeedTransitionName );
        },

        async authenticate() {
            this.switchToAuthentication();
            const authenticateCommand = this.$commands.getCommand('Authenticate');

            await authenticateCommand.exec();
        },

        setUserAlreadyExists() {
            this.switchToAuthentication();

            this.isUserAlreadyExists = true;
        },

        onSubmitAuthentication() {
            this.isUserAlreadyExists = false;
        },

        showStoredExternalLoginForm() {
            this.isLoggedInWithExternalProvider = true;
        },

        showAuthenticationForm() {
            this.isLoggedInWithExternalProvider = false;
        },

        onNeedSmsConfirmation( timeBeforeSmsResend ) {
            this.smsConfirm = {
                isNeeded            : true,
                timeBeforeSmsResend : timeBeforeSmsResend,
            };
        },

        onAnalyticsEvent( event ) {
            this.$emit( analyticsEvent, event );
        },

        onInvalidAuthenticationData( error ) {
            const emitPayload = {
                name           : 'invalid_authentication_form',
                errorCodeLabel : error.code,
            };

            this.$emit( analyticsEvent, emitPayload );
        },

        onInvalidRegistrationData( error ) {
            const emitPayload = {
                name           : 'invalid_registration_form',
                errorCodeLabel : error.code,
            };

            this.$emit( analyticsEvent, emitPayload );
        },

        onOauthDisabled() {
            this.userCredentials.canAuthenticateByToken = false;
        },

        cancelExternalAuthorization() {
            const cancelExternalAuthorizationCommand = this.$commands
                .getCommand('CancelExternalProviderAuthorization');

            this.userCredentials = cancelExternalAuthorizationCommand.exec();
        },

        clearPasswordOnExternalAuth() {
            const clearPasswordOnExternalAuthCommand = this.$commands
                .getCommand('ClearPasswordOnExternalAuth');

            this.userCredentials = clearPasswordOnExternalAuthCommand.exec();
        },
    },
    
};
</script>

<style lang="less">
@import '~@regru/design-system/src/styles/ds-link/ds-link.less';
@import '~@reg-design/ds-tokens/ds-tokens';

.auth-form {
    color: @color-font-secondary-main;
    position: relative;
    display: flex;
    width: 100%;
    align-items: center;
    height: auto;
    justify-content: center;
    .mobile-sm({
        align-items: flex-start;
        min-height: 434px;
    });
    &-loader {
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: 9999;
        background: rgba(255, 255, 255, .5);
    }
    &__submit-button {
        margin-top: 24px;
    }
    &__cancel-button {
        margin-top: 8px;
    }
    &__personal-data-hint {
        .text-xs-normal();
        margin-top: 12px;
        display: block;
    }
    &__content {
        width: 348px;
        height: auto;
    }
    &__wrapper-link {
        margin: 6px 0 18px 0;
    }
    &__credential {
        margin-top: 18px;
    }
    &__tabs {
        .ds-segment-control__control-wrapper {
            width: 100%;
            text-align: center;
        }
        .ds-segment-control__option-wrapper {
            width: 50%;
        }
    }

    &__vpn-warn {
        .text-s-normal();
        line-height: 20px;
        margin-bottom: 24px;
        text-align: center;
    }
}
</style>
