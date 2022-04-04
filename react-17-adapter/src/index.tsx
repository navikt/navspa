import { ReactElement } from "react";
import { render, unmountComponentAtNode, Container } from "react-dom";
import { ReactAdapter } from "@navikt/navspa";

export class React17Adapter implements ReactAdapter {
    render<P>(component: ReactElement<P>, element: Container | null): void {
        render(component, element)
    }

    unmount<P>(element: HTMLElement): void {
        unmountComponentAtNode(element);
    }
}