//Email



//Notifications



//OTP
export const GenerateOtp = () => {
    const otp = Math.floor(100000 + Math.random()*900000);
    let expiry = new Date();
    expiry.setTime( new Date().getTime() + (30*60*1000))

    return {otp, expiry};
}

export const onRequestOTP = async (otp:number, toPhoneNumber:string) => {

    const accountSid ="AC4edc5e1e482e06d89afea3e6b6b01aa3";
    const authToken = "ef24ad1d29d3c64993a42d08921092fa";
    const client = require('twilio')(accountSid, authToken);

    const response = await client.messages.create({
        body: `As OTP-n dghout gherge is ${otp}`,
        from: '+14134857783',
        to: `+961${toPhoneNumber}`
    })

    return response;
}


//Payment Notification or emails