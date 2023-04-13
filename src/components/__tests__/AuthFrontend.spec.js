import { nextTick } from 'vue';
import { shallowMount, config } from '@vue/test-utils';
import AuthFrontendComponent from '../AuthFrontend.vue';

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
    subscribeOnce : jest.fn(),
};

let wrapper;

const userCredentialsDTO = {
    canAuthenticateByToken : false,
    login                  : '',
    password               : '',
};

const commands = makeCommands();

config.provide.$commands = commands;
config.provide.$stateMachine = mockedStateMachine;
config.provide.$userCredentialsDTO = userCredentialsDTO;

let value = 'authentication';

beforeEach( () => {
    wrapper = shallowMount( AuthFrontendComponent, {
        propsData : {
            value,
        },
    } );
} );

const authenticateSpy = jest.spyOn( AuthFrontendComponent.methods, 'authenticate' );

const getLastEmittedEvent = ( events ) => {
    return events[ events.length - 1 ];
};

describe( AuthFrontendComponent.name, () => {

    describe( 'метод initActiveTab', () => {

        it( 'должен инициализировать нужную вкладку', async () => {
            await wrapper.setProps( { value: 'authentication' } );
            wrapper.vm.initActiveTab();

            expect( wrapper.vm.selectedTab )
                .toEqual( wrapper.vm.tabs[1] );

            await wrapper.setProps( { value: 'registration' } );

            wrapper.vm.initActiveTab();

            expect( wrapper.vm.selectedTab )
                .toEqual( wrapper.vm.tabs[0] );
        } );
    } );

    describe( 'при вызове onSuccessAuthentication', () => {

        it( `должен эмиттить событие successAuthenticationEvent,
        блокировать фоорму и проверять необходимость привязки`, async () => {
            const mockedUserCredentials = { screenName: 'exampleScreenName' };

            await wrapper.vm.onSuccessAuthentication( mockedUserCredentials );
            await nextTick();

            expect( getLastEmittedEvent( wrapper.emitted()['success-authentication'] ) ).toBeTruthy();
            expect( wrapper.vm.isFormBlocked ).toBe( true );
        } );
    } );

    describe( 'при вызове onSuccessRegistration', () => {

        it( `должен эмиттить событие successRegistrationEvent,
        блокировать форму и проверять необходимость привязки`, async () => {
            const mockedUserCredentials = { screenName: 'exampleScreenName' };

            await wrapper.vm.onSuccessRegistration( mockedUserCredentials );
            await nextTick();

            expect( getLastEmittedEvent( wrapper.emitted()['success-registration'] ) ).toBeTruthy();
            expect( wrapper.vm.isFormBlocked ).toBe( true );
        } );
    } );

    describe( 'при вызове onExternalAuthorizeSuccess', () => {

        it( 'должен ', async () => {
            const mockedUserCredentials = { login: 'exampleLogin' };

            await wrapper.vm.onExternalAuthorizeSuccess( mockedUserCredentials );
            await nextTick();

            expect( wrapper.vm.userCredentials ).toEqual( { login: 'exampleLogin' } );
        } );
    } );

    describe( 'при вызове onBindExternalProvider', () => {

        it( 'должна блокироваться форма', async () => {
            await wrapper.vm.onBindExternalProvider();
            await nextTick();

            expect( wrapper.vm.isFormBlocked ).toBe( true );
        } );
    } );

    describe( 'при вызове onHasBindExternalProviderResult', () => {

        it( 'должен эмиттить событие externalProviderBindingErrorEvent и разблокировать форму',
            async () => {
                const mockedDTO = {
                    provider : 'exampleProvider',
                };
                const mockedSucceedTransitionName = 'mockedSucceedTransitionName';

                await wrapper.vm.onHasBindExternalProviderResult(
                    mockedDTO, mockedSucceedTransitionName, new Error('Mocked error')
                );
                await nextTick();

                expect( getLastEmittedEvent( wrapper.emitted()['external-provider-binding-error'] ) ).toBeTruthy();
                expect( wrapper.vm.isFormBlocked ).toBe( false );
            } );

        it( 'должен эмиттить событие externalProviderBindingSuccessEvent и разблокировать форму',
            async () => {
                await wrapper.vm.onHasBindExternalProviderResult();
                await nextTick();

                expect( getLastEmittedEvent( wrapper.emitted()['external-provider-binding-success'] ) ).toBeTruthy();
                expect( wrapper.vm.isFormBlocked ).toBe( false );
            } );
    } );

    describe( 'при вызове blockForm', () => {

        it( 'isFormBlocked = true', async () => {
            wrapper.setData( { isFormBlocked: false } );
            await wrapper.vm.blockForm();
            await nextTick();

            expect( wrapper.vm.isFormBlocked ).toBe( true );
        } );
    } );

    describe( 'при вызове unblockForm', () => {

        it( 'isFormBlocked = false', async () => {
            wrapper.setData( { isFormBlocked: true } );
            await wrapper.vm.unblockForm();
            await nextTick();

            expect( wrapper.vm.isFormBlocked ).toBe( false );
        } );
    } );

    describe( 'при вызове authenticate', () => {

        it( 'должен вызывать и исполнять команду авторизации', async () => {
            await wrapper.vm.authenticate();

            expect( commands.getCommand ).toBeCalledWith('Authenticate');
            expect( execFunction ).toBeCalled();
        } );
    } );

    describe( 'при вызове setUserAlreadyExists', () => {

        it( 'должен переключиться на вкладку аутентификации и поставить флаг isUserAlreadyExists в true', () => {
            wrapper.setData( { isUserAlreadyExists: false } );
            wrapper.vm.setUserAlreadyExists();

            expect( wrapper.vm.selectedTab ).toEqual( wrapper.vm.tabs[1] );
            expect( wrapper.vm.isUserAlreadyExists ).toBe( true );
        } );
    } );

    describe( 'при вызове onSubmitAuthentication', () => {

        it( 'должен переключить флаг isUserAlreadyExists в false', () => {
            wrapper.setData( { isUserAlreadyExists: true } );
            wrapper.vm.onSubmitAuthentication();

            expect( wrapper.vm.isUserAlreadyExists ).toBe( false );
        } );
    } );

    describe( 'при вызове showStoredExternalLoginForm', () => {

        it( 'должен переключить флаг isLoggedInWithExternalProvider в true', () => {
            wrapper.setData( { isLoggedInWithExternalProvider: false } );
            wrapper.vm.showStoredExternalLoginForm();

            expect( wrapper.vm.isLoggedInWithExternalProvider ).toBe( true );
        } );
    } );

    describe( 'при вызове showAuthenticationForm', () => {

        it( 'должен переключить флаг isLoggedInWithExternalProvider в false', () => {
            wrapper.setData( { isLoggedInWithExternalProvider: true } );
            wrapper.vm.showAuthenticationForm();

            expect( wrapper.vm.isLoggedInWithExternalProvider ).toBe( false );
        } );
    } );

    describe( 'при вызове onNeedSmsConfirmation', () => {

        it( 'должен переводить флаг isNeedSmsConfirm в true', () => {
            wrapper.vm.onNeedSmsConfirmation();

            expect( wrapper.vm.smsConfirm.isNeeded ).toBe( true );

        } );

        it( 'должен записывать в состояние время для повторной отправки смс', () => {
            const expectationResult = 299;

            wrapper.vm.onNeedSmsConfirmation( expectationResult );

            expect( wrapper.vm.smsConfirm.timeBeforeSmsResend ).toBe( expectationResult );
        } );
    } );

    describe( 'при вызове onAnalyticsEvent', () => {

        it( 'должен эмитить событие для аналитики', () => {
            wrapper.vm.onAnalyticsEvent('analytics_event_example');

            expect( getLastEmittedEvent( wrapper.emitted()['analytics-event'] ) ).toBeTruthy();
        } );
    } );

    describe( 'при вызове onInvalidAuthenticationData', () => {

        it( 'должен эмитить событие для аналитики', () => {
            wrapper.vm.onInvalidAuthenticationData( new Error() );

            expect( getLastEmittedEvent( wrapper.emitted()['analytics-event'] ) ).toBeTruthy();
        } );
    } );

    describe( 'при вызове onInvalidRegistrationData', () => {

        it( 'должен эмитить событие для аналитики', () => {
            wrapper.vm.onInvalidRegistrationData( new Error() );

            expect( getLastEmittedEvent( wrapper.emitted()['analytics-event'] ) ).toBeTruthy();
        } );
    } );

    it( 'при флаге canAuthenticateByToken должен вызываться authenticate', async () => {
        wrapper.setData( { userCredentials: { canAuthenticateByToken: true } } );

        await nextTick();

        expect( authenticateSpy ).toBeCalled();
    } );

    describe( 'externalLoginHintText computed', () => {

        it( 'должен показывать верную надпись над списком соцсетей', () => {
            wrapper.setData( { selectedTab: { value: 2 } } );
            expect( wrapper.vm.externalLoginHintText ).toBe('externalLoginHintText');

            wrapper.setData( { selectedTab: { value: 1 } } );
            expect( wrapper.vm.externalLoginHintText ).toBe('externalRegistrationHintText');

            wrapper.setData( { selectedTab: { value: undefined } } );
            expect( wrapper.vm.externalLoginHintText ).toBe('');
        } );
    } );
} );
