"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dot = __importStar(require("dot"));
const path = __importStar(require("path"));
dot.templateSettings.strip = false;
dot.process({ path: path.resolve(__dirname, "./templates") });
