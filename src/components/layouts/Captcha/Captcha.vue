<template>
    <div class="auth-frontend__captcha-wrapper">
        <VueRecaptcha
            v-if="isCaptchaNeeded"
            ref="recaptcha"
            :load-recaptcha-script="true"
            :sitekey="captchaSiteKey"
            @verify="setCaptchaResponse"
            @expired="setCaptchaExpired"
        />
    </div>
</template>

<script>
import VueRecaptcha from 'vue-recaptcha';
import captchaTypes from './captchaTypes';
import { captchaSuccessEvent } from '../../../events/eventTypes';

export default {
    name       : 'Captcha',
    components : {
        VueRecaptcha,
    },
    inject : ['$commands'],
    props  : {
        captchaSiteKey : {
            type    : String,
            default : '',
        },
        captchaResponse : {
            type    : String,
            default : '',
        },
        captchaType : {
            type     : String,
            required : true,
            validator( value ) {
                const captchaTypesKeys = Object.keys( captchaTypes );
                const validCaptchaTypeValues = captchaTypesKeys.map( key => captchaTypes[ key ] );

                return validCaptchaTypeValues.includes( value );
            },
        },
    },
    computed : {
        isCaptchaNeeded() {
            return !this.captchaResponse && this.captchaSiteKey;
        },
        setCaptchaResponseCommandName() {
            return `Set${this.captchaType}CaptchaResponse`;
        },
    },
    methods : {

        // Это использование ref-a требует компонент VueRecaptcha
        setCaptchaExpired() {
            this.$refs.recaptcha.reset();
        },

        async setCaptchaResponse( captchaResponse ) {

            const setCaptchaResponseCommand = this.$commands
                .getCommand( this.setCaptchaResponseCommandName );

            await setCaptchaResponseCommand.exec( captchaResponse );

            this.$emit( captchaSuccessEvent );
        },
    },
};
</script>

<style lang="less">
    .auth-frontend__captcha-wrapper{
        margin-top: 24px;
    }
</style>
