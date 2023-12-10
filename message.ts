export enum Color {
    success = "#7dd296",
    warning = "#e6db64",
    danger = "#F35A00",
}

const respondingActions = {
    "type": "actions",
    "elements": [
        {
            "type": "button",
            "style": "primary",
            "text": {
                "type": "plain_text",
                "text": "YES",
                "emoji": true
            },
            "value": "YES",
            "action_id": "responding"
        },
        {
            "type": "button",
            "style": "danger",
            "text": {
                "type": "plain_text",
                "text": "NO",
                "emoji": true
            },
            "value": "NO",
            "action_id": "not_responding"
        }
    ]
};

export const dutyCrewAttachment = [
        {
            "color": Color.success,
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "Scheduled duty crew\n *No response is needed*"
                    }
                }
            ]
        }
    ]

export function generateDispatchMessage(formattedDateTime: string) {
    return [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "RPI Ambulance dispatched on " + formattedDateTime + " \n\n *TONES RECIEVED*\n_Stand by for further information_"
                }
            },
            {
                "type": "divider"
            }
        ]
}

export function generateLongtoneMessage(formattedDateTime: string) {
    return [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Rensslaer County longtone on " + formattedDateTime + " \n\n *LONGTONE (GROUP ALERT) RECIEVED*\n_Stand by for further information_"
                }
            },
            {
                "type": "divider"
            }
        ]
}

export function generateRespondingAttachment(message: string, color: Color, toneTest: boolean, responding: boolean) {
    let textField = message;
    if (toneTest) textField += "\nConfirm a possible call using other means.";
    if (responding) textField += "\n*Are you responding?*"
    let attachment = [
                {
                    "color": color,
                    "blocks": [
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": textField
                            }
                        }
                    ]
                }
            ];
    if (responding) attachment[0].blocks.push(respondingActions);
    return attachment;
}

export function generateLongtoneTestAttachment(message: string) {
    return [
            {
                "color": "#e6db64",
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": message + "\n*Confirm a possible message using other means.*"
                        }
                    }
                ]
            }
        ]
}

export function generateResponderStatus(firstName: string, lastName: string, status: boolean) {
    let attachment = [
                {
                    "blocks": [
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                            }
                        }
                    ]
                }
            ]
    if(status){
        attachment[0].color = Color.success;
        attachment[0].blocks[0].text.text = "*" + firstName.charAt(0) + ". " + lastName + "* is *RESPONDING*"
    }
    else
        attachment[0].blocks[0].text.text = firstName.charAt(0) + ". " + lastName + " is NOT RESPONDING"
}