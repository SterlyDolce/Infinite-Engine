import { IUGButton, IUGCanvas, IUGImage, IUGLabel, IUGContainer, IUGColumn, IUGRow } from '../Global/IUD.js';



class IEuiLibrary {
    constructor() {

    }

    getItem(name) {
        switch (name) {
            case 'IUGButton':
                return new IUGButton('center', 200, 80)
            case 'IUGLabel':
                const text = new IUGLabel("center", { text: `Text`, fontHeight: 32, color: '#ffffff', variant: 'normal' });
                text.autoResize = false
                text.width = 300
                text.height = 160
                return text

            case 'IUGCanvas':
                return new IUGCanvas('center', 200, 200);

            case 'IUGImage':
                return new IUGImage('center', 200, 200)

            case 'IUGContainer':
                return new IUGContainer('center', 800, 600)

            case 'IUGColumn':
                return new IUGColumn('center', 400, 800)
            case 'IUGRow':
                return new IUGRow('center', 400, 800)

            default:
                break;
        }
    }
}

export default IEuiLibrary