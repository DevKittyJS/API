function loadScreens() {
  const screens = document.querySelectorAll(".dk-ldscr");

  // Check if there are more than one loading screen, stop script if true
  if (screens.length > 1) {
    console.error(
      "Multiple loading screens detected. Please ensure only one is present."
    );
    return; // Stop the script execution
  }

  const styleSheetId = "DevKittyScreens";
  const overlayId = "loading-overlay";

  let styleSheet = document.getElementById(styleSheetId);
  if (!styleSheet) {
    styleSheet = document.createElement("style");
    styleSheet.id = styleSheetId;
    document.head.appendChild(styleSheet);
  }

  const addedStyles = new Set();
  const version = Date.now();

  let spinnerEl = null;
  let originalEl = null;
  let customBg = "#202020"; // Default background color
  let spinnerColor = "#fff"; // Default spinner color

  screens.forEach((el) => {
    const styleClass = Array.from(el.classList).find((c) =>
      c.startsWith("scr-")
    );
    if (!styleClass) return;

    const folderName = styleClass.replace("scr-", "");

    // Detect size class (default to "large")
    const sizeClass = Array.from(el.classList).find((c) => c.startsWith("s-"));
    const size = sizeClass ? sizeClass.replace("s-", "") : "large";

    if (folderName !== "blank") {
      const styleKey = `${folderName}-${size}`;
      if (!addedStyles.has(styleKey)) {
        addedStyles.add(styleKey);
        const url = `https://raw.githubusercontent.com/DevKittyJS/API/main/ldscr/${folderName}/spinner_${size}.css?v=${version}`;
        fetch(url)
          .then((res) => {
            if (!res.ok) throw new Error(`Failed to load: ${url}`);
            return res.text();
          })
          .then((cssText) => {
            styleSheet.appendChild(document.createTextNode(cssText));
            console.log(`Screen style "${folderName}" [${size}] applied.`);
          })
          .catch((err) => {
            console.warn(
              `Could not load screen style "${folderName}" [${size}]:`,
              err
            );
          });
      }
    }

    if (!spinnerEl) {
      spinnerEl = el.cloneNode(true);
      originalEl = el;

      // Detect bg color class "bg-"
      const bgClass = Array.from(el.classList).find((c) => c.startsWith("bg-"));
      if (bgClass) {
        customBg = decodeURIComponent(bgClass.replace("bg-", ""));
      }

      // Detect spinner color class "col-"
      const colClass = Array.from(el.classList).find((c) =>
        c.startsWith("col-")
      );
      if (colClass) {
        spinnerColor = decodeURIComponent(colClass.replace("col-", ""));
      }
    }
  });

  // Inject overlay
  if (spinnerEl) {
    const overlay = document.createElement("div");
    overlay.id = overlayId;
    overlay.style.background = customBg;
    overlay.appendChild(spinnerEl);
    document.body.appendChild(overlay);

    // Remove the original element immediately to prevent layout issues
    if (originalEl && originalEl.parentNode) {
      originalEl.parentNode.removeChild(originalEl);
    }

    const overlayStyles = `
#${overlayId} {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity 0.5s ease;
}

/* Override spinner color variable */
#${overlayId} .dk-ldscr {
  --bg-color: ${spinnerColor};
}
`;
    styleSheet.appendChild(document.createTextNode(overlayStyles));

    // Prevent scroll
    document.body.style.overflow = "hidden";

    // Remove overlay and cleanup on window load
    window.addEventListener("load", () => {
      setTimeout(() => {
        overlay.style.opacity = "0";

        setTimeout(() => {
          overlay.remove();
          if (styleSheet && styleSheet.parentNode) styleSheet.remove();
          document.body.style.overflow = "";
        }, 500);
      }, 1000);
    });
  }
}

