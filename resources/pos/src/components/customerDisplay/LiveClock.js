import React, { useEffect, useState } from 'react';
import moment from 'moment';

const LiveClock = () => {
    const [now, setNow] = useState(moment());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(moment());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return <span>{now.format('MMMM Do YYYY, h:mm:ss A')}</span>;
};

export default LiveClock;
