// Catalogue json:
// {
//   "catalogueData": [
//     {
//       "id": "headphones",
//       "label": "Headphones",
//       "sections": [
//         {
//           "title": "By Design",
//           "links": ["Open-Back", "Closed-Back"]
//         },
//         {
//           "title": "By Driver",
//           "links": ["Planar Magnetic", "Dynamic", "Electrostatic"]
//         },
//         {
//           "title": "In-Ear & Wireless",
//           "links": ["Monitors (IEMs)", "True Wireless (TWS)"]
//         }
//       ],
//       "feature": {
//         "description": "Technical wireframe of an open-back earcup showing the internal driver layers.",
//         "caption": "Pure Resonance"
//       }
//     },
//     {
//       "id": "audio-electronics",
//       "label": "Audio Electronics",
//       "sections": [
//         {
//           "title": "Amplification",
//           "links": ["Desktop Amps", "Portable Amps"]
//         },
//         {
//           "title": "Digital Sources",
//           "links": [
//             "Standalone DACs",
//             "DAC/Amp Combos",
//             "Digital Players (DAPs)",
//             "Network Streamers"
//           ]
//         }
//       ],
//       "feature": {
//         "description": "X-ray or top-down view of a PCB board or a glowing vacuum tube.",
//         "caption": "Signal Integrity"
//       }
//     },
//     {
//       "id": "accessories",
//       "label": "Accessories",
//       "sections": [
//         {
//           "title": "Connectivity",
//           "links": ["Headphone Cables", "Interconnects", "Adapters"]
//         },
//         {
//           "title": "Maintenance",
//           "links": ["Earpads", "Care & Cleaning"]
//         },
//         {
//           "title": "Storage",
//           "links": ["Headphone Stands", "Carrying Cases"]
//         }
//       ],
//       "feature": {
//         "description": "Close-up macro of a braided multi-core cable or leather texture.",
//         "caption": "The Final Detail"
//       }
//     }
//   ]
// }

// catalogue navbar is a separate component and only displays the visible navbar with hoverable three items
// core idea - catalogue menu is a separate component
// catalogue wrapper manages logic & state (the brain)
// this is catalogue wrapper only (this file) - it should be a simple wrapper that manages state and passes it down to the navbar and menu, it doesn't do any rendering itself, just acts as a container for the two components and manages their state
// the navbar is purely presentational and only responsible for rendering the three items and handling hover/focus states, it doesn't manage any state itself, it receives props from the wrapper to determine which item is active/hovered and renders accordingly
// the menu is also purely presentational and only responsible for rendering the dropdown content based on the active item, it receives props from the wrapper to determine which content to show based on the active item

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CatalogueWrapper({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="static" // Keep static to allow menu to go full-width
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="h-16 px-4 transition-colors hover:text-blue-600">
        {label}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            /* CSS Logic:
               - top-[64px]: matches your navbar height
               - h-[calc(100vh-64px)]: fits exactly between nav and bottom of viewport
            */
            className="absolute left-0 top-[64px] z-50 h-[calc(100vh-152px)] w-full border-t bg-white"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
