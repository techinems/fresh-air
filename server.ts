import "https://deno.land/x/dotenv@v2.0.0/load.ts";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { App as SlackApp  } from "https://deno.land/x/slack_bolt@1.0.0/mod.ts";
import * as util from "./utilities.ts"
import * as messageFactory from "./message.ts"

const SLACK_TOKEN = Deno.env.get("SLACK_BOT_TOKEN")
const DISPATCH_CHANNEL = Deno.env.get("DISPATCH_CHANNEL")
const RESPONDING_CHANNEL = Deno.env.get("RESPONDING_CHANNEL")

const slackApp = new SlackApp({
    signingSecret: Deno.env.get("SLACK_SIGNING_SECRET"),
    token: SLACK_TOKEN,
    ignoreSelf:true,
    });

const app = new Application();

const router = new Router();

router.post("/dispatch", async (ctx) => {
    let dateTime = util.makeDate();
    let dispatchBlock = messageFactory.generateDispatchMessage(dateTime);
    let slackMessage = {token: SLACK_TOKEN, blocks: dispatchBlock, text: "RPI Ambulance Dispatched on " + util.makeDate()};

    let respondingAttachment;
    let dispatchAttachment;

    let crewNeeded = await util.crewNeeded();

    if(typeof crewNeeded == "boolean" && !crewNeeded)
        respondingAttachment = dispatchAttachment = messageFactory.dutyCrewAttachment;
    else if(typeof crewNeeded == "boolean" && crewNeeded) {
        let toneTest = util.toneTest();
        let text = toneTest ? "Likely to be the weekly pager test." : "A crew is needed";
        respondingAttachment = messageFactory.generateRespondingAttachment(text, toneTest ? messageFactory.Color.warning : messageFactory.Color.danger, toneTest, true)
        dispatchAttachment = toneTest ? messageFactory.generateRespondingAttachment(text, toneTest ? messageFactory.Color.warning : messageFactory.Color.danger, toneTest, false) : dispatchAttachment;
    }
    else
        respondingAttachment = messageFactory.generateRespondingAttachment(crewNeeded, messageFactory.Color.danger, false, true);

    let dispatchResult = await slackApp.client.chat.postMessage({...slackMessage,
                                                                   channel: DISPATCH_CHANNEL,
                                                                   attachments: dispatchAttachment});

    let respondingResult = await slackApp.client.chat.postMessage({...slackMessage, 
                                                               channel: RESPONDING_CHANNEL,  
                                                               attachments: respondingAttachment,});
    ctx.response.body = "Dispatched\n";
});

router.post("/long-tone", async (ctx) => {
    let dateTime = util.makeDate();
    let longtoneMessage = messageFactory.generateLongtoneMessage(dateTime);

    let attachment = util.longtoneTest() ? messageFactory.generateLongtoneTestAttachment("Likely to be the weekly all-call test.") : "";

    let slackMessage = {token: SLACK_TOKEN, 
                         blocks: longtoneMessage,
                         attachments: attachment,
                         text: "Rensslaer County longtone on " + util.makeDate()};

    let dispatchResult = await slackApp.client.chat.postMessage({...slackMessage, channel: DISPATCH_CHANNEL});

    let respondingResult = await slackApp.client.chat.postMessage({...slackMessage, channel: RESPONDING_CHANNEL});
    ctx.response.body = "Long Tone\n";
});

router.post("/slack-response", async (ctx) => {
    const reqBody = await ctx.request.body().value;
    const payload = JSON.parse(reqBody.get("payload"));

    let userID = payload.user.id;
    let userInfo = await slackApp.client.users.info({token: SLACK_TOKEN, user:userID});
    let firstName = userInfo.user.profile.first_name;
    let lastName = userInfo.user.profile.last_name;

    const maxResponseTime = Deno.env.get("RESPONSE_MINUTES") * 60 * 1000;
    const dispatchTime = new Date(payload.message.ts * 1000);
    const responseTime = new Date(payload.actions[0].action_ts * 1000)

    let statusMessage = {token: SLACK_TOKEN, 
                          channel: RESPONDING_CHANNEL};

    let actionID = payload.actions[0].action_id;
    if(responseTime - dispatchTime > maxResponseTime){
        statusMessage.user = userID;
        statusMessage.text = "Your response was logged too long after the dispatch was recieved.";
    }
    else if(actionID == "responding"){
        statusMessage.attachments = messageFactory.generateResponderStatus(firstName, lastName, true)
    }
    else if(actionID == "not_responding"){
        statusMessage.attachments = messageFactory.generateResponderStatus(firstName, lastName, false)
    }

    let statusResult;
    if(responseTime - dispatchTime > maxResponseTime)
        statusResult = await slackApp.client.chat.Ephemeral(statusMessage);
    else 
        statusResult = await slackApp.client.chat.postMessage(statusMessage);
});

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("listen", () => {
  console.log(`AmIResponding is listening on port ${Deno.env.get("PORT")}`);
});

await app.listen({ port: Deno.env.get("PORT")});