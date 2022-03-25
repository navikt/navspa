import { message } from "./message.js";

window["NAVSPA-V2"]["esm-test"] = {
    mount(element) {
        element.innerHTML = `<h1>${message}</h1>`;
    },
    unmount(element) {
        element.innerHTML = '';
    }
};