function loadIcons() {
  const styleSheetId = "DevKittyIcons";
  const iconsBaseUrl =
    "https://raw.githubusercontent.com/DevKittyJS/API/main/icons";
  const version = Date.now(); // Cache busting

  let styleSheet = document.getElementById(styleSheetId);
  if (!styleSheet) {
    styleSheet = document.createElement("style");
    styleSheet.id = styleSheetId;
    document.head.appendChild(styleSheet);
  }
  styleSheet.textContent = ""; // Clear previous styles

  const addedIcons = new Set();

  // Base styles for all icons — with dk- prefixed utility classes
  const baseStyles = `
    .dk_ico {
      display: inline-block;
      width: 1em;
      height: 1em;
      background-color: currentColor;
      -webkit-mask-repeat: no-repeat;
              mask-repeat: no-repeat;
      -webkit-mask-size: contain;
              mask-size: contain;
      -webkit-mask-position: center;
              mask-position: center;
      vertical-align: middle;
      transition: transform 0.3s linear;
      color: currentColor;
    }

    .dk_ico.dk-fw {
      width: 1.25em;
      text-align: center;
    }

    .dk_ico.dk-xs { font-size: 0.75em; }
    .dk_ico.dk-sm { font-size: 0.875em; }
    .dk_ico.dk-lg { font-size: 1.33em; }
    .dk_ico.dk-2x { font-size: 2em; }
    .dk_ico.dk-3x { font-size: 3em; }
    .dk_ico.dk-4x { font-size: 4em; }
    .dk_ico.dk-5x { font-size: 5em; }

    .dk_ico.dk-pull-left { float: left; margin-right: 0.3em; }
    .dk_ico.dk-pull-right { float: right; margin-left: 0.3em; }

    .dk_ico.dk-rotate-90 { transform: rotate(90deg); }
    .dk_ico.dk-rotate-180 { transform: rotate(180deg); }
    .dk_ico.dk-rotate-270 { transform: rotate(270deg); }

    .dk_ico.dk-flip-horizontal { transform: scaleX(-1); }
    .dk_ico.dk-flip-vertical { transform: scaleY(-1); }

    @keyframes dk-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .dk_ico.dk-spin {
      animation: dk-spin 2s linear infinite;
    }

    @keyframes dk-pulse {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .dk_ico.dk-pulse {
      animation: dk-pulse 1s steps(8) infinite;
    }

    .dk_ico.dk-inverse {
      filter: invert(1) grayscale(100%) brightness(200%);
    }
  `;
  styleSheet.appendChild(document.createTextNode(baseStyles));

  function supportsMask() {
    return (
      CSS.supports("mask-image", "url('dummy.svg')") ||
      CSS.supports("-webkit-mask-image", "url('dummy.svg')")
    );
  }

  if (!supportsMask()) {
    console.error("[DevKitty] Masking not supported. Removing icons.");
    document.querySelectorAll(".dk_ico").forEach((el) => el.remove());
    return;
  }

  const icons = document.querySelectorAll(".dk_ico");

  icons.forEach((el) => {
    const iconClass = Array.from(el.classList).find((c) => c.startsWith("i-"));
    if (!iconClass) return;

    const iconName = iconClass.slice(2);

    const folderClass = Array.from(el.classList).find(
      (c) => c.startsWith("dk-") && c !== "dk_ico"
    );
    if (!folderClass) {
      console.warn(`[DevKitty] Icon "${iconName}" is missing a folder class.`);
      return;
    }

    const folderName = folderClass.slice(3);
    const cacheKey = `${folderName}/${iconName}`;

    if (addedIcons.has(cacheKey)) return;
    addedIcons.add(cacheKey);

    const url = `${iconsBaseUrl}/${folderName}/${iconName}.svg?v=${version}`;
    const iconRule = `
      .dk_ico.${folderClass}.i-${iconName} {
        -webkit-mask-image: url('${url}');
                mask-image: url('${url}');
      }
    `;
    styleSheet.appendChild(document.createTextNode(iconRule));
    console.log(`[DevKitty] Icon loaded: ${url}`);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadScreens();
  loadIcons();
});


