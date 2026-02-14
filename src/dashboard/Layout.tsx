import React, { useMemo } from 'react';
import Particles from "@tsparticles/react";
import { type ISourceOptions } from "@tsparticles/engine";
import { Sidebar } from './components/Sidebar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const options: ISourceOptions = useMemo(
        () => ({
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
        }),
        [],
    );

    return (
        <div className="dashboard-layout">
            <div className="bg-pattern" />
            <div className="bg-noise" />
            <Particles
                id="tsparticles"
                options={options}
                style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.5 }}
            />
            <Sidebar />
            <main style={{
                position: 'relative',
                zIndex: 1,
                padding: '30px 40px',
                minHeight: '100vh',
                width: '100%',
                overflowX: 'hidden'
            }}>
                {children}
            </main>
        </div>
    );
};
