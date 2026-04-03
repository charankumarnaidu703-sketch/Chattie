# Design System Document

## 1. Overview & Creative North Star: "The Organic Concierge"
This design system moves away from the utilitarian "SaaS dashboard" aesthetic and toward a high-end editorial experience. We are designing for a landscaping business—a sector defined by the intersection of nature (organic) and precision (professionalism). 

**The Creative North Star: The Organic Concierge.** 
The interface should feel like a premium concierge service: authoritative, quiet, and meticulously organized. We achieve this through "Atmospheric Depth"—using shifts in tone and light rather than harsh lines to define space. We avoid the "template look" by embracing generous white space, intentional asymmetry in data presentation, and high-contrast typography that mirrors a luxury architectural magazine.

---

### 2. Colors: Tonal Architecture
Color is used here as a functional map, not just decoration. We prioritize the "Green" of growth and the "Orange" of urgent action within a sophisticated neutral palette.

*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Structural boundaries must be defined solely by background color shifts. For instance, a `surface-container-low` section should sit against a `surface` background to create a "edge" through value change, not a line.
*   **Surface Hierarchy & Nesting:** Treat the UI as physical layers of fine paper. 
    *   **Level 0 (Base):** `surface` (#f8f9ff) for the main app background.
    *   **Level 1 (Sections):** `surface-container-low` (#eff4ff) to group content areas.
    *   **Level 2 (Active Cards):** `surface-container-lowest` (#ffffff) for individual lead cards or interactive elements.
*   **The "Glass & Gradient" Rule:** To provide "visual soul," primary CTAs (like "Start Conversation") should utilize a subtle linear gradient from `primary` (#006b2c) to `primary-container` (#00873a). Floating elements, such as the fixed bottom navigation, must use glassmorphism: a semi-transparent `surface-container-highest` with a `backdrop-blur` of 12px.

---

### 3. Typography: Editorial Authority
We use a dual-font strategy to balance character with utility. **Manrope** provides a modern, geometric warmth for data and headings, while **Inter** ensures high-performance readability for labels.

*   **Lead Statistics (Display-LG/MD):** Large numbers (e.g., "24 New Leads") must use `display-lg` (3.5rem) in Manrope Bold. This creates a focal point that feels like a magazine headline.
*   **Section Headings (Label-MD):** Use `label-md` (0.75rem) in Inter Bold, all-caps, with 0.05em letter spacing. This provides a "technical" contrast to the organic headline scale.
*   **Monospace Utility:** All phone numbers must be set in a monospace font (or Manrope with tabular figures) to ensure numerical alignment in lists, reinforcing the feeling of "landscaping precision."

---

### 4. Elevation & Depth: Tonal Layering
Traditional "drop shadows" are often clumsy. We use "Ambient Light" to define elevation.

*   **The Layering Principle:** Depth is achieved by stacking. A `surface-container-lowest` card placed on a `surface-container-low` background creates a natural lift.
*   **Ambient Shadows:** If a card requires a floating effect (e.g., a high-priority lead), use an extra-diffused shadow: `box-shadow: 0 12px 32px -4px rgba(11, 28, 48, 0.06)`. Note the tint—the shadow uses a low-opacity version of the `on-surface` color, not pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a container boundary, use a "Ghost Border": the `outline-variant` (#bdcaba) at 15% opacity. 100% opaque borders are forbidden.

---

### 5. Components: Precision Elements

#### Lead & Interaction Cards
*   **Structure:** No dividers. Separate content using `spacing-6` (2rem) of vertical white space or by nesting a `surface-container` within a larger card.
*   **Corner Radius:** Use `xl` (1.5rem / 24px) for the main containers to echo the organic nature of landscaping, and `md` (0.75rem / 12px) for internal elements like buttons or input fields.

#### Buttons & Action Chips
*   **Primary Button:** Gradient-filled (`primary` to `primary-container`), `xl` roundedness, with a subtle `primary-fixed-dim` outer glow on hover.
*   **Status Chips:** Use `secondary-container` for "Paused" (Orange) and `tertiary-container` for "Manual" (Blue). These must have a 0% background opacity and a 100% `outline` in their respective colors to feel "light" and modern.

#### Navigation: The Fixed Dock
*   **Style:** Positioned at the bottom, floating 1rem from the screen edges using `xl` rounding. 
*   **Material:** Glassmorphic `surface-container-highest` (80% opacity) with a 1px `outline-variant` (10% opacity) to catch the light.
*   **State:** The active tab uses the `surface-tint` color for the icon, while inactive tabs use `on-surface-variant`.

#### Input Fields
*   **Style:** Minimalist. No bottom line. Instead, use a `surface-container-highest` background with `sm` rounding.
*   **Focus State:** Transition the background to `primary-fixed` at 10% opacity and a 1px "Ghost Border" of `primary`.

---

### 6. Do's and Don'ts

*   **DO:** Use asymmetry. Place a large lead count on the left and a small "view all" link on the right with significant breathing room between them.
*   **DO:** Use `spacing-16` (5.5rem) as a standard top-of-page margin to let the editorial headers breathe.
*   **DON'T:** Use a divider line between WhatsApp messages in a list. Use a `spacing-3` (1rem) gap and a subtle background shift on hover/active states.
*   **DON'T:** Use "Grey" for shadows. Always tint shadows with the primary or surface-on-background color to maintain a premium, integrated feel.
*   **DO:** Ensure that the "Orange" warning color (#a73a00) is used sparingly. It is a "signal" color; if overused, the system loses its "Organic Concierge" calm.