const express = require("express");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(cors());
const beforeRun = async () => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const assistant = await openai.beta.assistants.retrieve(process.env.ASSISTANT_ID);
  const thread = await openai.beta.threads.create();
  return {
    openai,
    assistant,
    thread
  };
};
(async () => {
  const { openai, assistant, thread } = await beforeRun();
  app.post("/ask", async (req, res) => {
    try {
      const question = req.body.question;
      await openai.beta.threads.messages.create(
        thread.id,
        {
          role: "user",
          content: question
        }
      );
      let finalRes = "";
      openai.beta.threads.runs.createAndStream(thread.id, {
        assistant_id: assistant.id
      })
        .on('textCreated', (text) => finalRes += '<span><strong>assistant:</strong></span><br>')
        .on('textDelta', (textDelta, snapshot) => finalRes += `<span>${textDelta.value}</span>`)
        .on('toolCallDelta', (toolCallDelta, snapshot) => {
          if (toolCallDelta.type === 'code_interpreter') {
            if (toolCallDelta.code_interpreter.input) {
              finalRes += `<span>${toolCallDelta.code_interpreter.input}</span>`;
            }
            if (toolCallDelta.code_interpreter.outputs) {
              finalRes += "<p>output:-</p>";
              toolCallDelta.code_interpreter.outputs.forEach(output => {
                if (output.type === "logs") {
                  finalRes += `<p>${output.logs}</p>`;
                }
              });
            }
          }
        }).on('end', () => {
          const htmlResponse = `<div>${finalRes}</div>`;
          res.status(200).send(htmlResponse);
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  });
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
})();
