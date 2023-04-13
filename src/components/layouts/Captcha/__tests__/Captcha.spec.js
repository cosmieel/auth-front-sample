import { shallowMount, config } from '@vue/test-utils';
import { nextTick } from 'vue';
import CaptchaComponent from '../Captcha.vue';
import VueRecaptcha from 'vue-recaptcha';

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

const commands = makeCommands();

config.provide.$commands = commands;

const createComponent = ( propsData ) => {
    return shallowMount( CaptchaComponent, {
        propsData : {
            ...propsData,
        },
        stubs : {
            'VueRecaptcha' : VueRecaptcha,
        },
    } );
};

const getLastEmittedEvent = ( events ) => {
    return events[ events.length - 1 ];
};

function captchaMock() {
    return {
        render : jest.fn( function( el, options ) {
            this._verify = options.callback;
            this._expired = options['expired-callback'];

            return 'widgetId';
        } ),
        reset : jest.fn(),
    };
}

const setCaptchaExpiredSpy = jest.spyOn( CaptchaComponent.methods, 'setCaptchaExpired' );
const setCaptchaResponseSpy = jest.spyOn( CaptchaComponent.methods, 'setCaptchaResponse' );

describe( 'Компонент Captcha', () => {
    beforeEach( () => {
        window.grecaptcha = captchaMock();
    } );

    describe( 'при вызове verify', () => {

        it( 'должен эмитить событие успешного подтверждения капчи', async () => {
            const wrapper = createComponent( {
                captchaSiteKey : 'exampleKey',
                captchaType    : 'Authentication',
            } );

            window.grecaptcha._verify();

            await nextTick();

            expect( setCaptchaResponseSpy ).toBeCalled();
            expect( getLastEmittedEvent( wrapper.emitted()['captcha-success'] ) ).toBeTruthy();
        } );
    } );

    describe( 'при вызове expired', () => {

        it( 'должен вызвать метод перезапуска истекшей капчи', () => {
            createComponent( {
                captchaSiteKey : 'exampleKey',
                captchaType    : 'Authentication',
            } );

            window.grecaptcha._expired();

            expect( setCaptchaExpiredSpy ).toBeCalled();
        } );
    } );
} );
