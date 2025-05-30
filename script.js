function loadIcons() {
  const icons = document.querySelectorAll(".dk_ico");
  const styleSheetId = "DevKitty";

  let styleSheet = document.getElementById(styleSheetId);
  if (!styleSheet) {
    styleSheet = document.createElement("style");
    styleSheet.id = styleSheetId;
    document.head.appendChild(styleSheet);
  }
  styleSheet.textContent = "";

  const addedIcons = new Set();

  const supportsMask =
    CSS.supports("mask-image", "url('dummy.svg')") ||
    CSS.supports("-webkit-mask-image", "url('dummy.svg')");

  if (!supportsMask) {
    console.warn("DevKitty icons not supported in this browser.");
    icons.forEach((el) => el.remove());
    return;
  }

  icons.forEach((el) => {
    const iconClass = Array.from(el.classList).find((c) => c.startsWith("i-"));
    if (!iconClass) return;

    const iconName = iconClass.replace("i-", "");

    const folderClass = Array.from(el.classList).find(
      (c) => c.startsWith("dk-") && c !== "dk_ico"
    );
    if (!folderClass) {
      console.warn(
        `Icon "${iconName}" has no folder class like dk-core, dk-brands, or dk-misc.`
      );
      return;
    }

    const folderName = folderClass.replace("dk-", "");

    if (addedIcons.has(`${folderName}/${iconName}`)) return;
    addedIcons.add(`${folderName}/${iconName}`);

    const url = `https://raw.githubusercontent.com/DevKittyJS/API/main/icons/${folderName}/${iconName}.svg`;

    const cssRule = `
.dk_ico.${folderClass}.i-${iconName} {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: currentColor;
  -webkit-mask-image: url('${url}');
          mask-image: url('${url}');
  -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
  -webkit-mask-size: contain;
          mask-size: contain;
  -webkit-mask-position: center;
          mask-position: center;
}
`;

    styleSheet.appendChild(document.createTextNode(cssRule));
    console.log(`Icon style for "${folderName}/${iconName}" added`);
  });
}

document.addEventListener("DOMContentLoaded", loadIcons);
