import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { spawn } from "child_process"
import { Actions, MessageObject } from "../types";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

import * as fs from "fs"



const PORT = Number(process.env.PORT) || 3001;

const server = createServer();

const wss = new WebSocketServer({
    server,
})



function send(s: WebSocket, id: string, action: Actions, details: Object) {
    const obj: MessageObject = {
        id,
        action,
        details
    }

    s.send(JSON.stringify(obj));
}

wss.on("connection", (s) => {
    s.on("error", console.error);


    s.on("message", async (data) => {
        const d: MessageObject = JSON.parse(data.toString());

        switch (d.action) {
            case Actions.OPEN_FILE: {

                var p = "";
                var child = spawn("python", ["dialog.py"]);
                child.stdout.on("data", (data) => {
                    p += data;

                })

                child.on("exit", () => {
                    fs.readFile(p.replace("\r", "").replace("\n", ""), async (err, data) => {
                        if (err) {
                            alert("Check console for error")
                            console.error(err);
                            send(s, "", Actions.OPENED_FILE, { content: "", status: "error" });
                        } else {
                            const d = Buffer.from(data).toString();
                            const fd = await db.file.findFirst({
                                where: {
                                    filepath: p.replace("\r", "").replace("\n", "")
                                }
                            });


                            const f = fd ? fd : await db.file.create({
                                data: {
                                    content: d,
                                    filepath: p.replace("\r", "").replace("\n", ""),
                                }
                            })
                            send(s, f.id, Actions.OPENED_FILE, { id: f.id, content: d, status: "" });

                        }
                    })
                })
                child.stdin.end();
                break;
            }
            case Actions.WRITE_FILE: {
                const content = d.details.content;
                const id = d.id;

                await db.file.update({
                    where: {
                        id
                    },
                    data: {
                        content
                    }
                })
                break;
            }

            case Actions.SYNC_FILE: {
                const id = d.id;
                const f = await db.file.findUnique({ where: { id } })
                if (!f) {
                    send(s, id, Actions.ERROR, { message: "File does not exist on the Database" });
                } else {

                    fs.writeFile(f.filepath, f.content, (err) => {
                        if (err) {
                            send(s, id, Actions.ERROR, { message: err.message });
                            return;
                        }

                        send(s, id, Actions.SUCCESS, { message: "File synced successfly" });
                    });
                }
            }
            default: { }
        }
    })
})


server.listen(PORT, () => {
    console.log("WebSocket Server listening on port %d", PORT);

})