import { message } from "./message.js";

window["NAVSPA-V2"]["esm-test"] = {
    mount(element) {
        element.innerHTML = `<p class="APP_ESM_OK">${message}</p>`;
    },
    unmount(element) {
        element.innerHTML = '';
    }
};
