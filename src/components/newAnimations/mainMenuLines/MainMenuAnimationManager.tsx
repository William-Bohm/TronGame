// AnimationManager.ts
type AnimationCallback = (timestamp: number) => void;

class AnimationManager {
    private static instance: AnimationManager;
    private animations: Map<string, AnimationCallback> = new Map();
    private isRunning: boolean = false;

    private constructor() {
        this.animate = this.animate.bind(this);
    }

    static getInstance() {
        if (!AnimationManager.instance) {
            AnimationManager.instance = new AnimationManager();
        }
        return AnimationManager.instance;
    }

    addAnimation(id: string, callback: AnimationCallback) {
        this.animations.set(id, callback);
        if (!this.isRunning) {
            this.isRunning = true;
            requestAnimationFrame(this.animate);
        }
    }

    removeAnimation(id: string) {
        this.animations.delete(id);
        if (this.animations.size === 0) {
            this.isRunning = false;
        }
    }

    private animate(timestamp: number) {
        this.animations.forEach(callback => callback(timestamp));

        if (this.animations.size > 0) {
            requestAnimationFrame(this.animate);
        } else {
            this.isRunning = false;
        }
    }
}

export default AnimationManager;