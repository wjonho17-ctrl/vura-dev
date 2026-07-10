
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/

export const PASSWORD_VALIDATION_MESSAGES = {
    'password.regex': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    'password.minLength': 'Password must be at least 8 characters long.',
    'password.confirmed': 'Password confirmation does not match.'
}

export const RWANDA_PHONE_REGEX = /^(\+2507(2|3|8|9)[0-9]{7})$/

export const PHONE_VALIDATION_MESSAGES = {
    'phone.regex': 'Phone number must be a valid format. Example: (+250)786590143',
    'phone.minLength': 'Phone number must be at least 10 digits.',
    'phoneNumber.regex': 'Phone number must be a valid format. Example: (+250)786590143',
    'phoneNumber.minLength': 'Phone number must be at least 10 digits.'
}