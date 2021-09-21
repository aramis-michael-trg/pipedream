const { axios } = require("@pipedreamhq/platform");
const zoom = require("../../zoom.app");

module.exports = {
    key: "zoom-update-webinar",
    name: "Update webinar details",
    description: "Update the details of a webinar",
    type: "action",
    version: "0.0.1",
    props: {
        zoom,
        webinarId: {
            label: "WebinarId",
            type: "integer",
            description: "The webinar ID",
            optional: false,
            default: ""
            // @todo use and async options to pull webinarID 
        },
        occurrenceIds: {
            label: "Occurrence ids",
            type: "string",
            description: "Occurrence ID",
            optional: true,
            default: ""
            // @todo use and async options to pull occurrenceIds 
        },
        topic: {
            label: "Topic",
            type: "string",
            description: "Webinar topic.",
            optional: true,
            default: ""
        },
        type: {
            label: "Type",
            type: "integer",
            description: ` Webinar Types:
            5 - Webinar.
            6 - Recurring webinar with no fixed time.
            9 - Recurring webinar with a fixed time. `,
            options: [
              {
                  label: "5 - Webinar",
                  value: 5,
              },
              {
                  label: "6 - Recurring webinar with no fixed time",
                  value: 6,
              },
              {
                  label: "9 - Recurring webinar with a fixed time",
                  value: 9,
              }
            ],
            optional: true,
            default: ""
        },
        startTime: {
            label: "Start time",
            type: "string",
            description: "Webinar start time. We support two formats for  start_time  - local time and GMT.<br> \n\nTo set time as GMT the format should be  yyyy-MM-dd T HH:mm:ssZ .\n\nTo set time using a specific timezone, use  yyyy-MM-dd T HH:mm:ss  format and specify the timezone [ID](https://marketplace.zoom.us/docs/api-reference/other-references/abbreviation-lists#timezones) in the  timezone  field OR leave it blank and the timezone set on your Zoom account will be used. You can also set the time as UTC as the timezone field.\n\nThe  start_time  should only be used for scheduled and / or recurring webinars with fixed time.",
            optional: true,
            default: ""
        },
        duration: {
            label: "Duration",
            type: "integer",
            description: "Webinar duration (minutes). Used for scheduled webinar only.",
            optional: true,
            default: ""
        },
        timezone: {
            label: "Timezone",
            type: "string",
            description: "Time zone to format start_time. For example, \"America/Los_Angeles\". For scheduled meetings only. Please reference our [time zone](#timezones) list for supported time zones and their formats.",
            optional: true,
            default: ""
        },
        password: {
            label: "Password",
            type: "string",
            description: "Webinar passcode. Passcode may only contain the following characters: [a-z A-Z 0-9 @ - _ * !]. Max of 10 characters.\n\nIf \"Require a passcode when scheduling new meetings\" setting has been **enabled** **and** [locked](https://support.zoom.us/hc/en-us/articles/115005269866-Using-Tiered-Settings#locked) for the user, the passcode field will be autogenerated for the Webinar in the response even if it is not provided in the API request.",
            optional: true,
            default: ""
        },
        agenda: {
            label: "Agenda",
            type: "string",
            description: "Webinar description.",
            optional: true,
            default: ""
        },
        trackingFields: {
            label: "Tracking fields",
            type: "any",
            description: ` Tracking fields. JSON Example: 
            '[{"field": "Tracking fields type", "value": "Tracking fields value"}]'
            `,
            optional: true,
            default: ""
        },
        recurrence: {
            label: "Recurrence",
            type: "object",
            description: ` Recurrence object. Use this object only for a webinar of type 9 i.e., a recurring webinar with fixed time. url: https://marketplace.zoom.us/docs/api-reference/zoom-api/webinars/webinarcreate JSON Example: 
            {
              "type": "1-Daily/2-Weekly/3-Monthly",
              "repeat_interval": "Define the interval at which the webinar should recur. For instance, if you would like to schedule a Webinar that recurs every two months, you must set the value of this field as  2  and the value of the  type  parameter as  3",
              "weekly_days":"1-Sunday/2-Monday/3-Tuesday/4-Wednesday/5-Thursday/6-Friday/7-Saturday",
              "monthly_day": "The value range is from 1 to 31",
              "monthly_week": "-1-Last week/1-First week/2-Second week/3-Third week/4-Fourth week",
              "monthly_week_day": "1-Sunday/2-Monday/3-Tuesday/4-Wednesday/5-Thursday/6-Friday/7-Saturday",
              "end_times": "Select how many times the webinar will recur before it is canceled. (Cannot be used with \"end_date_time\".)",
              "end_date_time": "Select a date when the webinar will recur before it is canceled. Should be in UTC time, such as 2017-11-25T12:00:00Z. (Cannot be used with \"end_times\".)"
            }
            `,
            optional: true,
            default: ""
        },
        settings: {
            label: "Settings",
            type: "object",
            description: `Create Webinar settings. See documentation for more information: https://marketplace.zoom.us/docs/api-reference/zoom-api/webinars/webinarupdate `, 
            optional: true,
            default: ""
        }
    },
    async run() {
        // @todo: add action logic
    }
}