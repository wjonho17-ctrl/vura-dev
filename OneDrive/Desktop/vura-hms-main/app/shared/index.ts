
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[!-~]{8,}$/


export const PASSWORD_VALIDATION_MESSAGES = {
    'password.regex': 'Password must be at least 8 characters long and include at least one letter and one number.',
    'password.minLength': 'Password must be at least 8 characters long.',
    'password.confirmed': 'Password confirmation does not match.'
}

export const PHONE_REGEX = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/

export const PHONE_VALIDATION_MESSAGES = {
    'phone.regex': 'Phone number must be a valid format. Example: (+250)7(8|9)6590143',
    'phone.minLength': 'Phone number must be at least 10 digits.'
}