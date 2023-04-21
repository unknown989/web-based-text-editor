import './style.css'
import { Actions, MessageObject } from "../types";

const textarea = document.createElement("textarea");

const sync_button = document.createElement("button");
sync_button.innerText = "Sync File";


let filename_id = "";
let prev_content = "";
sync_button.onclick = () => {

  // Sync the file on the db to the filesystem
  send(filename_id, Actions.SYNC_FILE, {});
  prev_content = textarea.value;

}


setInterval(() => {
  if (prev_content !== textarea.value) {

    // Save the file every 10 seconds
    if (filename_id) {
      send(filename_id, Actions.SYNC_FILE, {});
    }
  }
  prev_content = textarea.value;
}, 10000)

function send(id: string, action: Actions, details: Object) {
  // Send a message to the server
  ws.send(JSON.stringify({ id, action, details }))
}

const open_button = document.createElement("button");
open_button.innerText = "Open File";


open_button.onclick = () => {
  // Trigger open file
  send("", Actions.OPEN_FILE, {});
}
const app = document.querySelector<HTMLDivElement>('#app')!

const ws = new WebSocket("ws://localhost:3001");

function logtodom(msg: string) {
  (document.getElementById("log") || { innerText: "" }).innerText = msg;
}

ws.addEventListener("error", console.error)

ws.addEventListener("open", () => { })

ws.addEventListener("message", async (data) => {
  const d: MessageObject = JSON.parse(data.data.toString());
  switch (d.action) {
    case Actions.OPENED_FILE: {

      const s = d.details.status;
      if (s === "error") {
        textarea.innerText = "Failed to open file";
      } else {
        filename_id = d.id;
        textarea.innerHTML = d.details.content;
        textarea.oninput = (e) => {
          // Write the new changes to the db on each change
          send(
            filename_id,
            Actions.WRITE_FILE,
            {
              // @ts-ignore
              content: e.target.value,
            }
          )
        }
      }
      app.removeChild(open_button)
      break;
    }
    case Actions.SUCCESS: {
      const m = d.details.message;
      logtodom(m);
      setTimeout(() => {
        logtodom("");
      }, 1500);
    }
  }
  app.appendChild(textarea);



})
app.appendChild(open_button);
app.appendChild(sync_button);
