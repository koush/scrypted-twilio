import "core-js/modules/es6.promise";
import axios from 'axios';
import qs from 'qs';

const sid = scriptSettings.getString('sid');
const token = scriptSettings.getString('token');
const sender = scriptSettings.getString('sender');
const number = scriptSettings.getString('number');

if (sid == null) {
    throw new Error('No Account SID is configured. Enter a value for "sid" in the Script Settings.');
}

if (token == null) {
    throw new Error('No Auth Token is configured. Enter a value for "token" in the Script Settings.');
}

if (sender == null) {
    throw new Error('No Twilio phone number is configured. Enter a value for "sender" in the Script Settings.');
}

if (number == null) {
    throw new Error('No destination phone number is configured. Enter a value for "number" in the Script Settings.');
}

function VirtualDevice() {
}

// implementation of Notifier

VirtualDevice.prototype.sendNotification = function (arg0, arg1) {
    console.log('sendNotification was called!');
};

VirtualDevice.prototype.postTwilio = function (body) {
    return axios.post(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        qs.stringify(body),
        {
            headers: {
                'Content-type': 'application/x-www-form-urlencoded',
            },
            auth: {
                username: sid,
                password: token
            }
        })
        .then(() => {
            log.i('Message sent.');
        })
        .catch((e) => {
            log.e(`Failed to send message ${e}`);
        });
}

VirtualDevice.prototype.sendNotification = function (title, body, media, mimeType) {
    console.log('sendNotification (media) was called!');

    const postBody = {
        From: sender,
        Body: body,
        To: number,
    };

    if (!media) {
        return this.postTwilio(postBody);
    }

    // the mediaConvert variable is provided by Scrypted and can be used to convert
    // MediaObjects into other objects.
    // For example, a MediaObject from a RTSP camera can be converted to an externally
    // accessible Uri using this code.
    mediaConverter.convert(media, mimeType)
        .to('android.net.Uri', mimeType)
        .setCallback((e, result) => {
            if (result) {
                postBody['MediaUrl'] = result.toString();
            }

            this.postTwilio(postBody);
        });

    // for example, if you wanted to send the message body as a audio file,
    /// use this code instead.
    // under the hood, Android is using the text to speech engine to convert
    // the message body to an audio file, and then hosting the audio file
    // as an externally accessible Uri that Twilio can reach.

    // mediaConverter.convert(body, 'text/string')
    //     .to('android.net.Uri', 'audio/*')
    //     .setCallback((e, result) => {
    //         if (result) {
    //             postBody['MediaUrl'] = result.toString();
    //         }

    //         this.postTwilio(postBody);
    //     });
};


exports.result = new VirtualDevice();

