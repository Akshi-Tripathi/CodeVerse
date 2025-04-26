import React, { useEffect, useState } from "react";
import "../styles/Clock.css";

const Clock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    const secondsDegrees = ((seconds / 60) * 360) ; 
    const minutesDegrees = ((minutes / 60) * 360 + (seconds / 60) * 6) ;
    const hoursDegrees = ((hours % 12) / 12 * 360 + (minutes / 60) * 30) ;

    return (
        <div className="clock-container">
            <div className="clock">
                {[...Array(12)].map((_, i) => (
                    <div 
                        key={i} 
                        className="number"
                        style={{
                            transform: `rotate(${i * 30}deg)`
                        }}
                    >
                        <span style={{ transform: `rotate(${-i * 30}deg)` }}>
                            {i === 0 ? '12' : i}
                        </span>
                    </div>
                ))}

                <div className="hands-container">
                    <div 
                        className="hand hour-hand"
                        style={{ transform: `rotate(${hoursDegrees}deg)` }}
                    />
                    <div 
                        className="hand minute-hand"
                        style={{ transform: `rotate(${minutesDegrees}deg)` }}
                    />
                    <div 
                        className="hand second-hand"
                        style={{ transform: `rotate(${secondsDegrees}deg)` }}
                    />
                    <div className="center-dot" />
                </div>
            </div>
            <div className="digital-time">
                {hours.toString().padStart(2, '0')}:
                {minutes.toString().padStart(2, '0')}:
                {seconds.toString().padStart(2, '0')}
            </div>
        </div>
    );
};

export default Clock;