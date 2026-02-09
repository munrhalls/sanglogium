"use client";
import { useEffect } from "react";
import { useState } from "react";
const TimeStamp = function ({ validUntil }: { validUntil: string }) {
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(validUntil);
      const lastDay = end;
      const total = lastDay.getTime() - now.getTime();
      if (total < 0) {
        setTimeLeft({ days: "00", hours: "00", minutes: "00" });
        return;
      }
      const days = String(Math.floor(total / (1000 * 60 * 60 * 24))).padStart(
        2,
        "0",
      );
      const hours = String(
        Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      ).padStart(2, "0");
      const minutes = String(
        Math.floor((total % (1000 * 60 * 60)) / (1000 * 60)),
      ).padStart(2, "0");
      setTimeLeft({ days, hours, minutes });
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [validUntil]);
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
  });
  return (
    <div className="h-full font-black text-xl">
      <div className="grid place-content-center md:place-content-start grid-cols-[3rem_3rem_3rem] gap-1 text-white">
        <div className="text-white col-start-1 col-span-3">Time left</div>
        <div className="text-start">
          <div>{timeLeft.days}:</div>
          <div className="text-sm">days</div>
        </div>
        <div className="text-start">
          <div>{timeLeft.hours}:</div>
          <div className="text-sm">hours</div>
        </div>
        <div className="text-start">
          <div>{timeLeft.minutes}</div>
          <div className="text-sm">minutes</div>
        </div>
      </div>
    </div>
  );
};
export default TimeStamp;
