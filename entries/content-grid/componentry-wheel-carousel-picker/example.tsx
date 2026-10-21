// Wheel picker: items on a curved dial that fades toward the edges, the chosen one level and bright, its image crossfading in.
// Clean-room rebuild of the pattern in this entry, keeping what Componentry gets right: a real listbox with
// aria-activedescendant, arrow keys, Home/End, and no motion when the user asks for reduced motion.
import { useId, useRef, useState } from "react";

// ---- Placeholder content: swap for real items and image URLs -------------------------------------
const LABEL = "Projects";
const ITEMS = [
  "Bramble Cottage", "Vellum Library", "Halden Bridge", "Ember & Ash", "Slate Meridian", "Halcyon Fields",
  "Meridian House", "Norlight Pavilion", "Aperture Studio", "Solene Tower", "Verdant Mile",
].map((title, i) => ({ id: `p${i}`, title, image: `https://picsum.photos/seed/wheel${i}/480/640` }));
const STEP_DEG = 11; // angle between neighbouring labels
const VISIBLE = 6; // labels shown on each side of the active one
// ------------------------------------------------------------------------------------------------

export default function WheelPicker() {
  const id = useId();
  const [active, setActive] = useState(5);
  const wheelLock = useRef(0);
  const move = (to: number) => setActive(Math.max(0, Math.min(ITEMS.length - 1, to)));

  function onKeyDown(e: React.KeyboardEvent) {
    const next = { ArrowDown: active + 1, ArrowRight: active + 1, ArrowUp: active - 1, ArrowLeft: active - 1, Home: 0, End: ITEMS.length - 1 }[e.key];
    if (next !== undefined) { e.preventDefault(); move(next); }
  }
  function onWheel(e: React.WheelEvent) {
    const now = Date.now();
    if (now - wheelLock.current < 120 || Math.abs(e.deltaY) < 4) return; // one step per flick
    wheelLock.current = now;
    move(active + Math.sign(e.deltaY));
  }

  return (
    <section className="grid w-full max-w-4xl grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-6 overflow-hidden rounded-xl bg-zinc-950 p-6 text-zinc-100">
      {/* Image for the active item: stacked images, only the active one visible */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-zinc-900">
        {ITEMS.map((item, i) => (
          <img
            key={item.id}
            src={item.image}
            alt={i === active ? item.title : ""}
            aria-hidden={i !== active}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-500 motion-reduce:transition-none ${i === active ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>

      {/* Fade the ends of the arc instead of clipping them */}
      <div className="relative h-[28rem] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]">
        <span id={`${id}-label`} className="sr-only">{LABEL}. Use the arrow keys to choose.</span>
        <ul
          role="listbox"
          tabIndex={0}
          aria-labelledby={`${id}-label`}
          aria-activedescendant={`${id}-${ITEMS[active].id}`}
          onKeyDown={onKeyDown}
          onWheel={onWheel}
          className="absolute inset-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {ITEMS.map((item, i) => {
            const k = i - active;
            const hidden = Math.abs(k) > VISIBLE;
            return (
              <li
                key={item.id}
                id={`${id}-${item.id}`}
                role="option"
                aria-selected={k === 0}
                onClick={() => move(i)}
                className={`absolute -left-56 top-1/2 flex origin-left cursor-pointer items-center gap-3 whitespace-nowrap text-lg transition-[transform,opacity] duration-500 ease-out motion-reduce:transition-none ${k === 0 ? "font-medium text-white" : "text-zinc-400"} ${hidden ? "pointer-events-none" : ""}`}
                style={{
                  // Rotate around a pivot 14rem left of the list, then push out 16rem along the radius: labels sit on an arc.
                  transform: `translateY(-50%) rotate(${k * STEP_DEG}deg) translateX(16rem)`,
                  opacity: hidden ? 0 : 1 - Math.abs(k) * 0.14,
                }}
              >
                <span className={`size-2.5 rounded-full ${k === 0 ? "bg-indigo-500" : "bg-transparent"}`} aria-hidden="true" />
                {item.title}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
