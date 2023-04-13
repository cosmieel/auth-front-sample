import StateMachine from 'javascript-state-machine';

const authSubmitForm = [
    {
        name : 'submitAuthentication',
        from : 'credentialsInput',
        to   : 'authenticationDataSubmit',
    },
    {
        name : 'invalidAuthenticationData',
        from : 'authenticationDataSubmit',
        to   : 'credentialsInput',
    },
    {
        name : 'getAuthenticationResult',
        from : 'authenticationDataSubmit',
        to   : 'hasAuthenticationResult',
    },
    {
        name : 'succeedAuthentication',
        from : ['hasAuthenticationResult', 'successBindingExternalProvider'],
        to   : 'authenticationSuccess',
    },
    {
        name : 'needAuthenticationCaptcha',
        from : 'hasAuthenticationResult',
        to   : 'credentialsInput',
    },
];

const regSubmitForm = [
    {
        name : 'submitRegistration',
        from : 'credentialsInput',
        to   : 'registrationDataSubmit',
    },
    {
        name : 'invalidRegistrationData',
        from : 'registrationDataSubmit',
        to   : 'credentialsInput',
    },
    {
        name : 'getRegistrationResult',
        from : 'registrationDataSubmit',
        to   : 'hasRegistrationResult',
    },
    {
        name : 'succeedRegistration',
        from : ['hasRegistrationResult', 'successBindingExternalProvider'],
        to   : 'successRegistration',
    },
    {
        name : 'needRegistrationCaptcha',
        from : 'hasRegistrationResult',
        to   : 'credentialsInput',
    },
];

const bindExternalProvider = [
    {
        name : 'bindExternalProvider',
        from : [
            'hasAuthenticationResult',
            'hasRegistrationResult',
        ],
        to : 'externalProviderBind',
    },
    {
        name : 'hasBindExternalProviderResult',
        from : 'externalProviderBind',
        to   : 'successBindingExternalProvider',
    },

];

const authorizeExternalProvider = [
    {
        name : 'authorizeExternalProvider',
        from : 'credentialsInput',
        to   : 'authorizingExternalProvider',
    },
    {
        name : 'successAuthorizeExternalProvider',
        from : 'authorizingExternalProvider',
        to   : 'credentialsInput',
    },
    {
        name : 'errorAuthorizeExternalProvider',
        from : 'authorizingExternalProvider',
        to   : 'credentialsInput',
    },
];

const smsConfirm = [
    {
        name : 'smsCodeResend',
        from : 'smsCodeSubmit',
        to   : 'smsCodeInput',
    },
    {
        name : 'smsCodeError',
        from : 'smsCodeSubmit',
        to   : 'smsCodeInput',
    },
    {
        name : 'needSmsSubmitCaptcha',
        from : 'smsCodeSubmit',
        to   : 'smsCodeInput',
    },
    {
        name : 'needSmsResendCaptcha',
        from : 'smsCodeSubmit',
        to   : 'smsCodeInput',
    },
    {
        name : 'submitSmsConfirmation',
        from : ['smsCodeInput', 'hasAuthenticationResult'],
        to   : 'smsCodeSubmit',
    },
    {
        name : 'successSmsConfirmation',
        from : 'smsCodeSubmit',
        to   : 'hasAuthenticationResult',
    },
    {
        name : 'needSmsConfirmationCaptcha',
        from : 'smsCodeInput',
        to   : 'hasAuthenticationResult',
    },
];

function createStateMachine() {
    const stateMachine = new StateMachine( {
        init        : 'credentialsInput',
        transitions : [
            ...authSubmitForm,
            ...authorizeExternalProvider,
            ...regSubmitForm,
            ...bindExternalProvider,
            ...smsConfirm,
            {
                name : 'reset',
                from : '*',
                to   : 'credentialsInput',
            },
        ],
    } );
    
    stateMachine.customObserversList = {};
    
    stateMachine.subscribeOnce = function( eventName, subscriber ) {
        this.customObserversList[eventName] = this.customObserversList[eventName] ?? [];
        if ( this.customObserversList[eventName].includes( subscriber ) ) {
            return;
        }
        this.observe( eventName, subscriber );
        this.customObserversList[eventName].push( subscriber );
    };

    return stateMachine;
}

export default createStateMachine;
