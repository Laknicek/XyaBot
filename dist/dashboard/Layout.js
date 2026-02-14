"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Layout = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_2 = __importDefault(require("@tsparticles/react"));
const Sidebar_1 = require("./components/Sidebar");
const Layout = ({ children }) => {
    const options = (0, react_1.useMemo)(() => ({
        background: {
            color: {
                value: "#0a0515",
            },
        },
        fpsLimit: 120,
        interactivity: {
            events: {
                onHover: {
                    enable: true,
                    mode: "repulse",
                },
            },
            modes: {
                repulse: {
                    distance: 80,
                    duration: 0.4,
                },
            },
        },
        particles: {
            color: {
                value: ["#FF69B4", "#8A2BE2", "#00FFFF", "#FFD700"],
            },
            links: {
                enable: false,
            },
            move: {
                direction: "none",
                enable: true,
                outModes: {
                    default: "bounce",
                },
                random: true,
                speed: 0.8,
                straight: false,
            },
            number: {
                density: {
                    enable: true,
                },
                value: 40,
            },
            opacity: {
                value: { min: 0.1, max: 0.4 },
                animation: {
                    enable: true,
                    speed: 0.5,
                    sync: false,
                }
            },
            shape: {
                type: ["circle"],
            },
            size: {
                value: { min: 1, max: 4 },
            },
        },
        detectRetina: true,
    }), []);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dashboard-layout", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-pattern" }), (0, jsx_runtime_1.jsx)("div", { className: "bg-noise" }), (0, jsx_runtime_1.jsx)(react_2.default, { id: "tsparticles", options: options, style: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.5 } }), (0, jsx_runtime_1.jsx)(Sidebar_1.Sidebar, {}), (0, jsx_runtime_1.jsx)("main", { style: {
                    position: 'relative',
                    zIndex: 1,
                    padding: '30px 40px',
                    minHeight: '100vh',
                    width: '100%',
                    overflowX: 'hidden'
                }, children: children })] }));
};
exports.Layout = Layout;
