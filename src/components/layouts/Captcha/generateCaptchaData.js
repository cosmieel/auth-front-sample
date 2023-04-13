export default function( value ) {
    return {
        siteKey     : value?.captcha?.siteKey,
        response    : value?.captcha?.response,
        isKeyExists : !!value?.captcha?.siteKey,
    };
}
