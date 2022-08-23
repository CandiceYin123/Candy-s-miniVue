import { effectWatch } from "./reactivity/index.js";
export function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            const context = rootComponent.setup();

            effectWatch(() => {
                const element = rootComponent.render(context);
                rootContainer.append(element);
            })
        }
    }
}