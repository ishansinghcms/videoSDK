import styles from './participant.module.css';
import arrow from '../assets/arrow.svg';
import joined from '../assets/joined.svg';
import leave from '../assets/leave.svg';
import errors from '../assets/errors.svg';
import mic from '../assets/mic.svg';
import screenShare from '../assets/screenShare.svg';
import webcam from '../assets/webcam.svg';

import { useCallback, useEffect, useState } from 'react';

export default function Participant({
  name,
  events,
  timelog,
  meetingDate,
  meetingTime,
}) {
  const [duration, setDuration] = useState(0);
  const [timestamps, setTimestamps] = useState([]);
  const [overlapIcons, setOverlapIcons] = useState([]);
  const [hoveredIcon, setHoveredIcon] = useState(null);

  const calculateDuration = useCallback((timelog) => {
    let totalDuration = 0;
    for (let i = 0; i < timelog.length; ++i) {
      totalDuration += Math.round(
        (new Date(timelog[i].end) - new Date(timelog[i].start)) / 60000
      );
    }
    return totalDuration;
  });

  const calculateOverlaps = (timestamps) => {
    if (timestamps.length === 0) return;
    const overlapGroups = [];
    let currentGroup = [];

    for (let i = 0; i < timestamps.length; i++) {
      if (timestamps[i].type !== 'active' && timestamps[i].type !== 'errors') {
        const currentIcon = timestamps[i];

        if (
          currentGroup.length === 0 ||
          currentIcon.startFraction <
            currentGroup[currentGroup.length - 1].startFraction +
              currentGroup[currentGroup.length - 1].widthFraction
        ) {
          currentGroup.push(currentIcon);
        } else {
          if (currentGroup.length > 0) {
            overlapGroups.push({
              startFraction: currentGroup[0].startFraction,
              count: currentGroup.length,
              items: currentGroup,
            });
          }
          currentGroup = [currentIcon];
        }

        if (i === timestamps.length - 1) {
          overlapGroups.push({
            startFraction: currentGroup[0].startFraction,
            count: currentGroup.length,
            items: currentGroup,
          });
        }
      }
    }
    setOverlapIcons(overlapGroups.filter((g) => g.count !== 1));
  };

  const calculateTimestamps = (timelog, events) => {
    const timestampsArray = [];
    for (let { start, end } of timelog) {
      timestampsArray.push({
        type: 'active',
        start,
        end,
      });
    }
    for (let key in events) {
      for (let event of events[key]) {
        if (key === 'errors')
          timestampsArray.push({
            type: key,
            start: event.start,
            message: event.message,
          });
        else
          timestampsArray.push({
            type: key,
            start: event.start,
            end: event.end,
          });
      }
    }

    timestampsArray.sort((a, b) => new Date(a.start) - new Date(b.start));

    const meetingDuration =
      new Date(meetingTime.end) - new Date(meetingTime.start);

    setTimestamps(
      timestampsArray.map((e) => ({
        type: e.type,
        start: e.start,
        end: e.end,
        widthFraction: (
          (new Date(e.end) - new Date(e.start)) /
          meetingDuration
        ).toFixed(2),
        startFraction: (
          (new Date(e.start) - new Date(meetingTime.start)) /
          meetingDuration
        ).toFixed(2),
        ...(e.type === 'errors' && { message: e.message }),
      }))
    );
  };

  useEffect(() => {
    setDuration(calculateDuration(timelog));
    calculateTimestamps(timelog, events);
  }, []);

  useEffect(() => {
    calculateOverlaps(timestamps);
  }, [timestamps]);

  const handleMouseEnter = (icon) => {
    setHoveredIcon(icon);
  };

  const handleMouseLeave = () => {
    setHoveredIcon(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.header_left}>
          <span className={styles.name}>{name}</span>
          <span className={styles.date_time}>
            <span className={styles.date}>{meetingDate}</span> |{' '}
            <span className={styles.duration}>Duration {duration} Mins</span>
          </span>
        </div>
        <span className={styles.details}>
          View details <img src={arrow} alt="" />
        </span>
      </div>

      <div className={styles.timeline}>
        {timestamps.map((timestamp, index) => {
          const iconProps = {
            className: styles.icon,
            style: {
              left: `${timestamp.startFraction * 100}%`,
            },
            onMouseEnter: () => handleMouseEnter(timestamp),
            onMouseLeave: handleMouseLeave,
          };

          if (timestamp.type === 'active') {
            return (
              <div key={index}>
                <p
                  style={{
                    width: `${timestamp.widthFraction * 100}%`,
                    left: `${timestamp.startFraction * 100}%`,
                  }}
                  className={styles.timestamp}
                ></p>
                <img
                  className={styles.icon}
                  style={{
                    left: `${
                      timestamp.startFraction * 100 +
                      timestamp.widthFraction * 100
                    }%`,
                  }}
                  src={leave}
                />
                <img
                  className={styles.icon}
                  style={{
                    left: `${timestamp.startFraction * 100}%`,
                  }}
                  src={joined}
                />
              </div>
            );
          } else if (timestamp.type === 'mic') {
            return <img key={index} {...iconProps} src={mic} />;
          } else if (timestamp.type === 'webcam') {
            return <img key={index} {...iconProps} src={webcam} />;
          } else if (timestamp.type === 'errors') {
            return (
              <img
                key={index}
                {...iconProps}
                className={styles.error}
                src={errors}
              />
            );
          } else if (timestamp.type === 'screenShare') {
            return <img key={index} {...iconProps} src={screenShare} />;
          }
        })}

        {overlapIcons.map((o, index) => (
          <p
            key={index}
            style={{
              left: `${o.startFraction * 100}%`,
            }}
            className={styles.customIcon}
            onMouseEnter={() => handleMouseEnter(o)}
            onMouseLeave={handleMouseLeave}
          >
            {o.count}
          </p>
        ))}

        {hoveredIcon && !hoveredIcon.items && hoveredIcon.type !== 'errors' && (
          <div
            className={styles.dialogBox}
            style={{
              left: `${hoveredIcon.startFraction * 100}%`,
            }}
          >
            <p>{`${hoveredIcon.type}: ${formatDate(
              hoveredIcon.start
            )} - ${formatDate(hoveredIcon.end)}`}</p>{' '}
          </div>
        )}

        {hoveredIcon && !hoveredIcon.items && hoveredIcon.type === 'errors' && (
          <div
            className={styles.dialogBox}
            style={{
              left: `${hoveredIcon.startFraction * 100}%`,
            }}
          >
            <p>{`${hoveredIcon.type}: ${formatDate(hoveredIcon.start)} - ${
              hoveredIcon.message
            }`}</p>
          </div>
        )}

        {hoveredIcon && hoveredIcon.items && (
          <div
            className={styles.dialogBox}
            style={{
              left: `${hoveredIcon.startFraction * 100}%`,
            }}
          >
            {hoveredIcon.items.map((icon, index) => (
              <p key={index}>
                {`${icon.type}: ${formatDate(icon.start)} - ${formatDate(
                  icon.end
                )}`}
                &nbsp;&nbsp;
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
