"use client";
import React, { useState, useRef, useEffect } from "react";
import { X, Info } from "@phosphor-icons/react";
interface InfoTooltipProps {
  information: string;
}
const InfoToolTip: React.FC<InfoTooltipProps> = ({ information }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  const hideTooltip = () => {
    setIsVisible(false);
  };
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    }
    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible]);
  return (
    <div className="relative inline-block">
      <button
        className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={toggleVisibility}
        aria-label="Show information"
        type="button"
      >
        <Info size={14} weight="fill" />
      </button>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute left-8 top-full z-10 mt-2 w-64 rounded border border-gray-300 bg-white p-3 shadow-lg md:-top-16 md:left-12 md:right-0"
        >
          <div className="mb-1 flex items-start justify-between">
            <span className="font-medium text-gray-700">Information</span>
            <button
              onClick={hideTooltip}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close information"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-sm text-gray-600">{information}</p>
        </div>
      )}
    </div>
  );
};
export default InfoToolTip;
