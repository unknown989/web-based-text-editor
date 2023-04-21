"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var ws_1 = require("ws");
var http_1 = require("http");
var child_process_1 = require("child_process");
var types_1 = require("../types");
var client_1 = require("@prisma/client");
var db = new client_1.PrismaClient();
var fs = require("fs");
var PORT = Number(process.env.PORT) || 3001;
var server = (0, http_1.createServer)();
var wss = new ws_1.WebSocketServer({
    server: server
});
function send(s, id, action, details) {
    var obj = {
        id: id,
        action: action,
        details: details
    };
    s.send(JSON.stringify(obj));
}
wss.on("connection", function (s) {
    s.on("error", console.error);
    s.on("message", function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var d, _a, p, child, content, id, id_1, f;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    d = JSON.parse(data.toString());
                    _a = d.action;
                    switch (_a) {
                        case types_1.Actions.OPEN_FILE: return [3, 1];
                        case types_1.Actions.WRITE_FILE: return [3, 2];
                        case types_1.Actions.SYNC_FILE: return [3, 4];
                    }
                    return [3, 6];
                case 1:
                    {
                        p = "";
                        child = (0, child_process_1.spawn)("python", ["dialog.py"]);
                        child.stdout.on("data", function (data) {
                            p += data;
                        });
                        child.on("exit", function () {
                            fs.readFile(p.replace("\r", "").replace("\n", ""), function (err, data) { return __awaiter(void 0, void 0, void 0, function () {
                                var d_1, fd, f, _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            if (!err) return [3, 1];
                                            alert("Check console for error");
                                            console.error(err);
                                            send(s, "", types_1.Actions.OPENED_FILE, { content: "", status: "error" });
                                            return [3, 6];
                                        case 1:
                                            d_1 = Buffer.from(data).toString();
                                            return [4, db.file.findFirst({
                                                    where: {
                                                        filepath: p.replace("\r", "").replace("\n", "")
                                                    }
                                                })];
                                        case 2:
                                            fd = _b.sent();
                                            if (!fd) return [3, 3];
                                            _a = fd;
                                            return [3, 5];
                                        case 3: return [4, db.file.create({
                                                data: {
                                                    content: d_1,
                                                    filepath: p.replace("\r", "").replace("\n", "")
                                                }
                                            })];
                                        case 4:
                                            _a = _b.sent();
                                            _b.label = 5;
                                        case 5:
                                            f = _a;
                                            send(s, f.id, types_1.Actions.OPENED_FILE, { id: f.id, content: d_1, status: "" });
                                            _b.label = 6;
                                        case 6: return [2];
                                    }
                                });
                            }); });
                        });
                        child.stdin.end();
                        return [3, 7];
                    }
                    _b.label = 2;
                case 2:
                    content = d.details.content;
                    id = d.id;
                    return [4, db.file.update({
                            where: {
                                id: id
                            },
                            data: {
                                content: content
                            }
                        })];
                case 3:
                    _b.sent();
                    return [3, 7];
                case 4:
                    id_1 = d.id;
                    return [4, db.file.findUnique({ where: { id: id_1 } })];
                case 5:
                    f = _b.sent();
                    if (!f) {
                        send(s, id_1, types_1.Actions.ERROR, { message: "File does not exist on the Database" });
                    }
                    else {
                        fs.writeFile(f.filepath, f.content, function (err) {
                            if (err) {
                                send(s, id_1, types_1.Actions.ERROR, { message: err.message });
                                return;
                            }
                            send(s, id_1, types_1.Actions.SUCCESS, { message: "File synced successfly" });
                        });
                    }
                    _b.label = 6;
                case 6:
                    { }
                    _b.label = 7;
                case 7: return [2];
            }
        });
    }); });
});
server.listen(PORT, function () {
    console.log("WebSocket Server listening on port %d", PORT);
});
