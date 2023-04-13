import { nextTick } from 'vue';
import PasswordFieldComponent from '../PasswordField.vue';
import { shallowMount } from '@vue/test-utils';

let wrapper;

const createComponent = ( propsConfig ) => {
    wrapper = shallowMount( PasswordFieldComponent, {
        propsData : propsConfig,
    } );
};

describe( PasswordFieldComponent.name, () => {
    afterEach( () => {
        wrapper.destroy();
    } );

    it( 'должен изменять тип поля password/text при нажатии на глаз', async () => {
        const propsConfig = { value: '' };

        createComponent( propsConfig );

        wrapper.find('.auth-form__eye').trigger('click');

        await nextTick();

        expect( wrapper.vm.fieldType ).toBe('text');

        wrapper.find('.auth-form__eye').trigger('click');

        await nextTick();

        expect( wrapper.vm.fieldType ).toBe('password');
    } );

} );