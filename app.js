const express = require("express");
const app = express();
const cors = require("cors");

const accountSid = "";
const authToken = "";
const client = require("twilio")(accountSid, authToken);
const { AccessToken, VideoGrant } = require("twilio").jwt;

const twilioApiKey = "";
const twilioApiSecret = "";

app.use(cors());

async function generateTwilioToken(identity, roomName) {
  const accessToken = new AccessToken(
    accountSid,
    twilioApiKey,
    twilioApiSecret,
    { identity }
  );

  const grant = new AccessToken.VideoGrant();
  grant.room = roomName;
  accessToken.addGrant(grant);

  return accessToken.toJwt();
}

app.get("/joinRoom/:identity/:roomName", async (req, res) => {
  const roomName = req.params.roomName;
  const identity = req.params.identity;

  try {
    const token = await generateTwilioToken(identity, roomName);
    res.header("Access-Control-Allow-Origin", "*");
    res.json({ token });
  } catch (error) {
    console.error("Error joining room:", error.message);
    res.status(500).json({ error: "Could not join the room" });
  }
});

app.post("/api/createp2pRoom/:uniqueName", async (req, res) => {
  const uniqueName = req.params.uniqueName;

  try {
    const room = await client.video.v1.rooms.create({
      uniqueName: uniqueName,
      type: "peer-to-peer",
    });

    const meetingUrl = `http://your-website.com/meeting/${room.uniqueName}`;
    res.header("Access-Control-Allow-Origin", "*");
    res.json({ room, meetingUrl }); // Include the meeting URL in the response
  } catch (error) {
    console.error("Error creating room:", error.message);
    res.status(500).json({ error: "Could not create a p2p room" });
  }
});

app.post("/api/createGroupRecRoom", async (req, res) => {
  try {
    const room = await client.video.v1.rooms.create({
      uniqueName: "DailyStandup",
      recordParticipantsOnConnect: true,
      statusCallback: "http://example.org",
      type: "group",
    });
    res.json({ room });
  } catch (error) {
    console.error("Error creating room:", error.message);
    res.status(500).json({ error: "Could not create a group recording room" });
  }
});

app.listen(4001, () => {
  console.log("Server listening on port 4001");
});
