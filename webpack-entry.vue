<template>
    <div>
        <auth-frontend-wrapper
            v-show="!isAuthorizedOrRegistered"
            v-model="currentState"
            :is-production="false"
            @success-authentication="onSuccessAuthentication"
            @success-registration="onSuccessRegistration"
            @external-provider-binding-success="externalProviderBindingSuccess"
            @external-provider-binding-error="externalProviderBindingError"
            @analytics-event="onAnalyticsEvent($event)"
            @selected-tab="onSelectedTab($event)"
        />
        <div v-show="isAuthorizedOrRegistered">
            {{ textAfterAuthorizedOrRegistered }}
        </div>
        <div
            v-for="(message, messageIndex) in messages"
            :key="messageIndex"
        >
            {{ message }}
        </div>
    </div>
</template>
<script>
/* eslint-disable */
// Файл для поключения вебпака, пока нужен для тестирования
import { AuthFrontendWrapper } from './src/';

export default {
    data() {
        return {
            isUserAuthenticated: false,
            isUserRegistered: false,
            messages : [],
            isOpened: true,
            currentState: 'registration',
        }
    },
    provide : {
        requiredDependencies: {
            authHostOverride: 'https://login27893.ts.dev.reg.ru',
        },
    },
    components : {
        AuthFrontendWrapper,
    },
    created() {
        console.log(this);
    },
    computed: {
        isAuthorizedOrRegistered() {
            return this.isUserAuthenticated || this.isUserRegistered;
        },
        textAfterAuthorizedOrRegistered() {
            return this.isUserAuthenticated === true
                ? 'Вы авторизовались'
                : this.isUserRegistered === true
                    ? 'Вы зарегистрировались'
                    : '';
        }
    },
    methods : {
        onSuccessAuthentication() {
            this.isUserAuthenticated = true;
        },
        
        onSuccessRegistration() {
            this.isUserRegistered = true;
        },

        externalProviderBindingSuccess() {
            console.log('Привязка к соцсети прошла успешно');
            this.messages.push( 'Привязка к соцсети прошла успешно' );
        },
        
        externalProviderBindingError() {
            this.messages.push( 'Ошибка привязки к соцсети' );
        },

        onAnalyticsEvent(event) {
            console.log('analytics:', event)
        },

        onSelectedTab(event) {
            console.log('selectedTab:', event)
        }
    },
};
</script>

<style lang="less">
body {
    font-family: Arial, 'Helvetica Neue', Helvetica, FreeSans, sans-serif;
}
</style>
