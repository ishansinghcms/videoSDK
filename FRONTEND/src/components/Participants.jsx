import Participant from './Participant.jsx';
import styles from './participants.module.css';
import clipboard from '../assets/clipboard.svg';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Participants = () => {
  const { sessionId } = useParams();
  const [isOn, setIsOn] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState({});

  const handleToggle = () => {
    setIsOn(!isOn);
  };

  const formatDate = useCallback((isoDate) => {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  });

  const divideTimeRange = useCallback((start, end, parts) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const duration = endTime - startTime;
    const interval = duration / parts;
    const timePoints = [];
    for (let i = 0; i <= parts; i++) {
      const time = new Date(startTime.getTime() + i * interval);
      timePoints.push(time.toISOString());
    }
    return timePoints;
  });

  useEffect(() => {
    axios
      .get(`http://localhost:3000/sessions/${sessionId}`)
      .then((response) => {
        const timePoints = divideTimeRange(
          response.data.start,
          response.data.end,
          12
        );
        const formattedPoints = timePoints.map((time) =>
          new Date(time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
          })
        );
        setTimeline(formattedPoints);
        setParticipants(response.data.participantArray);
        setMeetingDate(formatDate(response.data.start));
        setMeetingTime({ start: response.data.start, end: response.data.end });
      });
  }, []);
  return (
    <div className={styles.table}>
      <div className={styles.header}>
        <div className={styles.header_left}>
          <img src={clipboard} alt="" />
          <span>Participants wise Session Timeline</span>
        </div>
        <div className={styles.header_right}>
          <span>Show participant timeline</span>
          <div className={styles.toggleContainer}>
            <div
              className={`${styles.switch} ${isOn ? styles.on : styles.off}`}
              onClick={handleToggle}
            >
              <div className={styles.slider}></div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.timeline}>
        {timeline.map((time, index) => (
          <span key={index}>{time}</span>
        ))}
      </div>
      <div className={styles.participants}>
        {participants.map((p, index) => (
          <Participant
            key={index}
            name={p.name}
            events={p.events}
            timelog={p.timelog}
            meetingDate={meetingDate}
            meetingTime={meetingTime}
          />
        ))}
      </div>
    </div>
  );
};

export default Participants;
