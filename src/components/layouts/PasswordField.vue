<template>
    <ds-field
        :state="passwordFieldState"
        :label="$t('passwordHint')"
        :hint="passwordFieldHint"
        class="auth-form__credential"
    >
        <template #default="slotProps">
            <UnfreezedAutoFilledInput
                :type="fieldType"
                :disabled="isDisabled"
                :state="slotProps.state"
                class="auth-form__password qa-auth-form-field-pass"
                maxlength="32"
                :value="value"
                @input="$emit('input', $event)"
            />
            <button
                type="button"
                class="auth-form__eye"
                @click="toggleFieldType"
            >
                <Eye :is-opened="isOpenEye" />
            </button>
        </template>
    </ds-field>
</template>

<script>
import { DsField } from '@regru/design-system';
import UnfreezedAutoFilledInput from './UnfreezedAutoFilledInput.vue';
import Eye from './Eye.vue';

import messages from './locales/messages';

export default {
    name : 'PasswordField',
    i18n : {
        messages,
    },
    components : {
        Eye,
        DsField,
        UnfreezedAutoFilledInput,
    },
    props : {
        value : {
            type     : [String, Number],
            required : true,
        },
        passwordFieldState : {
            type    : String,
            default : 'default',
        },
        passwordFieldHint : {
            type    : String,
            default : '',
        },
        isDisabled : {
            type    : Boolean,
            default : false,
        },
    },
    data() {
        return {
            fieldType : 'password',
        };
    },
    computed : {
        isOpenEye() {
            return this.fieldType !== 'password';
        },
    },
    methods : {
        toggleFieldType() {
            this.fieldType === 'password'
                ? this.fieldType = 'text'
                : this.fieldType = 'password';
        },
    },
};
</script>

<style lang="less" scoped>
button {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    background: none;
    border: 0;
    outline: 0;
    padding: 0;
    cursor: pointer;
}
.auth-form__credential {
    position: relative;
}
.auth-form__eye {
    position: absolute;
    top: 44px;
    right: 20px;
}
.auth-form__password {
    padding-right: 50px;
}
</style>
