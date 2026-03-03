"use client";
import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { FaInfoCircle } from "react-icons/fa";
interface InfoTooltipProps {
  information: string;
}
const InfoTooltip: React.FC<InfoTooltipProps> = ({ information }) => {
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
        className="text-gray-500 hover:text-gray-700 focus:outline-none ml-1"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={toggleVisibility}
        aria-label="Show information"
        type="button"
      >
        <FaInfoCircle size={14} />
      </button>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-10 w-64 p-3 mt-2 bg-white rounded shadow-lg border border-gray-300 left-8 top-full md:left-12 md:-top-16 md:right-0"
        >
          <div className="flex justify-between items-start mb-1">
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
          <p className=" text-sm text-gray-600">{information}</p>
        </div>
      )}
    </div>
  );
};
export default InfoTooltip;
