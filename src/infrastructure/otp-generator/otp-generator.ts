import otpGeneratorPackage from 'otp-generator';

export const generateOTP = (length: number = 6): string => {
    return otpGeneratorPackage.generate(length, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
    });
};