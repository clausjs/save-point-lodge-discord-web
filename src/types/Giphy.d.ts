import { IGif } from '@giphy/js-types';

export interface AnimatedIGif extends IGif {
    animated_text_style?: string;
}