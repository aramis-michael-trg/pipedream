# Real-World Twitter -> Slack

For the last example in this quickstart, we'll use many of the patterns you've learned so far to solve a real use case.

- Trigger a workflow anytime [`@pipedream`](https://twitter.com/pipedream) is mentioned on Twitter
- Use Node.js and npm to format a message using Slack Block Kit
- Use an action to post the message exported from our code step to Slack

Following is an example of a Tweet that we'll richly format and post to Slack:

![image-20210518194229746](./image-20210518194229746.png)

First, create a new workflow and select the **Twitter** app:

![image-20210518190544989](./image-20210518190544989.png)

Select **Search Mentions** to trigger your workflow every time a new Tweet matches your search criteria:

![image-20210518190657509](./image-20210518190657509.png)

Connect your Twitter account and then enter `@pipedream` for the search term. This will trigger your workflow when Pipedream's handle is mentioned on Twitter.

![image-20210518190942880](./image-20210518190942880.png)

To complete the trigger setup, add an optional name (e.g., `Pipedream Mentions`) and click **Create Source**:

![image-20210518191055978](./image-20210518191055978.png)

Use the drop down menu to select the event to help you build your workflow. Here we've selected a recent Tweet that includes an image (so we can incorporate that into our Slack message).

![image-20210518191509099](./image-20210518191509099.png)

Based on a review of the event, we want to include the following data in our Slack message:

- Tweet text
- Tweet Language
- Tweet Type (Original Tweet, Reply, Retweet)
- Tweet URL
- Image (if present in the Tweet)
- Tweet timestamp
- Screen name and profile picture of the user
- Metadata for the user (number of followers, location and description)
- Link to the workflow that generated the Slack message (so it's easy to get to if we need to make changes in the future)

Let's use Slack's Block Kit Builder to create a [JSON message template](https://app.slack.com/block-kit-builder/TD5JFTFRQ#%7B%22blocks%22:%5B%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22mrkdwn%22,%22text%22:%22*%3Chttps://TWEET_URL%7CNew%20mention%3E%20by%20%3Chttps://USER_PROFILE_URL%7CSCREEN_NAME%3E%20(TWEET_DATE_TIME):*%5Cn%3E%20TWEET%20CONTENT%5Cn%22%7D,%22accessory%22:%7B%22type%22:%22image%22,%22image_url%22:%22https://via.placeholder.com/100%22,%22alt_text%22:%22Profile%20picture%22%7D%7D,%7B%22type%22:%22image%22,%22image_url%22:%22https://via.placeholder.com/1000%22,%22alt_text%22:%22Tweet%20Image%22%7D,%7B%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22*User:*%20SCREEN_NAME%22%7D,%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Followers:*%20FOLLOWER_COUNT%22%7D,%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Location:*%20LOCATION%22%7D,%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Original%20Language:*%20LANGUAGE%20(LANGUAGE_CODE)%22%7D,%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Description:*%20USER_DESCRIPTION%22%7D%5D%7D,%7B%22type%22:%22actions%22,%22elements%22:%5B%7B%22type%22:%22button%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22View%20on%20Twitter%22,%22emoji%22:true%7D,%22url%22:%22https://twitter.com/TWEET_URL%22%7D%5D%7D,%7B%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22Sent%20via%20%3Chttps://pipedream.com/@/WORKFLOW_ID%7CPipedream%3E%22%7D%5D%7D,%7B%22type%22:%22divider%22%7D%5D%7D) that we can customize in a code step.  The action we will use accepts the array of blocks, so we'll extract that and export a populated array from our code step (i.e., we don't need to generate the entire JSON payload).

Add a step to **Run Node.js code** and name it `steps.generate_slack_blocks`. 

![image-20210518201050946](./image-20210518201050946.png)

Next, let's add the npm packages we need — we'll use the `iso-639-1`  package to convert the language code provided by Twitter into a human readable name, and we'll use `lodash` to help with value extraction.

```javascript
const ISO6391 = require('iso-639-1')
const _ = require('lodash') 
```

Next, let's define functions that we'll use. First, add a function to generate the language name or return `Unknown`:

```javascript
// Return a friendly language name for ISO language codes
function getLanguageName(isocode) {
  try { return ISO6391.getName(isocode) } 
	catch (err) { return 'Unknown' }
}
```

Next, let's add a function to format the number of followers for a user (we can reuse this function we found via Google search on [Stack Overflow](https://stackoverflow.com/questions/9461621/format-a-number-as-2-5k-if-a-thousand-or-more-otherwise-900)).

```javascript
// Format numbers over 1000
function kFormatter(num) {
    return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'k' : Math.sign(num)*Math.abs(num)
}
```

Next, let's format the Tweet text `steps.trigger.event.full_text` using Slack's quote formatting. Since Tweets can contain line breaks, we'll handing that as well:

```javascript
// Format the Tweet as a quoted Slack message
let quotedMessage = ''
steps.trigger.event.full_text.split('\n').forEach(line => quotedMessage = quotedMessage + '> ' + line + '\n' )

```

Next, let's extract some values to make our message generation easier:

```javascript
// Define metadata to include in the Slack message
const tweetUrl = `https://twitter.com/${steps.trigger.event.user.screen_name}/statuses/${steps.trigger.event.id_str}`
const userUrl = `https://twitter.com/${steps.trigger.event.user.screen_name}/`
const mediaUrl = _.get(steps, 'trigger.event.extended_entities.media[0].media_url_https', '')
const mediaType = _.get(steps, 'trigger.event.extended_entities.media[0].type', '')
```

Then, we'll start building the Slack Blocks:

```javascript
// Format the message as Slack blocks
// https://api.slack.com/block-kit
const blocks = []
blocks.push({
	"type": "section",
	"text": {
		"type": "mrkdwn",
		"text": `*<${tweetUrl}|New Mention> by <${userUrl}|${steps.trigger.event.user.screen_name}> (${steps.trigger.event.created_at}):*\n${quotedMessage}`
	},
		"accessory": {
			"type": "image",
			"image_url": steps.trigger.event.user.profile_image_url_https,
			"alt_text": "Profile picture"
		}
})
```

Next, if the Tweet contains a photo we'll add it to the message:

```javascript
if(mediaUrl !== '' && mediaType === 'photo') {
	blocks.push({
		"type": "image",
		"image_url": mediaUrl,
		"alt_text": "Tweet Image"
	})
}
```

Next, we'll populate the data in the message context elements...

```javascript
blocks.push({
	"type": "context",
	"elements": [
		{
			"type": "mrkdwn",
			"text": `*User:* ${steps.trigger.event.user.screen_name}`
		},
		{
			"type": "mrkdwn",
			"text": `*Followers:* ${kFormatter(steps.trigger.event.user.followers_count)}`
		},
		{
			"type": "mrkdwn",
			"text": `*Location:* ${steps.trigger.event.user.location}`
		},
		{
			"type": "mrkdwn",
			"text": `*Language:* ${getLanguageName(steps.trigger.event.lang)} (${steps.trigger.event.lang})`
		},
		{
			"type": "mrkdwn",
			"text": `*Description:* ${steps.trigger.event.user.description}`
		}
	]
},
```

...add the Tweet URL to the action button...

```javascript
{
	"type": "actions",
	"elements": [
		{
			"type": "button",
			"text": {
				"type": "plain_text",
				"text": "View on Twitter",
				"emoji": true
			},
			"url": tweetUrl
		}
	]
},
```

...and add the workflow ID by referencing `steps.trigger.context.workflow_id`:

```javascript
{
	"type": "context",
	"elements": [
		{
			"type": "mrkdwn",
			"text": `Sent via <https://pipedream.com/@/${steps.trigger.context.workflow_id}|Pipedream>`
		}
	]
},
{
	"type": "divider"
})
```

Finally, we'll return the array we assigned to `blocks`:

```javascript
return blocks
```

Here is the final, complete code:

```javascript
const ISO6391 = require('iso-639-1')
const _ = require('lodash') 

// Return a friendly language name for ISO language codes
function getLanguageName(isocode) {
  try { return ISO6391.getName(isocode) } 
	catch (err) { return 'Unknown' }
}

// Format numbers over 1000
function kFormatter(num) {
    return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'k' : Math.sign(num)*Math.abs(num)
}

// Format the Tweet as a quoted Slack message
let quotedMessage = ''
steps.trigger.event.full_text.split('\n').forEach(line => quotedMessage = quotedMessage + '> ' + line + '\n' )

// Define metadata to include in the Slack message
const tweetUrl = `https://twitter.com/${steps.trigger.event.user.screen_name}/statuses/${steps.trigger.event.id_str}`
const userUrl = `https://twitter.com/${steps.trigger.event.user.screen_name}/`
const mediaUrl = _.get(steps, 'trigger.event.extended_entities.media[0].media_url_https', '')
const mediaType = _.get(steps, 'trigger.event.extended_entities.media[0].type', '')

// Format the message as Slack blocks
// https://api.slack.com/block-kit
const blocks = []
blocks.push({
	"type": "section",
	"text": {
		"type": "mrkdwn",
		"text": `*<${tweetUrl}|New Mention> by <${userUrl}|${steps.trigger.event.user.screen_name}> (${steps.trigger.event.created_at}):*\n${quotedMessage}`
	},
		"accessory": {
			"type": "image",
			"image_url": steps.trigger.event.user.profile_image_url_https,
			"alt_text": "Profile picture"
		}
})

if(mediaUrl !== '' && mediaType === 'photo') {
	blocks.push({
		"type": "image",
		"image_url": mediaUrl,
		"alt_text": "Tweet Image"
	})
}

blocks.push({
	"type": "context",
	"elements": [
		{
			"type": "mrkdwn",
			"text": `*User:* ${steps.trigger.event.user.screen_name}`
		},
		{
			"type": "mrkdwn",
			"text": `*Followers:* ${kFormatter(steps.trigger.event.user.followers_count)}`
		},
		{
			"type": "mrkdwn",
			"text": `*Location:* ${steps.trigger.event.user.location}`
		},
		{
			"type": "mrkdwn",
			"text": `*Language:* ${getLanguageName(steps.trigger.event.lang)} (${steps.trigger.event.lang})`
		},
		{
			"type": "mrkdwn",
			"text": `*Description:* ${steps.trigger.event.user.description}`
		}
	]
},
{
	"type": "actions",
	"elements": [
		{
			"type": "button",
			"text": {
				"type": "plain_text",
				"text": "View on Twitter",
				"emoji": true
			},
			"url": tweetUrl
		}
	]
},
{
	"type": "context",
	"elements": [
		{
			"type": "mrkdwn",
			"text": `Sent via <https://pipedream.com/@/${steps.trigger.context.workflow_id}|Pipedream>`
		}
	]
},
{
	"type": "divider"
})

return blocks
```

**Deploy** your workflow and send a test event. It should execute successfully and `steps.generate_slack_blocks` should return an array of Slack Blocks with 6 elements:

![image-20210518203135105](./image-20210518203135105.png)

Next, click **+** to add a step and select the **Slack** app:

![image-20210518203240395](./image-20210518203240395.png)

Then, scroll or search to find the **Send Message Using Block Kit** action:

![image-20210518203402871](./image-20210518203402871.png)

Configure the step:

![image-20210518204014823](./image-20210518204014823.png)

Then **Deploy** and send a test event to your workflow.

![image-20210518204100063](./image-20210518204100063.png)

A formatted message should be posted to Slack:

![image-20210518204801812](./image-20210518204801812.png)

Finally, turn on your trigger to run it on every event emitted by the source:

![image-20210518210047896](./image-20210518210047896.png)

To test out your workflow, post a Tweet mentioning `@pipedream` — or [use our pre-written Tweet](https://twitter.com/intent/tweet?text=I%20just%20completed%20the%20%40pipedream%20quickstart%20https%3A%2F%2Fpipedream.com%2Fquickstart).

<img src="./image-20210518211005339.png" alt="image-20210518211005339" style="zoom:33%;" />

Your workflow will be triggered the next time your trigger runs (every 15 minutes by default, but you can manage your source and customize the interval from https://pipedream.com/sources/).