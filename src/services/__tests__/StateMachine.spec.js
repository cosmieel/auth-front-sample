import createStateMachine from '../StateMachine';

const stateMachine = createStateMachine();

const observeCb = jest.fn();

describe( 'экземпляр stateMachine', () => {
    beforeEach( () => {
        stateMachine.reset();
    } );

    it( 'должен вызывать колбек с нужными параметрами после подписки на событие перехода состояния', () => {
        stateMachine.subscribeOnce( 'onSubmitAuthentication', observeCb );
        stateMachine.submitAuthentication('payloadString');

        const expectedLifecycleObject = {
            event : 'onSubmitAuthentication',
            from  : 'credentialsInput',
            to    : 'authenticationDataSubmit',
        };

        expect( observeCb ).toHaveBeenCalledWith(
            expect.objectContaining( expectedLifecycleObject ),
            'payloadString'
        );
    } );

    it( 'должен корректно переключать состояния', () => {
        expect( stateMachine.state ).toEqual('credentialsInput');

        stateMachine.submitAuthentication();
        expect( stateMachine.state ).toEqual('authenticationDataSubmit');
        
        stateMachine.invalidAuthenticationData();
        expect( stateMachine.state ).toEqual('credentialsInput');
        
        stateMachine.submitAuthentication();
        stateMachine.getAuthenticationResult();
        expect( stateMachine.state ).toEqual('hasAuthenticationResult');
    } );

    describe( 'метод subscribeOnce', () => {
        const observeSpy = jest.spyOn( stateMachine, 'observe' );
        const eventName = 'onSubmitAuthentication';
        const subscriberMock = jest.fn();

        it( 'должен делать ранний return, если subscriber подписан на событие', () => {
            expect( observeSpy ).toHaveBeenCalledTimes( 0 );
            stateMachine.subscribeOnce( eventName, subscriberMock );
            expect( observeSpy ).toHaveBeenCalledTimes( 1 );
            stateMachine.subscribeOnce( eventName, subscriberMock );
            expect( observeSpy ).toHaveBeenCalledTimes( 1 );
        } );
    } );
} );
