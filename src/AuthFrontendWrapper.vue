<template>
    <auth-frontend
        v-model="currentState"
        :pre-filled-login="preFilledLogin"
        v-on="$listeners"
    ></auth-frontend>
</template>

<script>
import AuthFrontend from './components/AuthFrontend.vue';
import InitMixin from './components/mixins/InitMixin';

const AuthFrontendWrapper = {
    components : {
        AuthFrontend,
    },
    mixins : [
        InitMixin,
    ],
    props : {
        value : {
            type      : String,
            required  : true,
            validator : function( value ) {
                const validValues = [ 'authentication', 'registration' ];

                return validValues.includes( value );
            },
        },
        preFilledLogin : {
            type     : String,
            required : false,
            default  : '',
        },
        isProduction : {
            type     : Boolean,
            required : false,
            default  : true, 
        },
    },
    data() {
        return {
            currentState : this.value,
        };
    },
    watch : {
        value( value ) {
            this.currentState = value;
        },
    },
};

export default AuthFrontendWrapper;
export { AuthFrontendWrapper };
</script>
